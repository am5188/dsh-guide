import type { UnitContent } from "../types";
import { CompareAnim } from "@/components/anim/CompareAnim";
import { FlowAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const theory = (
  <div className="prose-cn">
    <p>
      第 1 节我说过它“写完就忘”。这一节我们把这件事看透，
      因为后面所有关于记忆的功能，都是在补这一个洞。
    </p>

    <h3>真相：每一次调用都是一次性的</h3>
    <FlowAnim
      nodes={["打包这段文字", "发出去", "拿回一段文字", "结束，什么都不留"]}
      caption="服务器那边不会为你保留任何东西。下一次你再发一句话，对模型来说是一个全新的开始——它不知道你是谁、不知道你刚才说了什么、甚至不知道这是第几次对话。除非你把这些信息再发一遍。"
    />

    <div className="my-7 rounded-lg bg-surface p-6">
      <div className="text-body-sm font-semibold">一个好用的类比</div>
      <p className="mt-3 text-meta leading-relaxed text-fg-2">
        把它想成一家公司的<strong>轮班咨询台</strong>：每一通电话都换一个刚上班的顾问。
        他能力很强，但桌上什么文件都没有。
        你上一通电话跟另一位顾问说过的事，他完全不知道——
        除非你在这一通电话里再讲一遍。
      </p>
    </div>

    <Callout>
      这不是缺陷，是<strong>设计如此</strong>。一次性调用意味着便宜、可控、可以无限并行。
      需要“记忆”的时候，由外面那层系统负责把该带的信息带上——
      这就是下一节要讲的事。
    </Callout>

    <h3>这个概念的名字</h3>
    <p>
      在 DSH 的界面里，你看到的一段连续对话叫一个<strong>会话</strong>。
      会话之所以能连着聊，完全是外面在替你保管并重新发送历史。
      理解了这一点，你以后遇到“它怎么突然忘了”就不会困惑了。
    </p>
  </div>
);

const content: UnitContent = {
  animTitle: "两次调用之间，什么都没有留下",
  anim: (
    <CompareAnim
      title="两次调用之间，什么都没有留下"
      left={{
        label: "第一次调用",
        lines: ["你：我叫小明。", "它：好的，小明。", "（这次调用结束）"],
      }}
      right={{
        label: "第二次调用（另起一次）",
        lines: ["你：我叫什么？", "它：我不知道你的名字。", "它确实没见过上一句"],
      }}
      caption="把这两次调用想成两个互不相识的人。它不是忘了，而是根本就没见过。整套关于“记忆”的机制，都是在解决这一个问题。"
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      下面这次调用就是“单次调用”最纯粹的样子：只发一句话，别的什么都不带。
      你自己跑一遍，就明白为什么它答不出来。
    </p>
  ),
  demos: [
    {
      id: "single",
      label: "① 只发一句话",
      ask: "我叫什么？",
      prompt: "我叫什么？",
      maxTokens: 2500,
      expect:
        "它会老实说不知道。这一跑没有任何悬念——但正是这个“没有悬念”，撑起了后面的全部设计。",
    },
    {
      id: "proof",
      label: "② 让它解释自己的处境",
      ask: "你能看到我们之前的对话吗？",
      prompt:
        "请准确回答：在你这一次回复中，你能看到我和你在这次回复之前的任何对话内容吗？请直接回答能或不能，并说明你这一次实际能看到的信息是什么。",
      maxTokens: 3000,
      expect:
        "它会说“看不到”——因为这一次发过去的确实只有这一段话。它的回答本身就是这个机制的证明。",
    },
  ],
  python: {
    intro: (
      <p className="text-body-sm text-fg-2">
        下面这段是<strong className="font-semibold text-fg">真正的 Python</strong>
        。它把「单次调用」的请求体原样写了出来——你可以清楚看到，
        发过去的东西里<strong className="font-semibold text-fg">只有一句话</strong>
        ，没有任何历史。
      </p>
    ),
    demos: [
      {
        id: "raw-call",
        label: "① 一次最纯粹的调用",
        explain:
          "这段代码只发一句话。注意 messages 里只有一个元素——这就是“单次调用”的字面意思。",
        code: `import requests

# 一次「单次调用」：只发一句话，其它什么都不带
resp = requests.post(
    "https://api.deepseek.com/chat/completions",
    headers={"Authorization": "Bearer " + DSH_API_KEY},
    json={
        "model": "deepseek-flash",
        "max_tokens": 800,
        "messages": [{"role": "user", "content": "我叫什么？"}],
    },
)

print("HTTP 状态码：", resp.status_code)
print("发过去的内容：只有「我叫什么？」这一句")
print("它的回答：", resp.json()["choices"][0]["message"]["content"])`,
      },
    ],
  },
};

export default content;
