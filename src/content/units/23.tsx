import type { UnitContent } from "../types";
import { CompareAnim } from "@/components/anim/CompareAnim";
import { SplitAnim } from "@/components/anim/diagrams";
import { Callout, Unverified } from "@/components/Note";

/** 验证层级：从最强到最弱。这是这一节最该记住的一张表。 */
const LADDER: [string, string, string][] = [
  ["1", "形式化验证", "数学上能证明对错。最强，但只适用于很窄的问题。"],
  ["2", "可执行检验", "跑一遍就知道对不对：代码能不能编译、测试过不过。"],
  ["3", "外部基准", "用一批有标准答案的题去考它，分数客观可比。"],
  ["4", "人工评判", "人来看、人来打分。慢，但可靠。"],
  ["5", "模型互评", "让另一个模型当裁判。便宜，但裁判也会错。"],
  ["6", "自我评估", "它给自己打分。最弱——它很容易高估自己。"],
];

const QUADRANT: [string, string, string][] = [
  [
    "改它的输出",
    "改部署时的行为",
    "它写完自己检查一遍再交。今天已经是工业常规做法。",
  ],
  [
    "改它的工具箱",
    "改部署时的行为",
    "它在用你的过程中，自己写工具、改提示词来把活干得更好。",
  ],
  [
    "改它的权重",
    "改模型本身",
    "用自己生成的数据继续训练自己。风险在于会越训越窄。",
  ],
  [
    "改研究方式",
    "改「怎么改进」本身",
    "它自己决定下一步该研究什么。这一层目前仍需要人定方向。",
  ],
];

const QUESTIONS: [string, string][] = [
  ["变的是什么？", "是提示、工具、代码，还是模型权重本身？前三个今天就在发生，最后一个完全不同量级。"],
  ["谁来验证变好了？", "它自己说的，还是有外部测试？对照上面那张层级表，位置越低越不可信。"],
  ["进步可复现吗？", "换个时间、换个任务，还能重现同样的提升吗？只能演示一次的「进化」，不算证据。"],
];

