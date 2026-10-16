import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { FlowAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const MODULES: [string, string][] = [
  ["循环控制", "它不会一次就把事做完，而是「做一步 → 看结果 → 再决定下一步」。"],
  ["上下文", "每一轮该把哪些信息递给模型，由它决定。多了贵，少了忘。"],
  ["工具", "真正动手的部分：读文件、改文件、跑命令、搜网页、生成文档。"],
  ["记忆", "跨会话记住你的事，不用每次重新自我介绍。"],
  ["技能", "把一套做法打包；遇到类似任务直接套用，不用重新教。"],
  ["多智能体", "活儿太大时拆给几个角色分头做，再汇总。"],
  ["权限", "哪些能直接做，哪些必须先问你一句。"],
  ["长时运行", "任务跑很久也不丢进度，中途崩了能接着来。"],
  ["评估", "自己检查结果对不对，而不是交完就算。"],
];

const theory = (
  <div className="prose-cn">
    <p>
      把上一节那条线收拢成一句话：
      <strong>Harness 就是模型外面那一整套替它记、替它动手、替它把关的系统。</strong>
      模型负责想，Harness 负责让「想」变成真的发生了什么。
    </p>

    <FlowAnim
      nodes={["模型想", "Harness 安排", "工具执行", "结果回到模型"]}
    />

    <Callout>
      这里有个最容易搞错的点：
      <strong>Harness 不是新模型，也不是让模型变聪明。</strong>
      同一个模型，换一套 Harness，能干的事可以差出十倍。
      就像同一个司机，开拖拉机和开卡车，能拉的货完全不是一回事。
    </Callout>

    <h3>这套系统里到底有什么</h3>
    <p>
      名字听起来很多，但对你有意义的其实只有一句：
      <strong>每个模块都在补一个具体的短板</strong>
      。下面这些名词你先混个眼熟，第三部会一个一个拆开讲。
    </p>

    <dl className="my-9 grid gap-4 sm:grid-cols-2">
      {MODULES.map(([name, desc]) => (
        <div key={name} className="rounded-lg bg-surface p-5">
          <dt className="text-body-sm font-semibold">{name}</dt>
          <dd className="mt-1.5 text-meta text-fg-2">{desc}</dd>
        </div>
      ))}
    </dl>

    <h3>所以它到底改变了什么</h3>
    <p>
      没有 Harness 的时候，模型对你的电脑唯一的了解，是你<strong>打在对话里</strong>
      的那点信息。有了 Harness 之后，它可以去<strong>拿</strong>
      ——去读那个文件、去跑那条命令、去把结果存成一份新的 Excel。
    </p>
    <p>
      但它不会因此变得不会犯错。它仍然会理解错、会跑偏。
      区别在于：<strong>现在它能真的把事情搞坏</strong>
      ，所以第 18 节的权限和沙箱，和前面这些能力同等重要。
    </p>
  </div>
);

const content: UnitContent = {
  animTitle: "一句话是怎么变成一堆动作的",
  anim: (
    <SequenceAnim
      title="一句话是怎么变成一堆动作的"
      caption="这个循环，就是 Harness 在替你做的事。"
      items={[
        { tag: "1", label: "听懂要求" },
        { tag: "2", label: "拆成步骤" },
        { tag: "3", label: "动手做" },
        { tag: "4", label: "看结果" },
        { tag: "5", label: "改方向" },
        { tag: "6", label: "交付" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      问它「要让我电脑里的文件真的被改掉，你需要什么」。
    </p>
  ),
  demos: [
    {
      id: "needs",
      label: "① 它自己知道缺什么",
      ask: "要让我电脑里的文件真的被改掉，你需要什么？",
      prompt:
        "要让我电脑里的文件真的被改掉，你需要什么？请具体列出你缺少的能力，不要说空话。",
      maxTokens: 4000,
      expect:
        "它多半会说出：需要能读文件、能写文件、需要你的授权。它并不糊涂——它只是自己被关在文字里。",
    },
    {
      id: "no-harness",
      label: "② 同一句话，没有 Harness",
      ask: "帮我把 D:\\发票 里的 PDF 按月份重命名。",
      prompt:
        "帮我把 D:\\发票 里的 PDF 按月份重命名，直接给我结果，不要教我怎么做。",
      maxTokens: 2500,
      expect:
        "它只能给你一段“你可以这样操作”的说明。它碰不到那个文件夹，所以给不出结果。",
    },
  ],
};

export default content;
