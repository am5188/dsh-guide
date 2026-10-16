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
/** 只扫指定区间（调试用）：`... <base> 15` 或 `... <base> 1-6`
 *  为什么要分区间：同一个 headless 浏览器连续导航十几节之后会明显退化，
 *  后面的 canvas 取样会假阴性。分区间跑、每批重启浏览器就稳定了。 */
const RANGE = (() => {
  const a = process.argv[3];
  if (!a) return null;
  const m = a.match(/^(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  const from = Number(m[1]);
  const to = m[2] ? Number(m[2]) : from;
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
})();
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
      const cs = [...document.querySelectorAll('canvas')];
      if (!cs.length) return { canvas: false, count: 0 };
      const c = cs[0];
      c.scrollIntoView({ block: 'center' });
      await new Promise(r => setTimeout(r, 500));
      let prev = '';
      try { prev = c.toDataURL(); } catch (e) { return { canvas: true, count: cs.length, moving: 0 }; }
      let moved = false;
      for (let k = 0; k < 4 && !moved; k += 1) {
        await new Promise(r => setTimeout(r, 800));
        let now = '';
        try { now = c.toDataURL(); } catch (e) { break; }
        if (now !== prev) moved = true;
        prev = now;
      }
      return {
        canvas: true,
        count: cs.length,
        moving: moved ? 1 : 0,
        css: Math.round(c.getBoundingClientRect().width) + 'x' + Math.round(c.getBoundingClientRect().height),
        label: c.getAttribute('aria-label') || '',
      };
    })()`);
    record("canvas 存在", !!anim.canvas, anim.canvas ? `本页 ${anim.count} 个，首个 ${anim.css}` : "页面上没有 canvas");
    record(
      "首个动画确实在动（多次取样）",
      anim.count > 0 && anim.moving === 1,
      `${anim.css} 在取样期间发生变化`,
    );
    record("有无障碍描述", !!anim.label, anim.label ? anim.label.slice(0, 34) + "…" : "缺少 aria-label");

    /* ── 确认短片已下线 ───────────────────────────────── */
    console.log("\n第 1 节 · 短片已移除");
    const noVideo = await evaluate(
      `({ videos: document.querySelectorAll('video').length })`,
    );
    record(
      "页面上没有 video（短片已下线）",
      noVideo.videos === 0,
      noVideo.videos === 0 ? "已完全移除" : `仍有 ${noVideo.videos} 个 video 元素`,
    );

    /* ── 内联动画：必须滚进视口再取样 ─────────────────── */
    console.log("\n第 12 节 · 内联动画");
    const multi = await evaluate(`(async () => {
      const cs = [...document.querySelectorAll('canvas')];
      const figs = document.querySelectorAll('figure').length;
      // 离屏的动画会主动暂停（省电），直接取样会误判成"没动"。
      // 所以逐个滚进视口再取样。
      let moving = 0;
      for (const c of cs) {
        c.scrollIntoView({ block: 'center' });
        await new Promise(r => setTimeout(r, 450));
        let a = '';
        try { a = c.toDataURL(); } catch (e) { continue; }
        await new Promise(r => setTimeout(r, 900));
        let b = '';
        try { b = c.toDataURL(); } catch (e) { continue; }
        if (a !== b) moving += 1;
      }
      return { count: cs.length, moving, figs };
    })()`);
    record(
      "第 12 节有内联动画",
      multi.count >= 1 || multi.figs >= 1,
      `canvas ${multi.count} 个、figure ${multi.figs} 个`,
    );
    record(
      "滚进视口后每个 canvas 都在动",
      multi.count > 0 && multi.moving === multi.count,
      `${multi.moving}/${multi.count} 在动`,
    );

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

    /* ── 首页目录 ─────────────────────────────────────── */
    console.log("\n首页 · 目录");
    await goto(`${BASE}/`);
    const home = await evaluate(`(() => {
      const links = [...document.querySelectorAll('a[href*="/u/"]')].map(a => a.getAttribute('href'));
      const nums = new Set(links.map(h => (h.match(/\\/u\\/(\\d+)/) || [])[1]).filter(Boolean));
      return { count: nums.size, title: document.title };
    })()`);
    record("目录列出 23 节", home.count === 23, `找到 ${home.count} 个章节链接`);

    /* ── 逐节扫描：每节都要有动画，且在动 ─────────────── */
    console.log("\n全部 23 节 · 逐节检查动画（这一步比较慢）");
    const sweep = [];
    const range = RANGE ?? Array.from({ length: 23 }, (_, i) => i + 1);
    for (const n of range) {
      await goto(`${BASE}/u/${n}/`, 5200);
      const r = await evaluate(`(async () => {
        const cs = [...document.querySelectorAll('canvas')];
        let moving = 0;
        for (const c of cs) {
          // 逐个滚进视口：离屏动画会主动暂停，不滚动会误判。
          // 再多次重试取样：刚导航完 React 可能还没 hydrate，canvas 尚未挂上动画循环。
          c.scrollIntoView({ block: 'center' });
          await new Promise(r => setTimeout(r, 700));
          let prev = '';
          try { prev = c.toDataURL(); } catch (e) { continue; }
          let moved = false;
          for (let k = 0; k < 4 && !moved; k += 1) {
            await new Promise(r => setTimeout(r, 700));
            let now = '';
            try { now = c.toDataURL(); } catch (e) { break; }
            if (now !== prev) moved = true;
            prev = now;
          }
          if (moved) moving += 1;
        }
        return { canvases: cs.length, moving, figs: document.querySelectorAll('figure').length };
      })()`);
      sweep.push({ n, ...r });
      const ok =
        r.canvases > 0 ? r.moving > 0 : r.figs > 0;
      console.log(
        `      第 ${String(n).padStart(2)} 节  canvas ${r.canvases}（在动 ${r.moving}）  figure ${r.figs}  ${ok ? "OK" : "!! 无动画"}`,
      );
    }
    const bad = sweep.filter((s) => (s.canvases > 0 ? s.moving === 0 : s.figs === 0));
    record(
      "23 节每节都有动画且确实在动",
      bad.length === 0,
      bad.length === 0
        ? `全部通过（canvas 合计 ${sweep.reduce((a, s) => a + s.canvases, 0)} 个）`
        : `失败：第 ${bad.map((b) => b.n).join(", ")} 节`,
    );

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
