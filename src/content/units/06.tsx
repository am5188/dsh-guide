import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { FlowAnim } from "@/components/anim/diagrams";
import { SandboxPicker } from "@/components/SandboxPicker";
import { Callout, Unverified } from "@/components/Note";

/** 判断清单：按「风险等级」上色，比纯文字好扫 */
const JUDGE: { tag: string; tone: "ok" | "warn" | "stop" | "rule"; detail: string }[] = [
  {
    tag: "可以直接同意",
    tone: "ok",
    detail: "读文件、看目录、搜索——只要不往外发东西，风险都低。",
  },
  {
    tag: "先看一眼再同意",
    tone: "warn",
    detail: "凡是「写」「改」「删」「重命名」，先看它要动哪些文件、动成什么样。",
  },
  {
    tag: "应该拒绝",
    tone: "stop",
    detail:
      "范围含糊（“清理一下”）、指向系统目录或账号文件夹、或者要联网发送你的内容。",
  },
  {
    tag: "永远的原则",
    tone: "rule",
    detail: "不确定就先拒绝。拒绝了可以重来，改错了不一定能还原。",
  },
];

const TONE_DOT: Record<string, string> = {
  ok: "var(--color-ok-500)",
  warn: "var(--color-warn-500)",
  stop: "var(--color-danger-500)",
  rule: "var(--accent)",
};

/** 审批开关的两档 */
const APPROVAL: { name: string; what: string; feel: string }[] = [
  {
    name: "每次都问",
    what: "它每次要动手，都先停下来等你点头。",
    feel: "最安全，也最烦。刚开始用就选这个。",
  },
  {
    name: "不问",
    what: "它一路做下去，做完再告诉你。",
    feel: "省事，但出问题你只能在事后发现。",
  },
];

const theory = (
  <div className="prose-cn">
    <p>
      用 DSH 的时候，你一定会遇到那个停下来问你的弹窗。别紧张——
      它其实是个好消息：<strong>它在告诉你「我准备真的下手了」</strong>。
      第 1 节那道墙，现在要被越过去了，所以拦一下、问一句，是这套系统最该有的设计。
    </p>

    <h2>两个开关，各管一件事</h2>
    <div className="my-7 grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg bg-surface p-5">
        <div className="text-caption text-fg-3">开关一 · 审批</div>
        <div className="mt-3 space-y-3">
          {APPROVAL.map((a) => (
            <div key={a.name}>
              <div className="text-body-sm font-semibold">{a.name}</div>
              <div className="mt-0.5 text-meta text-fg-2">{a.what}</div>
              <div className="mt-1 text-caption text-fg-3">{a.feel}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg bg-surface p-5">
        <div className="text-caption text-fg-3">开关二 · 沙箱</div>
        <p className="mt-3 text-meta text-fg-2">
          它决定“允许动到多大范围”。右边这个是可以点的——
          <strong className="text-fg">点一下换一档</strong>
          ，看每一档分别允许什么。
        </p>
      </div>
    </div>

    <SandboxPicker />

    <h2>怎么判断该不该点同意</h2>
    <FlowAnim
      nodes={["它要动什么", "范围清不清楚", "搞坏了能不能重来", "再决定同不同意"]}
    />
    <div className="my-7 space-y-3">
      {JUDGE.map((j) => (
        <div key={j.tag} className="rounded-lg bg-surface p-5">
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: TONE_DOT[j.tone] }}
              aria-hidden="true"
            />
            <span className="text-body-sm font-semibold">{j.tag}</span>
          </div>
          <p className="mt-2 text-meta text-fg-2">{j.detail}</p>
        </div>
      ))}
    </div>

    <Callout>
      一条硬规矩：<strong>动手之前先让它复制一份</strong>。让它把要改的文件另存为
      <span className="font-mono text-caption">xxx.备份</span>
      ，再改原件。这条习惯能救你无数次。
    </Callout>

    <Unverified>
      有一条我读到的风险值得你记住，但它来自第三方实测报道、我没有亲自复现：
      <strong>插件可能不受沙箱约束</strong>
      ——有探针实验称，即使在「只读」档下，某些插件仍能读取 SSH 密钥目录、
      环境变量里的 API Key、并向外联网。
      所以：<strong>装插件要当成装软件来对待，只装你信得过来源的。</strong>
      这一条请在装任何插件前自行复核。
    </Unverified>
  </div>
);

const content: UnitContent = {
  animTitle: "它准备动手时会发生什么",
  anim: (
    <SequenceAnim
      title="它准备动手时会发生什么"
      caption="门开不开由你决定——这是全系统唯一真正由你掌控的环节。"
      items={[
        { tag: "1", label: "它想去改文件" },
        { tag: "2", label: "停在这道门" },
        { tag: "3", label: "告诉你改哪个" },
        { tag: "4", label: "你决定" },
        { tag: "5", label: "才真的动手" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      让它当一次风险顾问，把动手前该核对的事列出来。
    </p>
  ),
  demos: [
    {
      id: "should-i-approve",
      label: "① 这个操作该不该同意",
      ask: "它请求“删除 D:\\Work\\临时 目录下的所有文件”，我该同意吗？",
      prompt:
        "一个能真实读写我电脑文件的 AI 助手，向我请求权限：「删除 D:\\Work\\临时 目录下的所有文件」。请像风险顾问一样告诉我：我在点同意之前应该确认哪几件事？按重要性排序，不要泛泛而谈。",
      maxTokens: 4000,
      expect:
        "它会给出很具体的核对清单：目录里到底有什么、是不是软链接、有没有重要文件被误放进去、能不能先备份。这类问题问它，比问人快。",
    },
    {
      id: "what-not-to-share",
      label: "② 哪些东西不该发出去",
      ask: "让它读我的电脑之前，哪些信息我该先处理掉？",
      prompt:
        "我准备让一个能读我电脑文件的 AI 助手帮我整理资料。请列出我在开始之前应该处理掉的敏感信息类型，每类给一句具体的判断标准。",
      maxTokens: 4000,
      expect:
        "会提到密钥和口令、身份与银行信息、客户隐私数据、公司内部未公开材料。这份清单可以直接当你自己的使用前检查表。",
    },
  ],
};

export default content;
