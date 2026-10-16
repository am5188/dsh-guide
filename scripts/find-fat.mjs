/**
 * 找出"该压缩的长段落"。
 * 打印每个单元文件里所有 <p> 的内容与字数，按字数降序，便于一次性规划删减。
 *
 * 用法：node scripts/find-fat.mjs [最少字数，默认 45]
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIN = Number(process.argv[2] ?? 45);
const DIR = "src/content/units";
const strip = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/\{\s*["'][^"']*["']\s*\}/g, "")
    .replace(/\s+/g, "");

const all = [];
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".tsx")).sort()) {
  const t = readFileSync(join(DIR, file), "utf8");
  let i = 0;
  for (const m of t.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)) {
    i += 1;
    const s = strip(m[1]);
    if (s.length >= MIN) {
      const isPractice = /text-body-sm text-fg-2/.test(m[0].slice(0, 60));
      all.push({ file, i, len: s.length, kind: isPractice ? "实践引子" : "正文", s });
    }
  }
}
all.sort((a, b) => b.len - a.len);
for (const r of all) {
  console.log(`${r.file} #${r.i}  ${String(r.len).padStart(4)}字  [${r.kind}]  ${r.s.slice(0, 46)}`);
}
console.log(`\n共 ${all.length} 段 ≥${MIN} 字，合计 ${all.reduce((a, r) => a + r.len, 0)} 字`);
