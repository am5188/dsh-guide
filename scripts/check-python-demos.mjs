/**
 * 检查 Python 演示与工具调用演示里的 max_tokens 是否够用。
 *
 * 背景：check-demos.mjs 只覆盖了 JS 演示。书里还有 3 条 Python 演示
 * 和 1 条工具调用演示，它们在自己的代码里写死了 max_tokens ——
 * 同样的坑（思考 token 吃满额度、正文为空）在这里也会发生。
 *
 * 做法：从 Python 代码里抠出 messages 与 max_tokens，用真实 API 跑一遍。
 *
 * 用法：
 *   $env:DSH_KEY = (Get-Content D:\Work\.secrets\dsh-guide-test-key.txt -Raw).Trim()
 *   node scripts/check-python-demos.mjs [--dry]
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const KEY = process.env.DSH_KEY;
const DRY = process.argv.includes("--dry");
const DIR = "src/content/units";
const ENDPOINT = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-flash";

/** 抠出 `max_tokens: N` 与所有 `"role": "x", "content": "y"` */
function extract(file) {
  const t = readFileSync(join(DIR, file), "utf8");
  const out = [];
  // 按 demo 切块：id: "xxx" 之后到下一个 id 或文件尾
  const blocks = [...t.matchAll(/id:\s*"([^"]+)"[\s\S]*?(?=\n\s*id:\s*"|$)/g)];
  for (const b of blocks) {
    const body = b[0];
    const mt = body.match(/"max_tokens":\s*(\d+)/);
    if (!mt) continue;
    const msgs = [];
    // content 有两种写法：直接是字符串，或括号里若干相邻字符串字面量拼接
    const msgRe =
      /"role":\s*"(\w+)",\s*"content":\s*(?:"((?:[^"\\]|\\.)*)"|\(([\s\S]*?)\))/g;
    for (const m of body.matchAll(msgRe)) {
      let raw;
      if (m[2] !== undefined) {
        raw = m[2];
      } else {
        raw = [...m[3].matchAll(/"((?:[^"\\]|\\.)*)"/g)]
          .map((x) => x[1])
          .join("");
      }
      msgs.push({
        role: m[1],
        content: raw
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\"),
      });
    }
    if (!msgs.length) continue;
    out.push({ id: b[1], maxTokens: Number(mt[1]), msgs });
  }
  return out;
}

async function run(d) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: d.msgs,
      max_tokens: d.maxTokens,
    }),
  });
  if (!res.ok) return { err: `HTTP ${res.status}` };
  const j = await res.json();
  return {
    finish: j.choices?.[0]?.finish_reason,
    chars: [...(j.choices?.[0]?.message?.content ?? "")].length,
    reasoning: j.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
  };
}

const all = [];
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".tsx")).sort()) {
  for (const d of extract(f)) all.push({ no: Number(f.slice(0, 2)), file: f, ...d });
}

if (DRY) {
  for (const d of all) {
    console.log(
      `第 ${String(d.no).padStart(2)} 节  ${d.id.padEnd(14)} max_tokens=${String(d.maxTokens).padStart(5)}  messages=${d.msgs.length} 条  最后一条：${d.msgs[d.msgs.length - 1].content.slice(0, 30)}`,
    );
  }
  console.log(`\n合计 ${all.length} 条`);
  process.exit(0);
}

if (!KEY) {
  console.error("缺少 DSH_KEY（只抽取可加 --dry）");
  process.exit(1);
}

let empty = 0;
for (const d of all) {
  const r = await run(d);
  const bad = r.chars === 0;
  if (bad) empty += 1;
  console.log(
    `第 ${String(d.no).padStart(2)} 节  ${bad ? "!!" : "OK"}  ${d.id.padEnd(14)} max=${String(d.maxTokens).padStart(5)} 思考 ${String(r.reasoning).padStart(5)} finish=${String(r.finish).padEnd(6)} 正文 ${String(r.chars).padStart(4)} 字`,
  );
}
console.log(`\n合计 ${all.length} 条；正文为空 ${empty} 条`);
if (empty) process.exit(1);
