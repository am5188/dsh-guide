/**
 * 把全书所有演示提示词真的跑一遍。
 *
 * 为什么需要：指南里每个演示都承诺「输出是模型此刻的真实回答」。
 * 如果有人写过一条在 max_tokens 下会返回空正文的提示词，
 * 读者点下去只会看到一片空白 —— 那是最伤信任的一种错。
 *
 * 用法（密钥只从环境变量读，不落盘、不打印）：
 *   $env:DSH_KEY = (Get-Content D:\Work\.secretsssh-guide-test-key.txt -Raw).Trim()
 *   node scripts/check-demos.mjs [起始节] [结束节]
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const KEY = process.env.DSH_KEY;
const DRY = process.argv.includes("--dry");

const DIR = "src/content/units";
const ENDPOINT = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-flash";

const from = Number(process.argv[2] ?? 1);
const to = Number(process.argv[3] ?? 23);
/** --override=16000 忽略文件里的 maxTokens，统一用一个值压测 */
const OVERRIDE = (() => {
  const a = process.argv.find((x) => x.startsWith("--override="));
  return a ? Number(a.split("=")[1]) : null;
})();
/** --only=4,6,21 只测这几节 */
const ONLY = (() => {
  const a = process.argv.find((x) => x.startsWith("--only="));
  return a ? a.split("=")[1].split(",").map(Number) : null;
})();

/** 把 TSX 里的字符串字面量还原成真实文本（双引号与单引号两种写法都要认） */
function unescape(s) {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
}

/**
 * 从一节的文件里抠出所有 demos 条目。
 *
 * 注意：prompt 有双引号和单引号两种写法，两种都要认。
 * 只认双引号会「张冠李戴」——把上一条的 id 和下一条的 prompt 配成一对，
 * 而检查脚本用错提示词去测，等于白测（这个坑踩过）。
 */
function extract(file) {
  const t = readFileSync(join(DIR, file), "utf8");
  const out = [];
  const str = `(?:"((?:[^"\\\\]|\\\\.)*)"|'((?:[^'\\\\]|\\\\.)*)')`;
  const re = new RegExp(
    `id:\\s*"([^"]+)"[\\s\\S]{0,240}?label:\\s*${str}[\\s\\S]*?prompt:\\s*\\n?\\s*${str}[\\s\\S]*?maxTokens:\\s*(\\d+)`,
    "g",
  );
  for (const m of t.matchAll(re)) {
    out.push({
      id: m[1],
      label: unescape(m[2] ?? m[3] ?? ""),
      prompt: unescape(m[4] ?? m[5] ?? ""),
      maxTokens: Number(m[6]),
    });
  }
  return out;
}

if (DRY) {
  let n = 0;
  for (const file of readdirSync(DIR).filter((f) => f.endsWith(".tsx")).sort()) {
    const no = Number(file.slice(0, 2));
    if (no < from || no > to) continue;
    const demos = extract(file);
    console.log(
      `第 ${String(no).padStart(2)} 节  ${demos.length} 条  ${demos.map((d) => d.id).join(", ")}`,
    );
    n += demos.length;
  }
  console.log(`\n合计抽出 ${n} 条演示`);
  process.exit(0);
}

async function run(p) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: p.prompt }],
      max_tokens: OVERRIDE ?? p.maxTokens,
    }),
  });
  if (!res.ok) return { err: `HTTP ${res.status}` };
  const j = await res.json();
  const c = j.choices?.[0];
  return {
    finish: c?.finish_reason,
    chars: [...(c?.message?.content ?? "")].length,
    reasoning: j.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
  };
}

let total = 0;
let empty = 0;
const problems = [];

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".tsx")).sort()) {
  const no = Number(file.slice(0, 2));
  if (no < from || no > to) continue;
  if (ONLY && !ONLY.includes(no)) continue;
  const demos = extract(file);
  if (!demos.length) {
    console.log(`第 ${String(no).padStart(2)} 节  没有 demos（或没抽到）`);
    continue;
  }
  console.log(`\n第 ${String(no).padStart(2)} 节`);
  for (const d of demos) {
    total += 1;
    const r = await run(d);
    if (r.err) {
      console.log(`  ${d.label}  ${r.err}`);
      problems.push(`${no} ${d.label}: ${r.err}`);
      continue;
    }
    const bad = r.chars === 0;
    if (bad) {
      empty += 1;
      problems.push(`${no} ${d.label}: 正文为空（finish=${r.finish}）`);
    }
    console.log(
      `  ${bad ? "!!" : "OK"}  ${d.label.padEnd(26)} max=${String(d.maxTokens).padStart(4)} 思考 ${String(r.reasoning).padStart(4)} finish=${String(r.finish).padEnd(6)} 正文 ${String(r.chars).padStart(4)} 字`,
    );
  }
}

console.log(`\n合计 ${total} 条演示，正文为空 ${empty} 条`);
if (problems.length) {
  console.log("问题：");
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log("全部返回了非空正文。");
