/**
 * 找出「把页面撑得比视口还宽」的元素。
 *
 * 横向溢出在移动端特别难发现：桌面看不出来，手机上内容直接被截断。
 * 这个脚本在指定视口宽度下打开页面，列出所有右边缘超出视口的元素。
 *
 * 用法：node scripts/find-overflow.mjs [url] [宽度] [高度]
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_ = process.argv[2] ?? "http://127.0.0.1:9009/dsh-guide/u/12/";
const W = Number(process.argv[3] ?? 390);
const H = Number(process.argv[4] ?? 1200);
const PORT = 9345;

const EDGE = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].find(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const dir = mkdtempSync(join(tmpdir(), "dsh-of-"));
  const edge = spawn(
    EDGE,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${dir}`,
      `--window-size=${W},${H}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  try {
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

    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: W,
      height: H,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await send("Page.navigate", { url: URL_ });
    await sleep(6000);

    const r = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const vw = document.documentElement.clientWidth;
        const out = [];
        for (const el of document.querySelectorAll('body *')) {
          const b = el.getBoundingClientRect();
          if (b.width === 0 && b.height === 0) continue;
          const over = Math.round(b.right - vw);
          if (over > 1) {
            out.push({
              over,
              w: Math.round(b.width),
              tag: el.tagName.toLowerCase(),
              cls: (el.className || '').toString().slice(0, 70),
              txt: (el.textContent || '').trim().slice(0, 26),
            });
          }
        }
        // 只留「最外层」的溢出元素：父元素没溢出而它溢出的那种
        const keys = new Set(out.map(o => o.tag + '|' + o.cls + '|' + o.over));
        return {
          vw,
          scrollW: document.documentElement.scrollWidth,
          bodyScrollW: document.body.scrollWidth,
          count: out.length,
          top: out.sort((a,b)=>b.over-a.over).slice(0, 14),
        };
      })()`,
    });
    const v = r.result?.result?.value;
    console.log(`视口 ${v.vw}px   文档 scrollWidth ${v.scrollW}px   body ${v.bodyScrollW}px`);
    console.log(`右边缘超出视口的元素：${v.count} 个\n`);
    for (const o of v.top) {
      console.log(`  +${String(o.over).padStart(4)}px  宽 ${String(o.w).padStart(4)}  <${o.tag}>  ${o.cls}`);
      if (o.txt) console.log(`            「${o.txt}」`);
    }

    // 顺手截一张**正确应用了移动端 viewport** 的图。
    // 注意：不能用 msedge --window-size=390 截移动端 —— 那样不会应用
    // width=device-width，页面会按桌面宽度排版，截图只截到左边一条，
    // 看起来像"横向溢出"，其实是截图方式错的。
    const shot = process.argv[5];
    if (shot) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: W,
        height: H,
        deviceScaleFactor: 2,
        mobile: true,
      });
      await sleep(1200);
      const cap = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
      });
      const { writeFileSync } = await import("node:fs");
      writeFileSync(shot, Buffer.from(cap.result.data, "base64"));
      console.log(`\n已保存移动端截图：${shot}`);
    }

    ws.close();
  } finally {
    edge.kill();
    await sleep(500);
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

main().catch((e) => {
  console.error("出错：", e.message);
  process.exit(1);
});
