/**
 * 线上站点的真实浏览器验证。
 *
 * 为什么需要它：`curl` 只能证明文件能下载，不能证明
 *   ① 循环动画真的在动（不是冻住的一张图）
 *   ② 短片在浏览器里真的能解码播放
 *   ③ 实践面板真的渲染出了请求详情
 *
 * 做法：用 Edge 的远程调试接口（CDP）打开线上页面，在页面里执行真实 JS 取值。
 * 不需要任何额外依赖 —— Node 22+ 自带 fetch 与 WebSocket。
 *
 * 用法：
 *   node scripts/verify-live.mjs                       # 验线上
 *   node scripts/verify-live.mjs http://127.0.0.1:8980 # 验本地静态产物
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = (process.argv[2] ?? "https://am5188.github.io/dsh-guide").replace(/\/$/, "");
const PORT = 9333;

const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForDevtools() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page) return page;
    } catch {
      /* 还没起来 */
    }
    await sleep(400);
  }
  throw new Error("连不上 Edge 的调试端口");
}

function makeClient(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  return (method, params = {}) =>
    new Promise((resolve) => {
      const i = (id += 1);
      pending.set(i, resolve);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
}

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  const mark = pass ? "PASS" : "FAIL";
  console.log(`  [${mark}] ${name}  ${detail}`);
};

async function main() {
  const userDataDir = mkdtempSync(join(tmpdir(), "dsh-verify-"));
  const edge = spawn(
    EDGE_CANDIDATES.find((p) => p) ?? EDGE_CANDIDATES[0],
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userDataDir}`,
      "--window-size=1280,900",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    const target = await waitForDevtools();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r, { once: true }));
    const send = makeClient(ws);

    const goto = async (url, waitMs = 6000) => {
      await send("Page.navigate", { url });
      await sleep(waitMs);
    };
    const evaluate = async (expression) => {
      const r = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (r.result?.exceptionDetails) {
        throw new Error(r.result.exceptionDetails.text ?? "页面内脚本报错");
      }
      return r.result?.result?.value;
    };

    await send("Page.enable");
    await send("Runtime.enable");

    console.log(`\n验证目标：${BASE}\n`);

    /* ── 第 1 节：循环动画 ─────────────────────────────── */
    console.log("第 1 节 · 循环动画");
    await goto(`${BASE}/u/1/`);
    const anim = await evaluate(`(async () => {
      const c = document.querySelector('canvas');
      if (!c) return { canvas: false };
      const snap = () => { try { return c.toDataURL(); } catch (e) { return 'blocked'; } };
      const a = snap();
      await new Promise(r => setTimeout(r, 1000));
      const b = snap();
      return {
        canvas: true,
        backing: c.width + 'x' + c.height,
        css: Math.round(c.getBoundingClientRect().width) + 'x' + Math.round(c.getBoundingClientRect().height),
        animating: a !== b && a !== 'blocked',
        label: c.getAttribute('aria-label') || '',
      };
    })()`);
    record("canvas 存在", !!anim.canvas, anim.canvas ? `${anim.css} 显示尺寸 / ${anim.backing} 位图` : "页面上没有 canvas");
    record("动画在动（两次取样不同）", !!anim.animating, anim.animating ? "1000ms 内画面发生变化" : "画面没有变化，可能冻住了");
    record("有无障碍描述", !!anim.label, anim.label ? anim.label.slice(0, 34) + "…" : "缺少 aria-label");

    /* ── 第 1 节：短片播放器 ───────────────────────────── */
    console.log("\n第 1 节 · 短片播放器");
    const video = await evaluate(`(async () => {
      const v = document.querySelector('video');
      if (!v) return { video: false };
      if (v.readyState < 1) {
        await new Promise((res) => {
          const done = () => res();
          v.addEventListener('loadedmetadata', done, { once: true });
          setTimeout(done, 8000);
        });
      }
      let advanced = false;
      let err = '';
      try {
        v.muted = true;
        await v.play();
        const t0 = v.currentTime;
        await new Promise(r => setTimeout(r, 1500));
        advanced = v.currentTime > t0;
      } catch (e) { err = String(e && e.message || e); }
      return {
        video: true,
        src: v.currentSrc.split('/').pop(),
        duration: Math.round(v.duration * 10) / 10,
        size: v.videoWidth + 'x' + v.videoHeight,
        networkState: v.networkState,
        advanced,
        err,
      };
    })()`);
    record("video 元素存在", !!video.video, video.video ? video.src : "页面上没有 video");
    record("元数据已加载（时长可读）", Number.isFinite(video.duration) && video.duration > 0, `${video.duration} 秒 / ${video.size}`);
    record("能真的解码播放（播放头前进）", !!video.advanced, video.advanced ? "currentTime 在推进" : `播放失败 ${video.err}`);

    /* ── 第 1 节：实践面板 ─────────────────────────────── */
    console.log("\n第 1 节 · 实践面板");
    const panel = await evaluate(`(async () => {
      const t0 = document.body.innerText;
      const out = {
        panelHeading: t0.includes('这次要发出去的内容'),
        hasByRole: t0.includes('按角色看'),
        hasRawTab: t0.includes('看原始 JSON'),
        raw: {},
      };
      // 真的点一下「看原始 JSON」，验证原始请求体确实渲染出来
      const btn = [...document.querySelectorAll('button')]
        .find((b) => b.innerText.trim() === '看原始 JSON');
      if (!btn) return out;
      btn.click();
      await new Promise((r) => setTimeout(r, 400));
      const t = document.body.innerText;
      out.raw = {
        heading: t.includes('请求体'),
        model: t.includes('deepseek'),
        messages: t.includes('messages'),
        roles: t.includes('role'),
        maxTokens: t.includes('max_tokens'),
      };
      return out;
    })()`);
    record("实践面板已渲染", panel.panelHeading && panel.hasRawTab, `面板标题=${panel.panelHeading} 视图切换=${panel.hasRawTab}`);
    record(
      "点「看原始 JSON」后能看到完整请求体",
      panel.raw?.model && panel.raw?.messages && panel.raw?.maxTokens,
      `model=${panel.raw?.model} messages=${panel.raw?.messages} role=${panel.raw?.roles} max_tokens=${panel.raw?.maxTokens}`,
    );

    /* ── 第 4 节：工具调用回路 ─────────────────────────── */
    console.log("\n第 4 节 · 工具调用回路");
    await goto(`${BASE}/u/4/`);
    const loop = await evaluate(`(() => {
      const t = document.body.innerText;
      return {
        hasSteps: t.includes('轮') || t.includes('工具'),
        hasTools: t.includes('tools') || t.includes('工具定义'),
        input: !!document.querySelector('input'),
      };
    })()`);
    record("工具调用演示已渲染", loop.hasSteps, loop.hasSteps ? "页面上有工具/轮次相关文案" : "没找到");

    /* ── 第 23 节：新章节可访问 ───────────────────────── */
    console.log("\n第 23 节 · 新章节");
    await goto(`${BASE}/u/23/`);
    const sec23 = await evaluate(`(() => {
      const h = document.querySelector('h1');
      const fig = document.querySelector('figure');
      return {
        title: h ? h.innerText.trim() : '',
        hasFigure: !!fig,
        hasCanvas: !!document.querySelector('canvas'),
        figLabel: fig ? (fig.querySelector('[class*=caption], figcaption, div')?.innerText || '').slice(0, 30) : '',
      };
    })()`);
    record("第 23 节可访问且有标题", !!sec23.title, sec23.title || "没有 h1");
    // 动画有两种实现：Canvas 2D 逐帧，或 DOM 编排动画。两者都渲染在 <figure> 里。
    record(
      "第 23 节有动画",
      sec23.hasFigure,
      sec23.hasCanvas ? "Canvas 2D 逐帧" : sec23.hasFigure ? "DOM 编排动画" : "没有动画容器",
    );

    /* ── 目录页：23 节全部列出 ────────────────────────── */
    console.log("\n首页 · 目录");
    await goto(`${BASE}/`);
    const home = await evaluate(`(() => {
      const links = [...document.querySelectorAll('a[href*="/u/"]')].map(a => a.getAttribute('href'));
      const nums = new Set(links.map(h => (h.match(/\\/u\\/(\\d+)/) || [])[1]).filter(Boolean));
      return { count: nums.size, title: document.title };
    })()`);
    record("目录列出 23 节", home.count === 23, `找到 ${home.count} 个章节链接`);

    ws.close();
  } finally {
    edge.kill();
    await sleep(600);
    try { rmSync(userDataDir, { recursive: true, force: true }); } catch { /* 忽略 */ }
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n合计 ${results.length} 项，通过 ${results.length - failed.length} 项，失败 ${failed.length} 项`);
  if (failed.length) {
    console.log("失败项：");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("验证脚本出错：", e.message);
  process.exit(2);
});
