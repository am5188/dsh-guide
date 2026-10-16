import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { SplitAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const SYMPTOMS: [string, string, string][] = [
  [
    "它说做完了，但文件没变",
    "它在“说”，没真的做",
    "看界面右边有没有变化。直接问它：“你实际执行了哪条命令？把输出贴给我。”",
  ],
  [
    "屏幕上出现一段红字，提到 sandbox",
    "被安全围栏拦住了",
    "它想动的东西在允许范围之外。要么把文件挪进工作目录，要么先想清楚再放宽权限。",
  ],
  [
    "回答是空白的",
    "思考把额度吃光了",
    "这是推理模型特有的现象：它先想、再答，想得太多就没额度写答案了。让它“直接给结论，不要展开”。",
  ],
  [
    "它绕来绕去不落地",
    "目标没说清",
    "打断它，把目标和验收标准一次说全。越模糊的目标，它越容易绕。",
  ],
  [
    "它读错了文件",
    "路径是靠猜的",
    "别用自然语言描述路径。用输入框里的 @ 去引用具体文件，让它拿到确定的那个。",
  ],
  [
    "它提到了一个根本不存在的能力",
    "幻觉",
    "要求它给出这个能力的命令或菜单路径。给不出来，就是编的。",
  ],
  [
    "聊久了它忘了前面说过的事",
    "早期内容被压缩掉了",
    "对话太长时，旧内容会被自动压缩。把关键信息重新贴一次，或者干脆开个新会话。",
  ],
];

const theory = (
  <div className="prose-cn">
    <p>
      出问题不用慌，绝大多数情况落在下面这七种里。真正有用的动作只有一个：
      <strong>别急着重问一遍，先看它到底说了什么</strong>
      ——重问是最常见的错误反应，问题没解决，还多花一次钱，
      而且它很可能换个方式再错一遍。
    </p>

    <SplitAnim
      left={{
        title: "错误反应",
        items: ["马上重问一遍", "换个说法再问", "多花一次钱", "它换个方式再错一遍"],
      }}
      right={{
        title: "正确反应",
        items: ["先停下来", "读它到底说了什么", "归到七类里的哪一类", "再决定怎么办"],
      }}
    />

    <div className="my-9 overflow-x-auto">
      <table className="w-full border-collapse text-meta">
        <thead>
          <tr className="text-fg-3">
            <th className="px-3 py-3 text-left font-medium">你看到的现象</th>
            <th className="px-3 py-3 text-left font-medium whitespace-nowrap">
              多半是什么
            </th>
            <th className="px-3 py-3 text-left font-medium">怎么做</th>
          </tr>
        </thead>
        <tbody>
          {SYMPTOMS.map(([a, b, c]) => (
            <tr key={a} className="border-t border-hair align-top">
              <td className="px-3 py-3 text-fg">{a}</td>
              <td className="px-3 py-3 whitespace-nowrap text-fg-3">{b}</td>
              <td className="px-3 py-3 text-fg-2">{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <Callout>
      上面第三行那个「回答是空白的」，是我们实测出来的：同一个模型、
      同一道题，输出额度给到 1200 时正文完全是空的，给到 3000 才有内容。
      所以空回答<strong>不是它坏了</strong>，是额度被思考吃完了。
      这是推理模型特有的一种“错误”，知道这一点能省你很多困惑。
    </Callout>

    <h3>一个万能动作：把报错原文交给它</h3>
    <p>
      遇到看不懂的报错，不用自己查。<strong>把报错原文一字不改地贴给它</strong>，加上下面这句：
    </p>
    <div className="my-7 rounded-lg bg-surface p-5">
      <div className="text-caption text-fg-3">照着抄</div>
      <p className="mt-2 border-l-2 border-accent pl-4 text-body-sm text-fg">
        先解释这行字在说什么，再给三个可能的原因，
        <strong>不要直接改东西</strong>。
      </p>
      <p className="mt-3 text-meta text-fg-2">
        最后半句很重要。否则它可能一边解释一边就把东西改了，而你还没搞清发生了什么。
      </p>
    </div>

    <h3>什么时候该放弃这一轮</h3>
    <div className="my-7 rounded-lg bg-surface p-5">
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-full"
          style={{ background: "var(--color-danger-500)" }}
          aria-hidden="true"
        />
        <span className="text-body-sm font-semibold">
          同一个问题连续两次没解决，就停
        </span>
      </div>
      <p className="mt-2 text-meta text-fg-2">
        正确做法是开一个新会话，把已知信息整理成一段话重新说清楚。
        带着一长串失败记录往下聊，它只会被那些失败带偏。
      </p>
    </div>
  </div>
);

const content: UnitContent = {
  animTitle: "遇到问题时的正确顺序",
  anim: (
    <SequenceAnim
      title="遇到问题时的正确顺序"
      caption="先读懂它说了什么再决定怎么办；跳过这两步是最浪费钱的错。"
      items={[
        { tag: "1", label: "停下来" },
        { tag: "2", label: "别重问" },
        { tag: "3", label: "读那行字" },
        { tag: "4", label: "归到哪一类" },
        { tag: "5", label: "再动手" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      下面这次调用是这一节最实用的动作：
      <strong className="font-semibold text-fg">把一段你看不懂的报错丢给它</strong>
      ，让它先解释、再列原因、但<strong className="font-semibold text-fg">不许动手改</strong>
      。这个话术可以直接搬去用。
    </p>
  ),
  demos: [
    {
      id: "explain-error",
      label: "① 让它只解释，不许动手",
      ask: "把一段看不懂的报错贴给它，要求它只解释、先别改。",
      prompt:
        "我遇到一个报错，原文如下：\n\n[sandbox: file access denied under workspace-write mode]\n\n要求：\n1. 先解释这行字到底在说什么（用大白话）\n2. 再列出 3 个最可能的原因，按可能性排序\n3. 每个原因各给一个验证办法\n4. 现在不要改动任何东西，也不要给我需要执行的命令\n\n请严格按这四点回答。",
      maxTokens: 4000,
      expect:
        "它会告诉你这是安全围栏在拦写入操作，并解释原因。注意第 4 条的作用——先把问题搞懂，再决定动不动手。",
    },
  ],
};

export default content;
