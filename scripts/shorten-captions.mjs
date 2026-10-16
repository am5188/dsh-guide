/**
 * codemod：把动画 caption 压到一句话。
 *
 * 加完 24 个动画后读者要读的字反而变多，主因是 caption 写成了小段落（平均 53 字）。
 * caption 的职责是一句话点睛，不是第二篇散文。
 *
 * 用 Node 写文件：UTF-8、无 BOM。绝不用 PowerShell 的 Set-Content。
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/units";

/** 文件 → 新 caption（目标 20–29 字，只留一句结论） */
const MAP = {
  "02.tsx": "每一步都不是规划出来的，是被失败逼出来的。",
  "03.tsx": "这个循环，就是 Harness 在替你做的事。",
  "05.tsx": "说全这几句多花 30 秒，换来一份不用返工的结果。",
  "06.tsx": "门开不开由你决定——这是全系统唯一真正由你掌控的环节。",
  "07.tsx": "认得出手上的活儿属于哪一类，就知道该补哪句关键要求。",
  "08.tsx": "和网页版最大的不同：它真的把文件写出来了。",
  "09.tsx": "先读懂它说了什么再决定怎么办；跳过这两步是最浪费钱的错。",
  "10.tsx": "它不是忘了，是根本没见过。",
  "11.tsx": "所谓「记忆」，就是这一遍又一遍的重发。",
  "12.tsx": "有些限制条件当时看着不起眼，后面才发现不能丢。",
  "13.tsx": "区别只在于你有没有把材料一起发过去。",
  "14.tsx": "模型自己什么都没碰，它只是提出了一个请求。",
  "15.tsx": "工具越多越乱，技能和插件就是来解决这个的。",
  "16.tsx": "中途出事时它从最近一个检查点接着走，而不是从零开始。",
  "17.tsx": "分工快，但多了一个风险：几份结果口径可能不一致。",
  "18.tsx": "它没有牺牲能力，只是给每项能力配了一道闸。",
  "19.tsx": "单独看都是补丁；拼起来还能稳定运转，才叫 Harness。",
  "20.tsx": "跳过中间几步直接定时间，等于每天定时给自己找麻烦。",
  "21.tsx": "聊得越久，前面那几步被重复的次数就越多。",
  "22.tsx": "前两步解决九成情况；到第三步，说明这事本身就值得先想清楚。",
  "23.tsx": "卡点不在「能不能改」，而在「谁来证明改好了」。",
};

let done = 0;
for (const [file, text] of Object.entries(MAP)) {
  const path = join(DIR, file);
  let t = readFileSync(path, "utf8");
  const all = t.match(/caption="[^"]*"/g) ?? [];
  if (all.length !== 1) {
    console.log(`!! ${file} 有 ${all.length} 个 caption，跳过（需人工确认）`);
    continue;
  }
  t = t.replace(/caption="[^"]*"/, `caption="${text}"`);
  writeFileSync(path, t, "utf8");
  done += 1;
}
console.log(`改写 ${done} 个 caption`);
