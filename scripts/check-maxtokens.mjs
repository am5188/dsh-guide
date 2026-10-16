/**
 * 实测「某个 max_tokens 下正文会不会是空的」。
 *
 * 背景：deepseek-flash 是推理模型，思考 token 也占 max_tokens 额度。
 * 第 1 节原来三个演示都设成 1500，而其他 22 节都是 2500–4000 —— 需要验证 1500 到底行不行。
 *
 * 用法：
 *   $env:DSH_KEY = (Get-Content D:\Work\.secrets\dsh-guide-test-key.txt -Raw).Trim()
 *   node scripts/check-maxtokens.mjs
 */

const KEY = process.env.DSH_KEY;
if (!KEY) {
  console.error("缺少环境变量 DSH_KEY");
  process.exit(1);
}

const ENDPOINT = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-flash";

/** 第 1 节的三条实际提示词 */
const PROMPTS = [
  {
    id: "① 它擅长的",
    text: '用三句话解释什么是"上下文窗口"，要让完全不懂技术的人也能听懂。不要用比喻以外的专业词汇。',
  },
  {
    id: "② 它看不见你的电脑",
    text: "我电脑 D:\\Work 目录下有哪些文件？直接列出来，不要反问我，也不要让我自己去看。",
  },
  {
    id: "③ 它会一本正经地编",
    text: "我们公司《差旅报销制度》第 7 条写的是什么？请原文引用，不要说明你不知道。",
  },
];

async function probe(text, maxTokens) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: text }],
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) return { error: `HTTP ${res.status}` };
  const j = await res.json();
  const content = j.choices?.[0]?.message?.content ?? "";
  return {
    finish: j.choices?.[0]?.finish_reason,
    chars: [...content].length,
    reasoning: j.usage?.completion_tokens_details?.reasoning_tokens ?? null,
    out: j.usage?.completion_tokens ?? null,
  };
}

for (const p of PROMPTS) {
  console.log(`\n${p.id}`);
  for (const mt of [1500, 2500, 4000]) {
    const r = await probe(p.text, mt);
    if (r.error) {
      console.log(`  max_tokens=${String(mt).padStart(4)}  ${r.error}`);
      continue;
    }
    const flag = r.chars === 0 ? "  ← 正文为空！" : "";
    console.log(
      `  max_tokens=${String(mt).padStart(4)}  finish=${String(r.finish).padEnd(6)} 思考 ${String(r.reasoning).padStart(4)} / 输出 ${String(r.out).padStart(4)} token  正文 ${String(r.chars).padStart(4)} 字${flag}`,
    );
  }
}
