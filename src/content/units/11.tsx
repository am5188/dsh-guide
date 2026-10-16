import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { Callout } from "@/components/Note";

const theory = (
  <div className="prose-cn">
    <p>
      上一节的洞，补起来其实很简单粗暴：<strong>每次提问，都把前面的对话一起发过去</strong>
      。这就是“多轮对话”的全部秘密。
    </p>

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

    <p>
      模型的回答之所以显得“记得”，是因为<strong>你（准确说是 DSH）把前面的话又抄了一遍给它</strong>
      。记性不在模型身上，在外面那层系统身上。
    </p>

    <Callout>
      记住这个结论，它会改变你很多用法上的判断：
      <strong>“它记住了”其实是“它又被喂了一遍”。</strong>
      所以每多聊一轮，发过去的内容就长一截，花的钱也多一截。
    </Callout>

    <h3>这个做法带来了两个新麻烦</h3>
    <p>
      第一，<strong>越来越贵、越来越慢</strong>。第十轮对话要把前九轮全带上。
      第二，<strong>总有装不下的时候</strong>——这正是下面两节要解决的问题。
    </p>

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
      caption="注意每一轮发出去的内容都在变长：第 3 轮要带上前两轮，第 4 轮要带上前三轮。所谓“记忆”，就是这一遍又一遍的重复发送。"
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
      下面两次调用用的是<strong className="font-semibold text-fg">同一个模型、同一个问题</strong>
      ，唯一的区别是第二次把前面的对话一起发了过去。
      这个对比是整本书里最值得你自己跑一遍的一个。
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
};

export default content;