const theory = (
  <div className="prose-cn">
    <p>
      前面 22 节讲的是<strong>人给模型加装备</strong>。这一节问一个更远的问题：
      模型能不能<strong>自己给自己加装备</strong>，而且越加越快？
    </p>

    <h2>先把三个词分开</h2>
    <div className="my-8 grid gap-4 sm:grid-cols-3">
      {[
        ["持续学习", "部署之后还在学新东西，而不是每次都靠临时告诉它。"],
        ["自我改进", "它参与改进自己：改提示、写工具、修自己的代码。"],
        ["递归自我改进", "改进出来的版本，比原来更擅长改进自己——于是越滚越快。"],
      ].map(([k, v], i) => (
        <div key={k} className="rounded-lg bg-surface p-5">
          <div className="font-mono text-caption text-fg-3">0{i + 1}</div>
          <div className="mt-2 text-body-sm font-semibold">{k}</div>
          <p className="mt-1.5 text-meta text-fg-2">{v}</p>
        </div>
      ))}
    </div>
    <SplitAnim
      left={{
        title: "已经在发生",
        items: ["部署后继续微调", "它自己写工具、改提示", "人在旁边逐项验收"],
      }}
      right={{
        title: "还没有证据",
        items: ["无人干预的持续自我改写", "改进速度越来越快", "脱离外部验证的自我打分"],
      }}
      caption="这三个词经常被混着用。混着用的后果是：你分不清对方说的是「已经很常见的事」还是「还没有证据的事」。"
    />

    <h2>一张表看清「改什么」与「怎么改」</h2>
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-meta">
        <thead>
          <tr className="text-fg-3">
            <th className="px-3 py-3 text-left font-medium whitespace-nowrap">
              能改的东西
            </th>
            <th className="px-3 py-3 text-left font-medium whitespace-nowrap">
              属于哪一类
            </th>
            <th className="px-3 py-3 text-left font-medium">现在的状态</th>
          </tr>
        </thead>
        <tbody>
          {QUADRANT.map(([what, kind, status]) => (
            <tr key={what} className="border-t border-hair align-top">
              <td className="px-3 py-3 whitespace-nowrap text-fg">{what}</td>
              <td className="px-3 py-3 whitespace-nowrap text-fg-3">{kind}</td>
              <td className="px-3 py-3 text-fg-2">{status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p>
      注意第二行——<strong>「它在用你的过程中自己改进工具和提示词」，这件事今天就在发生</strong>，
      而且和你手上这份指南直接相关：Harness 就是它改自己的那个地方。
      但它改的是<strong>外面那层</strong>，不是它自己的脑子。
    </p>

    <h2>这一节最该记住的一张表：验证层级</h2>
    <p>
      一个自我改进的循环，本质上都在赌同一件事：
      <strong>「有个信号能代替人来判断好坏」</strong>。
      这个信号有多硬，决定了这个循环能走多远。从强到弱排下来是这样：
    </p>

    <div className="my-8 space-y-2">
      {LADDER.map(([n, name, desc], i) => (
        <div
          key={n}
          className="flex items-start gap-4 rounded-md px-4 py-3"
          style={{
            background: `color-mix(in srgb, var(--color-ok-500) ${Math.max(4, 16 - i * 2.6)}%, var(--surface))`,
          }}
        >
          <span className="mt-0.5 w-4 shrink-0 font-mono text-caption text-fg-3">
            {n}
          </span>
          <span>
            <span className="text-body-sm font-semibold">{name}</span>
            <span className="mt-0.5 block text-meta text-fg-2">{desc}</span>
          </span>
        </div>
      ))}
    </div>

    <Callout>
      一句话总结：<strong>越靠上的信号，越能撑起真正的自我改进；越靠下的，越容易变成自我陶醉。</strong>
      「它自己觉得这次改得更好了」属于最下面那一层——听起来像进步，实际上没有证据。
    </Callout>

    <h2>已知会出什么问题</h2>
    <dl className="my-8 space-y-3">
      {[
        ["自我确认循环", "自己出题、自己判卷，于是越来越自信，但没真的变好。"],
        ["模型崩溃", "长期用自己生成的数据训练自己，反复几轮之后输出变得又窄又怪。"],
        ["多样性崩溃", "所有答案都收敛到同一个套路，看起来稳定，其实失去了探索能力。"],
      ].map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 sm:flex-row sm:gap-5">
          <dt className="w-32 shrink-0 text-body-sm font-semibold">{k}</dt>
          <dd className="text-meta leading-relaxed text-fg-2">{v}</dd>
        </div>
      ))}
    </dl>

    <h2>那你该怎么判断</h2>
    <p>以后再看到「自我进化」「越用越聪明」这类说法，问三句话就够了：</p>
    <div className="my-8 space-y-4">
      {QUESTIONS.map(([q, why], i) => (
        <div key={q} className="rounded-lg bg-surface p-5">
          <div className="text-body-sm font-semibold">
            <span className="mr-2 font-mono text-accent">Q{i + 1}</span>
            {q}
          </div>
          <p className="mt-2 text-meta text-fg-2">{why}</p>
        </div>
      ))}
    </div>

    <h2>结论，说人话</h2>
    <p>
      今天你能真正依赖的，是<strong>外面那层系统</strong>（就是这本书讲的全部内容），
      而不是「它自己会变强」。
    </p>
    <p>
      开放式的、完全闭环的自我改进——也就是那个「越滚越快」的设想——
      按现有能测量的证据看，仍然被三件事卡着：<strong>验证信号不够硬、会退化、
      以及算力不够无限</strong>。而最上面那一层「它自己决定该研究什么」，
      目前仍然需要人来定方向。
    </p>

    <Unverified>
      这一节的概念框架来自一篇 2026 年 7 月的综述（arXiv 2607.07663，
      考察了 2024–2026 年的 1250 篇论文），我把它的分类和「验证层级」整理成了上面的表。
      <strong>但我没有逐篇核对它的引用，也没有验证任何具体系统的当前能力宣称。</strong>
      所以：这里的<strong>框架</strong>可以放心用来判断，<strong>具体到某家公司说「我们实现了自我进化」时，
      请回到那三句话自己去问。</strong>
      另外，同期的公开评论里也有相反的判断（例如《MIT 技术评论》2026 年 8 月一篇的标题就是
      「AI 的递归自我改进也许不会来得那么快」），说明这件事在专业圈里并没有共识。
    </Unverified>
  </div>
);

const content: UnitContent = {
  animTitle: "两种「自我改进」，差别在哪",
  anim: (
    <CompareAnim
      title="两种「自我改进」，差别在哪"
      left={{
        label: "有界的自我改进（今天就有）",
        lines: [
          "它改的是提示词和工具",
          "外面那层（Harness）随之变化",
          "有测试能验证改得好不好",
          "模型本身没变",
        ],
      }}
      right={{
        label: "开放式 RSI（尚无硬证据）",
        lines: [
          "它改的是自己的权重",
          "改完的版本更会改自己",
          "验证只能靠它自己说",
          "于是循环加速",
        ],
      }}
      caption="左边这一栏今天就在发生，而且这本书讲的就是它。右边这一栏的关键卡点不在「能不能改」，而在「谁来证明改好了」——卡在验证上，而不是卡在能力上。"
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      下面两次调用都围绕这一节的核心：<strong className="font-semibold text-fg">它到底能改自己什么</strong>，
      以及<strong className="font-semibold text-fg">它给自己打分可不可信</strong>。
      第二次尤其值得你自己跑一遍——你会亲眼看到「自我评估」有多不可靠。
    </p>
  ),
  demos: [
    {
      id: "what-can-you-change",
      label: "① 你能改自己什么",
      ask: "你能不能改进你自己的权重？",
      prompt:
        "请严格区分下面三件事，分别回答能或不能，并说明理由：\n1. 在一次对话里，修改你自己接下来要遵守的提示词\n2. 修改你外部工具的定义或代码\n3. 修改你自己的模型权重\n\n最后用一句话总结：这三件事里，哪一件才是真正的「自我改进」。",
      maxTokens: 4000,
      expect:
        "它应该答：①②在特定系统里可能做到，③做不到——权重由训练过程决定，它在对话里碰不到。这正好对应上一张表里「改什么」的那几行。",
    },
    {
      id: "self-grade",
      label: "② 让它给自己打分",
      ask: "先答一道题，再给自己的答案打分，并说明打分的依据。",
      prompt:
        "请完成下面两步，并清楚分开：\n\n第一步：回答这个问题——「一个房间里有 3 个人，每个人又带了 3 个包，每个包里装了 3 只猫。一共有几只猫？」\n\n第二步：给你自己的答案打分（0 到 100），并说明你的打分依据是什么、这个依据可靠在哪里、不可靠在哪里。",
      maxTokens: 4000,
      expect:
        "重点看第二步。它会给自己一个高分，并给出听起来合理的理由——但请注意：这个分数没有任何外部依据。这就是验证层级最下面那一层，也正是自我改进最容易走偏的地方。",
    },
  ],
};

export default content;
