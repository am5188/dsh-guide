/**
 * 检查「工具调用回路」演示（AgentLoop）能不能真的跑通。
 *
 * 这条演示比其他演示复杂：它要一来一回两次请求，
 * 而且第二次的输入依赖第一次返回的 tool_calls。
 * 所以不能只测「正文非空」，还要确认：
 *   第一轮真的返回了 tool_calls，第二轮真的给出了最终答案。
 *
 * AgentLoop 里的 max_tokens 是写死的（原来是 3000），
 * 而工具决策类提示词的思考量可能很大 —— 这里就是要验证够不够。
 *
 * 用法：
 *   $env:DSH_KEY = (Get-Content D:\Work\.secrets\dsh-guide-test-key.txt -Raw).Trim()
 *   node scripts/check-agent-demo.mjs [max_tokens]
 */

const KEY = process.env.DSH_KEY;
if (!KEY) {
  console.error("缺少环境变量 DSH_KEY");
  process.exit(1);
}

const ENDPOINT = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-flash";
const MAX = Number(process.argv[2] ?? 3000);

// 与 src/content/units/14.tsx 的 agent 演示一致
const SYSTEM =
  "你是一个可以调用工具的助手。当你需要了解用户电脑上的情况时，必须先调用工具，不要凭空猜测。";
const USER = "帮我看看 D:\\发票 目录里有多少个 PDF 文件。";
const TOOLS = [
  {
    type: "function",
    function: {
      name: "list_files",
      description: "列出一个目录下的所有文件名",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "目录的完整路径，例如 D:\\发票" },
        },
        required: ["path"],
      },
    },
  },
];
const OUTPUT =
  "D:\\发票 目录共 5 个文件：\n- 2026-01_办公用品.pdf\n- 2026-01_差旅.pdf\n- 2026-02_办公用品.pdf\n- 2026-03_差旅.pdf\n- 说明.txt";

async function call(messages, withTools) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(withTools ? { tools: TOOLS } : {}),
      max_tokens: MAX,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

console.log(`max_tokens = ${MAX}\n`);

// —— 第一轮：应该返回 tool_calls ——
const r1 = await call(
  [
    { role: "system", content: SYSTEM },
    { role: "user", content: USER },
  ],
  true,
);
const m1 = r1.choices?.[0]?.message;
const tc = m1?.tool_calls ?? [];
console.log("第一轮");
console.log(`  finish_reason = ${r1.choices?.[0]?.finish_reason}`);
console.log(`  思考 token    = ${r1.usage?.completion_tokens_details?.reasoning_tokens}`);
console.log(`  tool_calls    = ${tc.length}`);
if (tc.length) {
  console.log(`  工具名        = ${tc[0].function?.name}`);
  console.log(`  参数          = ${tc[0].function?.arguments}`);
}

if (!tc.length) {
  console.log("\n!! 第一轮没有返回 tool_calls —— 演示会走不下去");
  process.exit(1);
}

// —— 第二轮：把工具结果发回去，应该给出最终答案 ——
const r2 = await call(
  [
    { role: "system", content: SYSTEM },
    { role: "user", content: USER },
    { role: "assistant", content: m1.content ?? "", tool_calls: tc },
    { role: "tool", tool_call_id: tc[0].id, content: OUTPUT },
  ],
  true,
);
const m2 = r2.choices?.[0]?.message?.content ?? "";
console.log("\n第二轮");
console.log(`  finish_reason = ${r2.choices?.[0]?.finish_reason}`);
console.log(`  思考 token    = ${r2.usage?.completion_tokens_details?.reasoning_tokens}`);
console.log(`  正文          = ${[...m2].length} 字`);
console.log(`  正文预览      = ${m2.slice(0, 80).replace(/\n/g, " ")}`);

const ok = [...m2].length > 0 && /4|四/.test(m2);
console.log(
  `\n${ok ? "通过" : "!! 未通过"}：${ok ? "两轮都跑通，且最终答案给出了 PDF 数量" : "最终答案为空或没给出数量"}`,
);
process.exit(ok ? 0 : 1);
