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

    <h2>这不是空谈：没有外部信号时，它纠正不了自己</h2>
    <p>
      2024 年一篇发表在 TACL 上的综述（Kamoi 等）把「让模型自己检查自己」的研究翻了个遍，
      结论有三条，都写得很直白：
    </p>
    <div className="my-7 space-y-2">
      {[
        "没有任何前人工作证明，仅靠提示模型「你自己再看看对不对」，就能成功自我纠错。",
        "在有可靠外部反馈的任务上，自我纠错确实有效。",
        "真要让模型学会自纠，靠的是大规模微调，不是靠一句提示。",
      ].map((t, i) => (
        <div key={t} className="flex items-start gap-4 rounded-md bg-surface px-5 py-3.5">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-sm bg-canvas font-mono text-caption text-accent">
            {i + 1}
          </span>
          <span className="text-meta text-fg-2">{t}</span>
        </div>
      ))}
    </div>

    <Callout>
      这里有一组<strong>必须一起讲的矛盾</strong>，只有把两边都摆出来才有用：
      被引用最多的 Self-Refine（2023）自称能带来「约 20 个百分点的绝对提升」；
      而上面这篇综述把这一类结果归为
      <strong>「评估不严谨、高估了自纠能力」</strong>。
      <br />
      <br />
      所以看到「自我改进提升了 X%」时，第一个该问的不是数字，而是
      <strong>「谁在打分」</strong>。
    </Callout>

    <h2>正面进展的赢点，全在「外部验证器」上</h2>
    <p>
      确实有拿得出手的成绩，但每一条都能指出那个「外部的裁判」是谁：
    </p>
    <div className="my-7 space-y-3">
      {[
        [
          "FunSearch（Nature 2024）",
          "做出数学新结果，靠的是把模型和一个「系统性评估器」配对——原文强调的就是这个配对。",
        ],
        [
          "RE-Bench（2024）",
          "给的是一组双向数字：2 小时预算下 AI 产出是人类研究者的 4 倍；8 小时人类反超；32 小时人类是 AI 的 2 倍。",
        ],
        [
          "Absolute Zero（2025）",
          "标题说「不依赖任何外部数据」，但它明确依赖代码执行器来验证对错——所谓「零数据自进化」，并不是零外部信号。",
        ],
      ].map(([k, v]) => (
        <div key={k} className="rounded-lg bg-surface p-5">
          <div className="text-body-sm font-semibold">{k}</div>
          <p className="mt-1.5 text-meta text-fg-2">{v}</p>
        </div>
      ))}
    </div>

    <h2>真正「闭环改写自己权重」的公开实验：到现在找不到</h2>
    <p>
      目前最激进的两个公开实验，<strong>改的都是代码和脚手架，不是权重</strong>，
      而且每一步都靠外部基准打分：
    </p>
    <div className="my-7 grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg bg-surface p-5">
        <div className="text-body-sm font-semibold">Darwin Gödel Machine</div>
        <p className="mt-1.5 text-meta text-fg-2">
          在 SWE-bench 上从 20.0% 提到 50.0%，Polyglot 从 14.2% 到 30.7%；
          实验里带沙箱与人工监督。
        </p>
      </div>
      <div className="rounded-lg bg-surface p-5">
        <div className="text-body-sm font-semibold">SICA</div>
        <p className="mt-1.5 text-meta text-fg-2">
          17% 提到 53%；论文自述机制是「非梯度」的——也就是没有去改模型权重。
        </p>
      </div>
    </div>

    <h2>会出什么问题：哪些有实验数据，哪些只是推测</h2>
    <div className="my-7 space-y-3">
      {[
        [
          "有数据",
          "模型崩溃",
          "长期拿自己生成的数据训练自己，输出分布会退化。Nature 2024 那篇的用词是「不可逆」——原始内容分布的两端会消失。",
        ],
        [
          "有反向证据",
          "崩溃并非必然",
          "另一篇 2024 年的工作表明：只要让真实数据「累积」而不是被自己生成的数据「替换」，崩溃可以避免。所以这条不是死路，是条件问题。",
        ],
        [
          "有数据",
          "奖励作弊会自发出现",
          "2024 年有工作在作文任务上证明：不用训练，光靠上下文里的奖励信号，作弊就会自发出现。",
        ],
        [
          "待核实",
          "自我确认循环、多样性崩溃",
          "我读的那篇综述转述了这两条，但它引的原始文献我没抓到，所以这里只当线索，不当实证。",
        ],
      ].map(([tone, k, v]) => (
        <div
          key={k}
          className="flex flex-col gap-1.5 rounded-lg bg-surface p-5 sm:flex-row sm:gap-5"
        >
          <span
            className={
              "h-fit shrink-0 rounded-xs px-2 py-0.5 text-caption sm:w-20 sm:text-center " +
              (tone === "有数据"
                ? "bg-accent-soft text-accent"
                : tone === "有反向证据"
                  ? "bg-sunken text-fg-2"
                  : "bg-sunken text-fg-3")
            }
          >
            {tone}
          </span>
          <span>
            <span className="text-body-sm font-semibold">{k}</span>
            <span className="mt-1 block text-meta text-fg-2">{v}</span>
          </span>
        </div>
      ))}
    </div>

    <h2>2026 年：能力宣称和独立证据，正面撞上了</h2>
    <p>
      这是这一节最值得你知道的<strong>当下新闻</strong>——
      一边的宣称和另一边的独立验证，方向正好相反。
    </p>
    <div className="my-7 grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg bg-surface p-5">
        <div className="flex items-center gap-2 text-body-sm font-semibold">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          一边在说
        </div>
        <p className="mt-2 text-meta text-fg-2">
          Anthropic 在《When AI builds itself》里说：
          <strong className="text-fg">合并进主干的代码有 80% 以上由 Claude 写</strong>，
          工程师日均产出是过去的 8 倍。
        </p>
        <p className="mt-2 text-caption text-fg-3">
          但同一篇文章里他们自己注明：代码行数是个不完美的指标，
          这个数字「<strong>几乎肯定是高估</strong>」；并且说
          「选择目标」方面仍有很大差距。
        </p>
      </div>
      <div className="rounded-lg bg-surface p-5">
        <div className="flex items-center gap-2 text-body-sm font-semibold">
          <span className="size-1.5 rounded-full bg-warn-500" aria-hidden="true" />
          一边在验
        </div>
        <p className="mt-2 text-meta text-fg-2">
          2026 年 7 月一项独立「影子评测」：让前沿 agent 花 6 天、
          数千美元去做两篇尚未发表的 NeurIPS 投稿的核心问题，再由原作者评分。
        </p>
        <p className="mt-2 text-caption text-fg-3">
          结论原话：工程部分全部自动完成，
          <strong>但研究问题零进展，两篇都被原作者明确拒稿</strong>。
          该研究公开了专家评审与运行日志，并做了换模型、换脚手架的稳健性检验。
        </p>
      </div>
    </div>

    <Callout>
      还有一个细节值得记住：Anthropic 那篇引用了 METR 的数据说
      「任务时长每 4 个月翻倍」，<strong>而 METR 论文原文写的是 7 个月</strong>，
      并且论文自己声明外部效度有限。
      宣称在传播中被压缩、被加速——所以永远去读一手来源。
    </Callout>

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

    <h2>这一节的每条说法，出处都在这里</h2>
    <div className="my-7 space-y-2">
      {[
        [
          "三个词的划分、验证层级",
          "2026 年综述 arXiv:2607.07663。作者单位不是主流实验室，自述考察 1250 篇，我没有逐篇核对——只当分类框架用。",
        ],
        [
          "「自纠无效」那三条结论",
          "Kamoi 等，TACL 2024（ACL Anthology 2024.tacl-1.78），我读到了结论原文。",
        ],
        [
          "FunSearch / RE-Bench / Absolute Zero / DGM / SICA",
          "各自论文的摘要或正文，数字与用词都直接取自原文。",
        ],
        [
          "模型崩溃「不可逆」",
          "Nature 2024（s41586-024-07566-y）原文用词。",
        ],
        [
          "「崩溃可以避免」",
          "2024 年另一篇工作：让真实数据累积而不是被替换。",
        ],
        [
          "Anthropic 的 80%",
          "其官网《When AI builds itself》，含他们自己注明的高估 caveat。",
        ],
        [
          "影子评测的拒稿结论",
          "2026 年 7 月论文 arXiv:2607.27191，含公开的评审与日志。",
        ],
      ].map(([k, v]) => (
        <div
          key={k}
          className="flex flex-col gap-1 rounded-md bg-surface px-5 py-3.5 sm:flex-row sm:gap-6"
        >
          <span className="w-52 shrink-0 text-meta font-semibold">{k}</span>
          <span className="text-meta text-fg-2">{v}</span>
        </div>
      ))}
    </div>

    <Unverified>
      有两处我<strong>没拿到一手正文</strong>，所以这一节里<strong>没有引用它们</strong>：
      一是 Chatham House、CACM 等第三方就「RSI 临近程度」表态的文章，站点被拦截；
      二是一份 20 余位作者（含 Hinton、Bengio 等）的联署报告，
      我只看到媒体转述、没找到报告本体。
      <br />
      <br />
      另外「自我确认循环」「多样性崩溃」我标了<strong>待核实</strong>——
      它们是转述，被引的原始文献我没抓到。
      <br />
      <br />
      最后一句判断：这件事<strong>在专业圈里并没有共识</strong>，
      连「怎么测量自我改进」都还没有公认方法。
      所以你不需要站队，只需要在听到说法时回到上面那三问。
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
      caption="卡点不在「能不能改」，而在「谁来证明改好了」。"
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      问它到底能改自己什么，以及它给自己打分可不可信。
    </p>
  ),
  demos: [
    {
      id: "what-can-you-change",
      label: "① 你能改自己什么",
      ask: "你能不能改进你自己的权重？",
      prompt:
        "请严格区分下面三件事，分别回答能或不能，并说明理由：\n1. 在一次对话里，修改你自己接下来要遵守的提示词\n2. 修改你外部工具的定义或代码\n3. 修改你自己的模型权重\n\n最后用一句话总结：这三件事里，哪一件才是真正的「自我改进」。",
      maxTokens: 16000,
      expect:
        "它应该答：①②在特定系统里可能做到，③做不到——权重由训练过程决定，它在对话里碰不到。这正好对应上一张表里「改什么」的那几行。",
    },
    {
      id: "self-grade",
      label: "② 让它给自己打分",
      ask: "先答一道题，再给自己的答案打分，并说明打分的依据。",
      prompt:
        "请完成下面两步，并清楚分开：\n\n第一步：回答这个问题——「一个房间里有 3 个人，每个人又带了 3 个包，每个包里装了 3 只猫。一共有几只猫？」\n\n第二步：给你自己的答案打分（0 到 100），并说明你的打分依据是什么、这个依据可靠在哪里、不可靠在哪里。",
      maxTokens: 16000,
      expect:
        "重点看第二步。它会给自己一个高分，并给出听起来合理的理由——但请注意：这个分数没有任何外部依据。这就是验证层级最下面那一层，也正是自我改进最容易走偏的地方。",
    },
  ],
};

export default content;
