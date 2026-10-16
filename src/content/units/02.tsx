import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { FlowAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const EVOLUTION: [string, string, string, string][] = [
  ["2022", "说完就忘", "把前几句一起发回去", "会话"],
  ["2023", "历史越堆越长，装不下", "该丢的丢，该留的留", "上下文压缩"],
  ["2023", "它不知道你的资料", "需要时把资料递给它", "文件与检索"],
  ["2023", "它动不了手", "让它自己决定该调哪个工具", "工具"],
  ["2024", "工具多到记不住", "把一套做法打包起来", "技能"],
  ["2025", "任务太长会跑偏", "先定目标，再留检查点", "目标与检查点"],
  ["2025", "一个角色干不完", "拆给几个角色再汇总", "子智能体"],
  ["2025", "手脚放开有风险", "该问的问，该拦的拦", "审批与沙箱"],
  ["2026", "零件都齐了，没人装", "一个运行时把它们组合起来", "DSH"],
];

const theory = (
  <div className="prose-cn">
    <p>
      下面这张表是这份指南的脊椎。左边一列是<strong>当年的真实痛点</strong>
      ，中间一列是<strong>为此加上的东西</strong>，右边一列是
      <strong>它今天在 DSH 里叫什么名字</strong>。
    </p>
    <p>
      你会发现一个规律：<strong>没有一步是“顺便做做”的</strong>
      。每一个新能力，都是被一个具体的失败逼出来的。
      所以第 10 节往后，我会按这条线一节一节走，每节先给你看那个失败长什么样。
    </p>

    <FlowAnim
      nodes={["撞上一个具体的失败", "为它加一块能力", "继续用，继续撞", "再加下一块"]}
    />

    <div className="my-9 overflow-x-auto">
      <table className="w-full border-collapse text-meta">
        <thead>
          <tr className="text-fg-3">
            <th className="px-3 py-3 text-left font-medium whitespace-nowrap">
              时间
            </th>
            <th className="px-3 py-3 text-left font-medium">当时的痛点</th>
            <th className="px-3 py-3 text-left font-medium">于是加上了</th>
            <th className="px-3 py-3 text-left font-medium whitespace-nowrap">
              今天叫
            </th>
          </tr>
        </thead>
        <tbody>
          {EVOLUTION.map(([year, pain, fix, name]) => (
            <tr key={name} className="border-t border-hair align-top">
              <td className="px-3 py-3 font-mono text-fg-3 whitespace-nowrap">
                {year}
              </td>
              <td className="px-3 py-3 text-fg-2">{pain}</td>
              <td className="px-3 py-3 text-fg-2">{fix}</td>
              <td className="px-3 py-3 whitespace-nowrap text-fg">{name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <Callout>
      这张表不是“AI 编年史”，只挑了和<strong>你能用它干什么</strong>
      直接相关的节点。想知道完整历史，看另一本书《从图灵到 Harness》。
    </Callout>

    <h3>为什么要按这条线学，而不是直接背功能清单</h3>
    <p>
      因为 DSH 的功能清单很长，硬背记不住，也不知道什么时候该用哪个。
      但如果每个功能你都见过它诞生时解决的那个麻烦，你就能自己判断：
      <strong>我现在遇到的，是不是当年那个麻烦？</strong>
      是的话，对应的功能拿来用就行了。
    </p>
  </div>
);

const content: UnitContent = {
  animTitle: "能力是怎么一块块长出来的",
  anim: (
    <SequenceAnim
      title="能力是怎么一块块长出来的"
      caption="每一步都不是规划出来的，是被失败逼出来的。"
      items={[
        { tag: "2022", label: "会说" },
        { tag: "2023", label: "记得住" },
        { tag: "2023", label: "查得到" },
        { tag: "2023", label: "动得了手" },
        { tag: "2024", label: "管得住" },
        { tag: "2025", label: "干得久" },
        { tag: "2025", label: "分得开" },
        { tag: "2026", label: "拼起来" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      下面两次是同一个问题、同一个模型，区别只在有没有带上历史。
    </p>
  ),
  demos: [
    {
      id: "no-history",
      label: "① 不带历史",
      ask: "（上一轮你说过“我叫小明”）现在问：我叫什么？",
      prompt: "我叫什么？",
      maxTokens: 16000,
      expect:
        "它不知道。因为它这次只收到了“我叫什么？”这一句——你上一轮说的话，它根本没看到。",
    },
    {
      id: "with-history",
      label: "② 把历史一起发过去",
      ask: "把三轮对话一起发：我叫小明 → 好的 → 我叫什么？",
      messages: [
        { role: "user", content: "我叫小明。" },
        { role: "assistant", content: "好的，小明。" },
        { role: "user", content: "我叫什么？" },
      ],
      prompt: "我叫什么？",
      maxTokens: 16000,
      expect:
        "它答得出“小明”。注意：不是它记住了，是你这次把前面的话又抄了一遍给它——真正做这件事的是外面那层系统。",
    },
  ],
};

export default content;
