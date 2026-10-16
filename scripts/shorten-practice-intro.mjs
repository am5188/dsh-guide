/**
 * codemod：把各节的「实践引子」压到一句话。
 *
 * practiceIntro 是演示区前面的引导语。现在平均 72 字，等于在每个练习前先写一小段散文。
 * 它只需要说清「下面这几次调用要做什么」，一句话足够。
 *
 * 用 Node 写文件：UTF-8、无 BOM。
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/units";

const NEW = {
  "01.tsx": "下面三次调用都是真的，请求从你的浏览器直连 DeepSeek。",
  "02.tsx": "下面两次是同一个问题、同一个模型，区别只在有没有带上历史。",
  "03.tsx": "问它「要让我电脑里的文件真的被改掉，你需要什么」。",
  "04.tsx": "先解决一个更根本的问题：怎么把话说成它能执行的。",
  "05.tsx": "让它自己判断：一句含糊的话里缺了哪些要件。",
  "06.tsx": "让它当一次风险顾问，把动手前该核对的事列出来。",
  "07.tsx": "两类活儿的真实样例：一次纯动嘴，一次要求分清事实与推断。",
  "08.tsx": "成品文件在这里看不到，但可以让它先把设计交出来。",
  "09.tsx": "把一段看不懂的报错丢给它，只让它解释、不许动手。",
  "10.tsx": "这段 Python 把单次调用的请求体原样写出来。",
  "11.tsx": "同一个问题问两次，区别只在第二次带上了前文。",
  "12.tsx": "亲手做一次压缩，看它丢掉哪些、留下哪些。",
  "13.tsx": "RAG 的最小形态：把材料连同问题一起发过去。",
  "14.tsx": "先看它怎么「请求调用工具」，再看真正的两次往返。",
  "15.tsx": "让它自己说清「该用哪个工具」。",
  "16.tsx": "让它把一句模糊的需求，改写成可验收的目标。",
  "17.tsx": "让几个分身并行做同一批活，再把结果汇总。",
  "18.tsx": "让它做一次最坏情况推演。",
  "19.tsx": "回到第 1 节那道墙，看它现在能不能碰到你的文件。",
  "20.tsx": "让模型帮你把「这件事该不该自动化」想清楚。",
  "21.tsx": "让它把「钱花在哪」讲成生活里的话。",
  "22.tsx": "把一段满是行话的话丢给它，让它翻成人话。",
  "23.tsx": "问它到底能改自己什么，以及它给自己打分可不可信。",
};

const RE = /practiceIntro: \(\s*<p className="text-body-sm text-fg-2">[\s\S]*?<\/p>\s*\),/;

let done = 0;
let before = 0;
let after = 0;

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".tsx"))) {
  const path = join(DIR, file);
  let t = readFileSync(path, "utf8");
  const m = t.match(RE);
  if (!m) {
    console.log(`!! ${file} 没匹配到 practiceIntro`);
    continue;
  }
  const text = NEW[file];
  if (!text) {
    console.log(`!! ${file} 没有新文案，跳过`);
    continue;
  }
  before += m[0].replace(/<[^>]+>/g, "").replace(/\s+/g, "").length;
  after += text.length;
  t = t.replace(
    RE,
    `practiceIntro: (\n    <p className="text-body-sm text-fg-2">\n      ${text}\n    </p>\n  ),`,
  );
  writeFileSync(path, t, "utf8");
  done += 1;
}

console.log(`改写 ${done} 个 practiceIntro：${before} 字 -> ${after} 字（省 ${before - after} 字）`);
