/**
 * 量「读者要读多少字」。
 *
 * 只数 <p> 段落会漏掉动画的 caption —— 而 caption 现在也是一段段散文。
 * 所以两样都算：<p> 正文 + caption 文本。
 *
 * 用法：node scripts/prose-stats.mjs [rev]
 *   不带参数 = 量当前工作区；带 git revision = 量那个版本（用于前后对比）
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const rev = process.argv[2];
const DIR = "src/content/units";

const strip = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/\{\s*["'][^"']*["']\s*\}/g, "")
    .replace(/\s+/g, "");

function listFiles() {
  if (!rev) return readdirSync(DIR).filter((f) => f.endsWith(".tsx"));
  return execFileSync("git", ["ls-tree", "--name-only", `${rev}:${DIR}`], {
    encoding: "utf8",
  })
    .split("\n")
    .map((s) => s.trim())
    .filter((f) => f.endsWith(".tsx"));
}

function read(file) {
  if (!rev) return readFileSync(join(DIR, file), "utf8");
  return execFileSync("git", ["show", `${rev}:${DIR}/${file}`], {
    encoding: "utf8",
  });
}

let totalP = 0;
let totalC = 0;
let totalAnim = 0;
const rows = [];

// 注意：<p(?:\s[^>]*)?> 是刻意的 —— 写成 <p[^>]*> 会把 <pre> 也匹配进来，
// 把代码块的字数算成正文（这个 bug 一度让统计虚高）。
const P_RE = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g;

for (const file of listFiles()) {
  const t = read(file);
  let p = 0;
  for (const m of t.matchAll(P_RE)) p += strip(m[1]).length;

  // caption="..." 与 caption={`...`}
  let c = 0;
  for (const m of t.matchAll(/caption=(?:"([^"]*)"|\{`([^`]*)`\})/g))
    c += strip(m[1] ?? m[2] ?? "").length;

  const anim = (
    t.match(/<(FlowAnim|SplitAnim|GaugeAnim|StackAnim|CycleAnim|SequenceAnim|CompareAnim|Unit01Anim|GuiWireframe)\b/g) ??
    []
  ).length;

  totalP += p;
  totalC += c;
  totalAnim += anim;
  rows.push({ n: Number(file.slice(0, 2)), p, c, anim });
}

rows.sort((a, b) => a.n - b.n);
console.log("  节   <p>正文  caption  合计   动画");
for (const r of rows) {
  console.log(
    `  ${String(r.n).padStart(2)}   ${String(r.p).padStart(6)}  ${String(r.c).padStart(7)}  ${String(
      r.p + r.c,
    ).padStart(6)}   ${r.anim}`,
  );
}
console.log("");
console.log(`  <p> 正文合计 : ${totalP} 字`);
console.log(`  caption 合计: ${totalC} 字`);
console.log(`  ── 读者要读 : ${totalP + totalC} 字`);
console.log(`  动画个数    : ${totalAnim}`);
