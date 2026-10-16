import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { FlowAnim } from "@/components/anim/diagrams";
import { SandboxPicker } from "@/components/SandboxPicker";
import { Callout } from "@/components/Note";

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
    name: "问",
    what: "它每次要动手，都先停下来等你点头。",
    feel: "出厂默认。刚开始用就保持这个。",
  },
  {
    name: "不问",
    what: "需要审批的动作会被直接拒绝，不是放行。",
    feel: "这是给无人值守和 CI 用的严格模式：那种场合没人能点「同意」，所以干脆全拒。",
  },
];

/** 出厂的三档：一个选择器同时定下沙箱与审批 */
const PRESETS: [string, string, string][] = [
  ["仅可查看", "read-only", "每次都问"],
  ["工作区内修改（出厂默认）", "workspace-write", "每次都问"],
  ["完全权限", "danger-full-access", "不问（自动拒绝）"],
];

const theory = (
  <div className="prose-cn">
    <p>
      用 DSH 的时候，你一定会遇到那个停下来问你的弹窗。别紧张——
      它其实是个好消息：<strong>它在告诉你「我准备真的下手了」</strong>。
      第 1 节那道墙，现在要被越过去了，所以拦一下、问一句，是这套系统最该有的设计。
    </p>

    <h2>出厂是一个档位选择器，同时定下两件事</h2>
    <p>
      DSH 出厂界面上不是两个独立开关，而是<strong>一个权限档位</strong>：
      选一档，沙箱范围和审批方式就一起定了。
    </p>
    <div className="my-7 overflow-x-auto">
      <table className="w-full border-collapse text-meta">
        <thead>
          <tr className="text-fg-3">
            <th className="px-3 py-3 text-left font-medium">档位</th>
            <th className="px-3 py-3 text-left font-medium">沙箱</th>
            <th className="px-3 py-3 text-left font-medium">审批</th>
          </tr>
        </thead>
        <tbody>
          {PRESETS.map(([name, sb, ap]) => (
            <tr key={name} className="border-t border-hair align-top">
              <td className="px-3 py-3 text-fg">{name}</td>
              <td className="px-3 py-3 font-mono text-caption text-fg-2">
                {sb}
              </td>
              <td className="px-3 py-3 text-fg-2">{ap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h3>「不问」不是放行，是全都拒掉</h3>
    <div className="my-7 grid gap-4 sm:grid-cols-2">
      {APPROVAL.map((a) => (
        <div key={a.name} className="rounded-lg bg-surface p-5">
          <div className="text-body-sm font-semibold">{a.name}</div>
          <div className="mt-1.5 text-meta text-fg-2">{a.what}</div>
          <div className="mt-2 text-caption text-fg-3">{a.feel}</div>
        </div>
      ))}
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

    <Callout>
      这一条重要到值得单独说：<strong>插件不受沙箱约束。</strong>
      这不是第三方传闻——DSH 自己的实现文档写得很直白：
      「已安装的宿主代码在宿主进程内运行，<strong>不受工作区沙箱限制</strong>」，
      并且明说插件机制「不是防范恶意包代码的沙箱」。
      <br />
      <br />
      所以：<strong>装插件要当成装软件来对待，只装你信得过来源的。</strong>
      沙箱管得住模型去改文件，管不住你装进来的代码。
    </Callout>
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
      maxTokens: 16000,
      expect:
        "它会给出很具体的核对清单：目录里到底有什么、是不是软链接、有没有重要文件被误放进去、能不能先备份。这类问题问它，比问人快。",
    },
    {
      id: "what-not-to-share",
      label: "② 哪些东西不该发出去",
      ask: "让它读我的电脑之前，哪些信息我该先处理掉？",
      prompt:
        "我准备让一个能读我电脑文件的 AI 助手帮我整理资料。请列出我在开始之前应该处理掉的敏感信息类型，每类给一句具体的判断标准。",
      maxTokens: 16000,
      expect:
        "会提到密钥和口令、身份与银行信息、客户隐私数据、公司内部未公开材料。这份清单可以直接当你自己的使用前检查表。",
    },
  ],
};

export default content;
