import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { CycleAnim } from "@/components/anim/diagrams";
import { Callout, Unverified } from "@/components/Note";

const theory = (
  <div className="prose-cn">
    <p>
      前面的能力都在解决“能不能做”。这一节解决的是另一个问题：
      <strong>活儿太长的时候，它会不会中途跑偏，或者白干</strong>。
    </p>

    <h3>长任务有三个天然的坑</h3>
    <dl className="my-9 space-y-4">
      {[
        [
          "会跑偏",
          "干到第十步，最初的目的一句话，它可能已经理解成别的了。",
        ],
        [
          "会白干",
          "跑到一半崩了或者你关了窗口，前面的进度如果没留下，就得从头再来。",
        ],
        [
          "你盯不住",
          "十几分钟、几十分钟的活儿，你不可能一直盯着屏幕看它每一步。",
        ],
      ].map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 sm:flex-row sm:gap-5">
          <dt className="w-24 shrink-0 text-body-sm font-semibold">{k}</dt>
          <dd className="text-meta leading-relaxed text-fg-2">{v}</dd>
        </div>
      ))}
    </dl>

    <h3>对策：把长活儿拆成一圈一圈的短活</h3>
    <CycleAnim
      steps={["对着目标做一段", "停下来核对", "偏了就修回来", "继续下一段"]}
      center="直到验收标准满足"
    />

    <h3>对策一：把目标钉死</h3>
    <p>
      开工前先写一句<strong>明确、可验收的目标</strong>，并且让它一直摆在显眼处。
      每做几步回头看一眼这句话——这就是“目标”这个功能的作用：
      <strong>给长任务一个锚</strong>，防止它跑着跑着忘了要去哪。
    </p>
    <p>
      一句好的目标长这样：<strong>“把 D:\对账 里 2026 年 1 月到 6 月的票据
      按月份归类，每月生成一张汇总表，合计金额与原件对得上。”</strong>
      它有范围、有产出、有验收标准。
    </p>

    <h3>对策二：留检查点</h3>
    <p>
      检查点就是<strong>定期存档</strong>。做到一个阶段就把进度存下来，
      崩了之后能从最近那个点接着走，而不是从第一行开始。
    </p>

    <Callout>
      对普通人的实际意义：<strong>它让你敢派长活了</strong>。
      在“会用”和“敢用”之间，隔着就是这道保险。
    </Callout>

    <Unverified>
      检查点具体多久存一次、崩了之后从哪一步恢复，
      我没有在真实的长任务里逐步验证过。
      稳妥的用法是：<strong>把长任务切成几个短任务，
      每到一步就让它把结果写成文件</strong>。
      这样即使中途出问题，你已经拿到了前几步的成果。
    </Unverified>
  </div>
);

const content: UnitContent = {
  animTitle: "长任务是怎么被拆成安全的小段",
  anim: (
    <SequenceAnim
      title="长任务是怎么被拆成安全的小段"
      caption="中途出事时它从最近一个检查点接着走，而不是从零开始。"
      items={[
        { tag: "①", label: "定死目标" },
        { tag: "②", label: "做几步" },
        { tag: "③", label: "存个档" },
        { tag: "④", label: "出事了" },
        { tag: "⑤", label: "从存档继续" },
        { tag: "⑥", label: "对照目标验收" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      让它把一句模糊的需求，改写成可验收的目标。
    </p>
  ),
  demos: [
    {
      id: "breakdown",
      label: "① 把大活儿拆成带检查点的步骤",
      ask: "把「整理我三年的票据」拆成可以一步步验收的步骤。",
      prompt:
        "我有一件大活儿：把 D:\\票据 文件夹里近三年的票据（PDF 和手机拍的图片混在一起）整理好——按年月归类、提取金额和商家、生成一张汇总表。\n\n请把它拆成 6 到 8 个步骤，每一步满足三个条件：\n1. 做完之后有一个看得见、可以验收的产物\n2. 出错时不影响其它步骤的成果\n3. 我可以中途叫停，下次能接着做\n\n每一步请写清：做什么、产物是什么、怎么验收。",
      maxTokens: 4000,
      expect:
        "它会给出带产物的分步方案。注意那些“检查点”式的设计——先做 10 张试跑、再批量做，就是典型的安全设计。",
    },
  ],
};

export default content;
