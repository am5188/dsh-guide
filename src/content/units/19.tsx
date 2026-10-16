import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { FlowAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const RECAP: [string, string][] = [
  ["会话", "把说过的话带回来（第 10–11 节）"],
  ["压缩", "装不下时该丢的丢（第 12 节）"],
  ["检索", "需要时把你的资料递给它（第 13 节）"],
  ["工具", "从“只会说”到“会指挥”（第 14 节）"],
  ["技能与插件", "把做法打包、给系统换零件（第 15 节）"],
  ["目标与检查点", "让长任务不跑偏、不白干（第 16 节）"],
  ["子智能体", "活儿太大就拆开并行（第 17 节）"],
  ["权限与沙箱", "给这些能力配一道闸（第 18 节）"],
];

const theory = (
  <div className="prose-cn">
    <p>
      回头看这条线，你会发现每一节都不是孤立的：
      它们各自解决一个具体的失败，但解决完之后，
      <strong>彼此之间还要能配合</strong>。而“让它们配合起来”，本身就是一件很难的事。
    </p>

    <FlowAnim
      nodes={["九块零件", "互相配合", "拼成一个运行时", "Harness"]}
      caption="单独看每一块，都只是一个补丁。拼在一起、并且能稳定运转，才叫 Harness——最后一格是这本书真正的主角。"
    />

    <div className="my-7 grid gap-3 sm:grid-cols-2">
      {RECAP.map(([k, v]) => (
        <div key={k} className="rounded-lg bg-surface px-5 py-4">
          <div className="text-body-sm font-semibold">{k}</div>
          <div className="mt-1 text-meta text-fg-2">{v}</div>
        </div>
      ))}
    </div>

    <h2>难在哪里：每加一块，都会和已有的那块打架</h2>
    <div className="my-7 space-y-3">
      {[
        ["压缩", "不能把权限记录压掉，否则你查不到它做过什么。"],
        ["子智能体", "各干各的，但每一个都得受同一套沙箱约束。"],
        ["工具调用", "要能中途被打断，否则你点不了那个“不同意”。"],
      ].map(([k, v]) => (
        <div
          key={k}
          className="flex flex-col gap-1 rounded-md bg-surface px-5 py-4 sm:flex-row sm:items-center sm:gap-6"
        >
          <span className="w-24 shrink-0 rounded-xs bg-canvas px-2 py-0.5 text-center text-caption text-fg-3">
            {k}
          </span>
          <span className="text-meta text-fg-2">{v}</span>
        </div>
      ))}
    </div>

    <div className="my-8 rounded-lg bg-surface p-6">
      <p className="text-body-sm text-fg">
        <strong>
          把这些能力拼成一个能稳定运行的整体的那层东西，就是 Harness。
        </strong>
        DeepSeek Harness 就是它的一个具体实现。
      </p>
    </div>

    <h2>DSH 的三个特点</h2>
    <div className="my-7 grid gap-4 sm:grid-cols-3">
      {[
        ["装在你自己的电脑上", "不是网页服务——所以它能碰到你的文件。"],
        ["几乎什么都能换", "模型、工具、技能、界面都能替换或增补，这就是“一切皆插件”。"],
        ["会话存在本地", "关掉再打开还能接着聊，不依赖远端账号。"],
      ].map(([k, v]) => (
        <div key={k} className="rounded-lg bg-surface p-5">
          <div className="text-body-sm font-semibold">{k}</div>
          <p className="mt-2 text-meta text-fg-2">{v}</p>
        </div>
      ))}
    </div>

    <Callout>
      现在回头看第 1 节那道墙：模型依然碰不到你的硬盘，
      这道墙从来没有消失过。变的是——<strong>墙外站了一个替它递东西的人</strong>。
      整本书讲的就是这个人是谁、他能做什么、以及你要怎么管住他。
    </Callout>

    <h3>接下来</h3>
    <p>
      第三部到此结束，你已经看完了整套系统是怎么长出来的。
      第四部讲的是实务：怎么让它自己按时干活、花多少钱、出错了怎么退回去。
      第五部只有一节，问一个更远的问题——它能不能替自己变强。
    </p>
    <p>
      但在那之前——<strong>现在就去用一次</strong>。
      打开 DSH，让它做一件你两分钟能验收的小事。
      看一遍整条链路真的转起来，比再读十节都有用。
    </p>
  </div>
);

const content: UnitContent = {
  animTitle: "九块零件，拼成一个运行时",
  anim: (
    <SequenceAnim
      title="九块零件，拼成一个运行时"
      caption="单独看每一块，都只是一个补丁。拼在一起、并且能稳定运转，才叫 Harness。最后一格是这本书真正的主角。"
      items={[
        { tag: "会话", label: "记忆" },
        { tag: "压缩", label: "减负" },
        { tag: "检索", label: "接资料" },
        { tag: "工具", label: "动手" },
        { tag: "技能", label: "打包" },
        { tag: "长任务", label: "跑得久" },
        { tag: "多智能体", label: "分工" },
        { tag: "权限沙箱", label: "管得住" },
        { tag: "合起来", label: "DSH" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      回到第 1 节那道墙。当时你问「我电脑 D:\Work 里有哪些文件」，
      它只能说“我看不到”。现在你已经知道 DSH 是怎么处理这件事的了——
      下面让模型自己把这条链路完整说一遍，作为第三部的收尾。
    </p>
  ),
  demos: [
    {
      id: "full-chain",
      label: "① 把这条链路说完整",
      ask: "从我说出那句话，到文件真的被改掉，中间到底经过了哪些环节？",
      prompt:
        "我用 DeepSeek Harness（一个装在我本机、能读写我文件、能执行命令的 AI 助手）说：「把 D:\\发票 里的 PDF 按月份重命名」。\n\n请把从我说出这句话、到文件名真的被改掉，中间经历的完整环节按顺序讲一遍。\n\n要求：\n- 明确标出哪一步是你在做、哪一步是外面的系统在做\n- 明确标出哪一步需要我参与\n- 用大白话，不要用“编排”“编排层”“运行时”这类词",
      maxTokens: 4000,
      expect:
        "它会画出完整的链路：理解 → 请求权限 → 你同意 → 系统执行 → 结果回传 → 继续。这条链路，就是整本书的内容。",
    },
  ],
  commands: [
    {
      title: "真的派一个任务给它",
      cmd: 'dsh --profile headless "在 D:\\试跑 目录里创建一个 hello.txt，里面写一句话"',
      expect: "跑完后去 D:\\试跑 目录看，文件真的在那里。这是最直观的一次“它真的动手了”。",
      note: "建议先用一个空目录试，确认整条链路通了，再派真活儿。",
    },
  ],
};

export default content;
