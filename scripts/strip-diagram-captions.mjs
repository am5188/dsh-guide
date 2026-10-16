/**
 * codemod：去掉图解类动画的 caption。
 *
 * 为什么：caption 的本意是点睛，实际上我把解释从正文搬到了 caption 里 ——
 * 等于换个地方写散文。加完 24 个动画后，读者要读的字反而多了 11%。
 * 图已经把关系画出来了，标签也在图上，caption 大多数时候是重复。
 *
 * 只处理图解类原件（FlowAnim / SplitAnim / StackAnim / CycleAnim / GaugeAnim），
 * 不动 SequenceAnim / CompareAnim 的 caption（那两类的文字承载更多信息）。
 *
 * 用 Node 写文件：UTF-8 且不带 BOM。绝不用 PowerShell 的 Set-Content。
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/units";
const KINDS = ["FlowAnim", "SplitAnim", "StackAnim", "CycleAnim", "GaugeAnim"];
const RE = new RegExp(`<(${KINDS.join("|")})\\b[\\s\\S]*?\\/>`, "g");

let touched = 0;
let removed = 0;

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".tsx"))) {
  const path = join(DIR, file);
  const before = readFileSync(path, "utf8");

  const after = before.replace(RE, (block) => {
    const next = block.replace(/\n\s*caption=(?:"[^"]*"|\{`[^`]*`\})/, "");
    if (next !== block) removed += 1;
    return next;
  });

  if (after !== before) {
    writeFileSync(path, after, "utf8"); // UTF-8，无 BOM
    touched += 1;
  }
}

console.log(`处理 ${touched} 个文件，移除 ${removed} 处 caption`);
