import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { SandboxPicker } from "@/components/SandboxPicker";
import { Callout, Unverified } from "@/components/Note";

const JUDGE: [string, string][] = [
  ["可以直接同意", "读文件、看目录、搜索——只要不往外发东西，风险都低。"],
  [
    "先看一眼再同意",
    "凡是「写」「改」「删」「重命名」，先看它要动哪些文件、动成什么样。",
  ],
  [
    "应该拒绝",
    "范围含糊（“清理一下”）、指向系统目录或账号文件夹、或者要联网发送你的内容。",
  ],
  ["永远的原则", "不确定就先拒绝。拒绝了可以重来，改错了不一定能还原。"],
];

const theory = (
  <div className="prose-cn">
    <p>
      用 DSH 的时候，你一定会遇到那个停下来问你的弹窗。很多人第一次见会紧张，
      但它其实是个好消息：<strong>它在告诉你“我准备真的下手了”</strong>
      。
    </p>
    <p>
      回想第 1 节那道墙——模型只会说，不会做。现在它要越过那道墙了，
      所以拦一下、问一句，是这套系统里最该有的设计。
    </p>

    <h3>它会被允许做到什么程度</h3>
    <p>
      这个程度由「沙箱」决定，大致三档。下面这个是可以点的——
      <strong>点一下换一档，看它分别允许什么</strong>
      ，比看表格直观。
    </p>

    <SandboxPicker />

    <p>
      另外还有一个开关叫「审批」：它决定每次动手前要不要问你。
      调到「每次都问」最安全但最烦；调到「不问」它就会一路做下去。
      <strong>刚开始用，就保持每次都问。</strong>
    </p>

    <h3>怎么判断该不该点同意</h3>
    <dl className="my-9 space-y-4">
      {JUDGE.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 sm:flex-row sm:gap-5">
          <dt className="w-40 shrink-0 text-body-sm font-semibold">{k}</dt>
          <dd className="text-meta leading-relaxed text-fg-2">{v}</dd>
        </div>
      ))}
    </dl>

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
      caption="你交代的活儿一旦需要碰文件，它不能直接做，必须先走到这道门上。门开不开，由你决定——这是整套系统里唯一一个真正由你掌控的环节。"
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
      下面两次调用让模型给你当一次「风险顾问」——这是它在没有动手能力时最擅长的事：
      把风险讲清楚。第二个问题尤其值得你自己跑一遍。
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
