import type { UnitContent } from "../types";
import { CompareAnim } from "@/components/anim/CompareAnim";
import { SplitAnim } from "@/components/anim/diagrams";
import { Callout, Unverified } from "@/components/Note";

const theory = (
  <div className="prose-cn">
    <p>
      当活儿大到一定程度，一个“它”就不够了——不是能力不够，
      而是<strong>一个人的注意力有限</strong>。
      几十个文件都要读一遍的时候，从头读到尾会很慢，而且越到后面越容易走神。
    </p>

    <h3>做法：拆成几份，分头做，再合起来</h3>
    <p>
      这就是子智能体：<strong>主智能体把活儿拆开，派给几个“分身”并行去做，
      再把结果收回来汇总</strong>。你和主智能体对话，主智能体负责派活和收尾。
    </p>

    <div className="my-9 rounded-lg bg-surface p-6">
      <div className="text-body-sm font-semibold">你的角色变了</div>
      <p className="mt-3 text-meta leading-relaxed text-fg-2">
        在单个智能体那里，你像个监工，盯着它一步步做。
        到了多智能体，你更像<strong>派活的负责人</strong>：
        把任务说清楚、定好验收标准、最后收货。
        中间的协调由它自己完成。
      </p>
    </div>

    <h3>但分工不是越多越好</h3>
    <SplitAnim
      left={{
        title: "适合分工",
        items: ["各份活儿互不依赖", "「把 50 个文件分别总结」", "可以同时开几路"],
      }}
      right={{
        title: "不适合分工",
        items: ["后面的依赖前面的", "「先定方案，再照方案执行」", "拆开反而更乱"],
      }}
      caption="判断标准只有一条：这些活儿之间有没有先后依赖。互不依赖才能并行。另外合并时最容易出错——口径不一致、重复、漏项，所以一定要指定统一的输出格式。"
    />

    <Callout>
      实操建议：<strong>要求它“所有分身用完全一样的输出格式”</strong>。
      这一句能挡掉一大半合并时的麻烦。
    </Callout>

    <Unverified>
      DSH 里同时能开几个子智能体、并行上限是多少、怎么查看每个分身的状态，
      我没有在真实环境里验证过。第一次用的时候，
      <strong>先从小规模试（比如就拆两份）</strong>，看清楚了再加。
    </Unverified>
  </div>
);

const content: UnitContent = {
  animTitle: "一个人从头做，还是分工再汇总",
  anim: (
    <CompareAnim
      title="一个人从头做，还是分工再汇总"
      left={{
        label: "一个人顺序做",
        lines: ["读第 1 个文件", "读第 2 个文件", "……", "读到第 50 个已经累了"],
      }}
      right={{
        label: "拆开并行做",
        lines: ["5 个人各读 10 个", "同时进行", "统一格式交回", "主智能体汇总"],
      }}
      caption="右边快，但多了一个新的风险：五份结果的口径可能不一致。所以“统一输出格式”这个要求，在分工时是必须的。"
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      下面这次调用让模型帮你判断
      <strong className="font-semibold text-fg">手上的活儿该不该拆</strong>
      ，以及拆了之后怎么保证合并时不出乱子。
    </p>
  ),
  demos: [
    {
      id: "split-or-not",
      label: "① 这活儿该不该拆",
      ask: "「把 30 份客户反馈整理成一份报告」该拆成几个并行任务吗？",
      prompt:
        "我要让一个 AI 助手处理这件事：把 30 份客户反馈整理成一份分析报告。\n\n请分析：这件事适不适合拆成多个并行的子任务？\n- 如果适合，给出拆分方案，并明确每一份必须遵守的统一输出格式\n- 如果不适合，说明为什么拆了反而更糟\n\n最后给出你的判断依据（不要只说结论）。",
      maxTokens: 4000,
      expect:
        "它会指出“读和归纳”适合并行，但“下结论”必须汇合后统一做。这个区分很重要——它正是分工会不会帮倒忙的关键。",
    },
  ],
};

export default content;
