import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { StackAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const theory = (
  <div className="prose-cn">
    <p>补上一节的洞，办法很粗暴：<strong>每次提问，都把前面的对话一起发过去</strong>。</p>

    <h3>它到底发生了什么</h3>
    <p>你问第三句的时候，程序实际发过去的是三段内容，而不是一句：</p>

    <div className="my-9 rounded-lg bg-surface p-6">
      <pre className="overflow-x-auto font-mono text-caption leading-relaxed text-fg-2">
        {`[
  { "role": "user",      "content": "我叫小明。" },
  { "role": "assistant", "content": "好的，小明。" },
  { "role": "user",      "content": "我叫什么？" }
]`}
      </pre>
    </div>

    <Callout>
      记住这个结论，它会改变你很多用法上的判断：
      <strong>“它记住了”其实是“它又被喂了一遍”。</strong>
      所以每多聊一轮，发过去的内容就长一截，花的钱也多一截。
    </Callout>

    <h3>这个做法带来了两个新麻烦</h3>
    <StackAnim
      items={[
        { label: "第 1 轮", weight: 0.1 },
        { label: "第 2 轮", weight: 0.16 },
        { label: "第 3 轮", weight: 0.22 },
        { label: "第 4 轮", weight: 0.26 },
        { label: "第 5 轮", weight: 0.34 },
      ]}
      capLabel="↑ 每一轮都要把全部历史重新发一遍"
      overLabel="越聊越长，迟早装不下"
    />

    <h3>对你有什么用</h3>
    <p>
      知道这件事之后，你会自然养成一个习惯：
      <strong>关键信息在前几轮就说清楚</strong>，别指望聊到一大半再补。
      因为越靠后的内容，越可能被压缩掉（第 12 节会讲）。
    </p>
  </div>
);

const content: UnitContent = {
  animTitle: "“记得住”是外面替它记的",
  anim: (
    <SequenceAnim
      title="“记得住”是外面替它记的"
      caption="所谓「记忆」，就是这一遍又一遍的重发。"
      items={[
        { tag: "第1轮", label: "只发 1 句" },
        { tag: "第2轮", label: "发 3 句" },
        { tag: "第3轮", label: "发 5 句" },
        { tag: "第4轮", label: "发 7 句" },
        { tag: "越聊越长", label: "也越来越贵" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      同一个问题问两次，区别只在第二次带上了前文。
    </p>
  ),
  demos: [
    {
      id: "no-history",
      label: "① 不带历史",
      ask: "（前面说过“我叫小明”）现在问：我叫什么？",
      prompt: "我叫什么？",
      maxTokens: 2500,
      expect: "它不知道。因为它这次只收到了这一句话。",
    },
    {
      id: "with-history",
      label: "② 把历史一起发过去",
      ask: "三轮一起发：我叫小明 → 好的 → 我叫什么？",
      messages: [
        { role: "user", content: "我叫小明。" },
        { role: "assistant", content: "好的，小明。" },
        { role: "user", content: "我叫什么？" },
      ],
      prompt: "我叫什么？",
      maxTokens: 2500,
      expect:
        "它答得出“小明”。请特别注意：它并没有变得“有记性”了——只是你这次把前面的话又抄了一遍。",
    },
  ],
  python: {
    intro: (
      <p className="text-body-sm text-fg-2">
        下面这段 Python <strong className="font-semibold text-fg">一次跑出两种结果</strong>
        ：先用单句问，再把历史一起发。差别在你自己眼前发生，
        而不是听我说。
      </p>
    ),
    demos: [
      {
        id: "memory-diff",
        label: "① 一次跑出两种结果",
        explain:
          "同一个函数、同一个问题，唯一区别是第二次多带了前两轮。跑完对比两行输出。",
        code: `import requests


def ask(messages):
    resp = requests.post(
        "https://api.deepseek.com/chat/completions",
        headers={"Authorization": "Bearer " + DSH_API_KEY},
        json={"model": "deepseek-flash", "max_tokens": 800, "messages": messages},
    )
    return resp.json()["choices"][0]["message"]["content"]


# ① 只发最后一句
print("① 只发最后一句：")
print("   ", ask([{"role": "user", "content": "我叫什么？"}]))

# ② 把前面的对话一起发过去
history = [
    {"role": "user", "content": "我叫小明。"},
    {"role": "assistant", "content": "好的，小明。"},
    {"role": "user", "content": "我叫什么？"},
]
print("② 带上历史：")
print("   ", ask(history))

print()
print("第二行多带了两条消息，它就从“不知道”变成了“知道”。")`,
      },
    ],
  },
};

export default content;
