/**
 * 全站布局体检：在多个视口宽度下扫「横向溢出」。
 *
 * 为什么用 scrollWidth 而不是截图：
 * 横向溢出在桌面看不出来，在手机上直接截断内容；而截图又会因为
 * `--window-size` 不应用移动端 viewport 而骗人（踩过这个坑）。
 * `document.documentElement.scrollWidth` 超出视口宽度才是硬判据。
 *
 * 用法：
 *   node scripts/check-layout.mjs [baseUrl]
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = (process.argv[2] ?? "http://127.0.0.1:9020/dsh-guide").replace(/\/$/, "");
const PORT = 9346;
const WIDTHS = [360, 390, 768, 1280];
const PAGES = [
  { name: "首页", url: `${BASE}/` },
  ...Array.from({ length: 23 }, (_, i) => ({
    name: `第 ${i + 1} 节`,
    url: `${BASE}/u/${i + 1}/`,
  })),
];

const EDGE = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].find(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect(dir) {
  const edge = spawn(
    EDGE,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${dir}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let target = null;
  for (let i = 0; i < 60 && !target; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      target = list.find((t) => t.type === "page") ?? null;
    } catch {
      /* not up yet */
    }
    if (!target) await sleep(400);
  }
  if (!target) throw new Error("连不上调试端口");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = (id += 1);
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  return { edge, ws, send };
}

const OVERFLOW_JS = `(() => {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  if (sw <= vw + 1) return { over: 0, vw, sw, worst: [] };
  const worst = [];
  for (const el of document.querySelectorAll('body *')) {
    const b = el.getBoundingClientRect();
    if (b.width === 0 && b.height === 0) continue;
    const d = Math.round(b.right - vw);
    if (d > 1) {
      worst.push({
        d,
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 50),
        txt: (el.textContent || '').trim().slice(0, 22),
      });
    }
  }
  worst.sort((a, b) => b.d - a.d);
  return { over: sw - vw, vw, sw, worst: worst.slice(0, 4) };
})()`;

async function main() {
  const results = [];
  let session = null;
  let dir = null;

  const restart = async () => {
    if (session) {
      session.ws.close();
      session.edge.kill();
      await sleep(600);
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
    dir = mkdtempSync(join(tmpdir(), "dsh-layout-"));
    session = await connect(dir);
  };

  await restart();
  let n = 0;

  for (const w of WIDTHS) {
    console.log(`\n=== 视口 ${w}px ===`);
    for (const p of PAGES) {
      n += 1;
      // 每 8 次导航换一个浏览器进程，避免长时间运行退化
      if (n % 8 === 0) await restart();

      await session.send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: 900,
        deviceScaleFactor: 1,
        mobile: w < 700,
      });
      await session.send("Page.navigate", { url: p.url });
      await sleep(w < 700 ? 2600 : 2200);
      const r = await session.send("Runtime.evaluate", {
        expression: OVERFLOW_JS,
        returnByValue: true,
      });
      const v = r.result?.result?.value;
      if (!v) {
        console.log(`  ${p.name.padEnd(8)} 取值失败`);
        continue;
      }
      results.push({ w, page: p.name, ...v });
      if (v.over > 1) {
        console.log(`  !! ${p.name.padEnd(8)} scrollWidth ${v.sw} > 视口 ${v.vw}（溢出 ${v.over}px）`);
        for (const o of v.worst) {
          console.log(`       +${o.d}px <${o.tag}> ${o.cls}  「${o.txt}」`);
        }
      } else {
        console.log(`  OK ${p.name.padEnd(8)} ${v.vw}px`);
      }
    }
  }

  session.ws.close();
  session.edge.kill();
  await sleep(500);
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }

  const bad = results.filter((r) => r.over > 1);
  console.log(
    `\n合计 ${results.length} 次检查（${PAGES.length} 页 × ${WIDTHS.length} 个宽度），横向溢出 ${bad.length} 次`,
  );
  if (bad.length) {
    console.log("溢出清单：");
    for (const b of bad) console.log(`  ${b.w}px  ${b.page}  溢出 ${b.over}px`);
    process.exit(1);
  }
  console.log("所有页面在所有宽度下都没有横向溢出。");
}

main().catch((e) => {
  console.error("出错：", e.message);
  process.exit(2);
});
