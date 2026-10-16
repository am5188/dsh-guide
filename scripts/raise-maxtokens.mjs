/**
 * codemod：把全书演示的 maxTokens 统一提到 16000。
 *
 * 为什么：实测发现多条演示在 4000 下思考 token 全被吃光、正文为空
 * （finish_reason=length，读者点下去只能看到一片空白）。
 * 最高的思考量实测到 12,724 token。
 *
 * max_tokens 是**上限不是预留** —— 答案短就只按实际输出计费，调高不花钱。
 * 所以正确做法是给足余量，而不是卡着下限。
 *
 * 用 Node 写文件：UTF-8、无 BOM。
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/units";
const TARGET = 16000;

let files = 0;
let changed = 0;

for (const f of readdirSync(DIR).filter((x) => x.endsWith(".tsx"))) {
  const p = join(DIR, f);
  const before = readFileSync(p, "utf8");
  const after = before.replace(/maxTokens:\s*\d+/g, (m) => {
    const n = Number(m.split(":")[1].trim());
    if (n >= TARGET) return m;
    changed += 1;
    return `maxTokens: ${TARGET}`;
  });
  if (after !== before) {
    writeFileSync(p, after, "utf8");
    files += 1;
  }
}

console.log(`改了 ${files} 个文件、${changed} 处 maxTokens -> ${TARGET}`);
