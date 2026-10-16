import type { UnitContent } from "../types";
import { CompareAnim } from "@/components/anim/CompareAnim";
import { StackAnim, GaugeAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const KEEP: [string, string][] = [
  ["必须留", "你定下的规则、要遵守的格式、已经确认过的事实、当前任务的目标。"],
  ["可以丢", "客套话、试错过程、被推翻的中间方案、已经过时的临时结论。"],
  ["容易丢错", "很久以前随口说的一句限制条件（“金额别超过 5000”），丢了它就会犯规。"],
];

const theory = (
  <div className="prose-cn">
    <p>
      多轮对话的代价是内容越堆越长，而模型能一次接收的内容是有上限的。
      这个上限叫<strong>上下文窗口</strong>。
    </p>

    <h3>这个上限有多大</h3>
    <p>
      这里有个容易踩的坑：<strong>服务端公布的数字，和 DSH 自己用的数字不一样。</strong>
    </p>
    <div className="my-7 grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg bg-surface p-5">
        <div className="text-caption text-fg-3">上下文窗口 · DSH 实际使用</div>
        <div className="mt-2 font-mono text-[26px] leading-none text-fg">
          1,000,000
        </div>
        <div className="mt-2 text-meta text-fg-2">
          个 token。读自 DSH 内置的模型目录。
          <br />
          <span className="text-fg-3">
            服务端 <span className="font-mono">/models</span> 公布的是 1,048,576。
          </span>
        </div>
      </div>
      <div className="rounded-lg bg-surface p-5">
        <div className="text-caption text-fg-3">单次输出上限 · DSH 默认值</div>
        <div className="mt-2 font-mono text-[26px] leading-none text-fg">
          256,000
        </div>
        <div className="mt-2 text-meta text-fg-2">
          个 token。这是 DSH 发出请求时的默认值。
          <br />
          <span className="text-fg-3">
            服务端上限更高：393,216。
          </span>
        </div>
      </div>
    </div>
    <GaugeAnim
      value={0.256}
      label="输出默认上限 ÷ 上下文窗口"
      hint="256,000 ÷ 1,000,000"
      threshold={0.6}
      thresholdLabel="直觉上以为输出能占一半"
      caption="两个数字都不是猜的：一个读自 DSH 的模型目录，一个读自服务端接口。它们对不上，是因为 DSH 用的是自己内置的目录，不会去拉服务端那份。"
    />

    <p>
      另外记住：token 不是“字”，粗略理解成<strong>词的碎片</strong>就行，不用背精确换算——
      只要记住一件事：<strong>它很大，但它是有限的</strong>。
    </p>

    <Callout>
      窗口的另一头也有上限。我们实测过：同一道题，
      <strong>输出额度给到 1200 时正文完全是空的，给到 3000 才有内容</strong>
      ——因为推理模型的“思考”也占额度，思考用光了就没额度写答案了。
      “装不下”这件事，输入和输出两头都会发生。
    </Callout>

    <h3>装不下的时候怎么办</h3>
    <p>
      做法和人类开会很像：<strong>把旧的记录整理成摘要，用摘要替代原文</strong>
      。这就是“压缩”。它不会把所有内容原样留着，而是丢掉一部分、保留一部分。
    </p>

    <StackAnim
      items={[
        { label: "系统提示与工具说明", weight: 0.16 },
        { label: "你的资料原文", weight: 0.3 },
        { label: "中间几十轮的来回", weight: 0.38 },
        { label: "这一轮的新内容", weight: 0.24 },
      ]}
      capLabel="↑ 窗口上限"
      overLabel="超了就装不下——所以要先压缩"
    />

    <dl className="my-9 space-y-4">
      {KEEP.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 sm:flex-row sm:gap-5">
          <dt className="w-24 shrink-0 text-body-sm font-semibold">{k}</dt>
          <dd className="text-meta leading-relaxed text-fg-2">{v}</dd>
        </div>
      ))}
    </dl>

    <p>
      所以如果你发现聊到很后面，它忽然“忘了”某个早期要求，
      多半就是这个要求被压掉了。<strong>补一句重新说明就行</strong>，
      不用重新开一轮。
    </p>

    <h3>它到底什么时候压、留下什么</h3>
    <p>
      这几条读自 DSH 的实现文档，是它的默认值，不是我的猜测：
    </p>
    <div className="my-7 space-y-2">
      {[
        ["什么时候触发", "上下文用到约 80% 时自动压缩；也可以随时手动 /compact"],
        ["保留多少原文", "最近约 16% 的历史逐字保留，其余交给摘要"],
        ["给输出留多少余量", "预留 65,536 token 的头部空间，避免它没地方写答案"],
        ["摘要是什么", "压缩会额外发一次模型请求，只留那次返回的摘要文本"],
        ["压缩不了什么", "系统提示词、工具说明、会话前缀不在压缩范围内"],
      ].map(([k, v]) => (
        <div
          key={k}
          className="flex flex-col gap-1 rounded-md bg-surface px-5 py-3.5 sm:flex-row sm:gap-6"
        >
          <span className="w-32 shrink-0 text-meta font-semibold">{k}</span>
          <span className="text-meta text-fg-2">{v}</span>
        </div>
      ))}
    </div>

    <Callout>
      把两条合起来看，就是最实用的一条建议：
      <strong>把你的硬性要求写在一份文件里</strong>，需要时让它重新读一遍，
      而不是指望它一直记着。
    </Callout>
  </div>
);

const content: UnitContent = {
  animTitle: "一直往里塞，还是该丢就丢",
  anim: (
    <CompareAnim
      title="一直往里塞，还是该丢就丢"
      left={{
        label: "不加处理",
        lines: ["第 20 轮还在带第 1 轮", "内容越滚越大", "越来越贵、越来越慢", "最后塞不下"],
      }}
      right={{
        label: "压缩之后",
        lines: ["旧对话变成摘要", "规则和目标留下", "试错过程丢掉", "一直能继续聊"],
      }}
      caption="有些限制条件当时看着不起眼，后面才发现不能丢。"
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      亲手做一次压缩，看它丢掉哪些、留下哪些。
    </p>
  ),
  demos: [
    {
      id: "compress",
      label: "① 亲手压一次",
      ask: "把这段又长又乱的对话压成能继续往下用的摘要。",
      prompt:
        "下面是一段工作对话记录。请把它压缩成一段不超过 200 字的摘要，供后续继续使用。\n\n严格要求：\n1. 所有「已经确认的事实」和「必须遵守的限制条件」一个字都不能丢\n2. 客套话、试错过程、被推翻的方案可以全部丢掉\n3. 最后单独列一行「不可丢失的信息」，把上面第 1 类逐条列出来\n\n对话记录：\n客户想要一批夏装，先看了 A 款，觉得太贵；后来看了 B 款，颜色不喜欢。最终定了 C 款，数量 300 件，单价 68 元。\n预算上限是总额不超过 2 万元，这一条客户强调过两次。\n交期希望是 30 天内，但如果做不到可以商量。\n中间我们试过推荐 D 款，客户说款式太老，已经排除。\n付款方式客户希望先付三成定金。\n客户联系人姓陈，习惯上午联系，下午开会不在。",
      maxTokens: 4000,
      expect:
        "重点检查两件事：它有没有保留「总额不超过 2 万元」，有没有保留「先付三成定金」。这两条就是那种“当时不起眼、丢了会出事”的信息。",
    },
  ],
};

export default content;
