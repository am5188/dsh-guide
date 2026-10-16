/**
 * 实测「中文 token 换算比例」。
 *
 * 指南第 22 节原来写「token 不是一对一，但我不给具体倍数」——
 * 这条是可以量的：发两段长度不同、风格相同的中文，
 * 读 usage.prompt_tokens，用差值除掉消息框架的固定开销。
 *
 * 用法（密钥只从环境变量读，不落盘、不打印）：
 *   $env:DSH_KEY = (Get-Content D:\Work\.secrets\dsh-guide-test-key.txt -Raw).Trim()
 *   node scripts/measure-tokens.mjs
 */

const KEY = process.env.DSH_KEY;
if (!KEY) {
  console.error("缺少环境变量 DSH_KEY");
  process.exit(1);
}

const ENDPOINT = "https://api.deepseek.com/chat/completions";
const MODEL = process.env.DSH_MODEL ?? "deepseek-flash";

/** 两段风格一致、长度差明显的中文 */
const SENT = "我们先把这份材料按月份归类，核对合计金额，再生成一张汇总表。";

async function count(text) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: text }],
      max_tokens: 16,
    }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const j = await res.json();
  return {
    tokens: j.usage?.prompt_tokens,
    chars: [...text].length,
  };
}

// 三个长度：两点必然共线，三点才能验证线性
const pts = [];
for (const n of [1, 5, 10]) {
  const r = await count(SENT.repeat(n));
  pts.push(r);
  console.log(`重复 ${String(n).padStart(2)} 次：${String(r.chars).padStart(4)} 个字符 -> ${String(r.tokens).padStart(4)} token`);
}

// 最小二乘拟合 tokens = k * chars + b
const N = pts.length;
const sx = pts.reduce((a, p) => a + p.chars, 0);
const sy = pts.reduce((a, p) => a + p.tokens, 0);
const sxx = pts.reduce((a, p) => a + p.chars * p.chars, 0);
const sxy = pts.reduce((a, p) => a + p.chars * p.tokens, 0);
const k = (N * sxy - sx * sy) / (N * sxx - sx * sx);
const b = (sy - k * sx) / N;

console.log(`\n拟合：token = ${k.toFixed(4)} × 字符数 + ${b.toFixed(1)}`);
console.log(`残差：${pts.map((p) => (p.tokens - (k * p.chars + b)).toFixed(2)).join(", ")}`);
console.log(`\n结论：1 个中文字符 ≈ ${k.toFixed(3)} token，即约 ${(1 / k).toFixed(2)} 个中文字符 / token`);
console.log(`固定框架开销约 ${b.toFixed(0)} token（单条消息的格式开销）`);
