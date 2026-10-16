import type { UnitContent } from "../types";
import { CompareAnim } from "@/components/anim/CompareAnim";
import { Callout } from "@/components/Note";

const theory = (
  <div className="prose-cn">
    <p>
      第 1 节我说过它“写完就忘”。这一节我们把这件事看透，
      因为后面所有关于记忆的功能，都是在补这一个洞。
    </p>

    <h3>真相：每一次调用都是一次性的</h3>
    <p>
      你按下发送，程序做的事情其实很朴素：
      <strong>把这段文字打包，发出去，拿回一段文字，这次调用就结束了</strong>
      。服务器那边不会为你保留任何东西。
    </p>
    <p>
      所以下一次你再发一句话，对模型来说是一个<strong>全新的开始</strong>。
      它不知道你是谁，不知道你刚才说了什么，甚至不知道这是第几次对话——
      除非你把这些信息<strong>再发一遍</strong>。
    </p>

    <div className="my-9 rounded-lg bg-surface p-6">
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
};

export default content;
