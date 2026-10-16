import type { UnitContent } from "../types";
import { CompareAnim } from "@/components/anim/CompareAnim";
import { SplitAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const theory = (
  <div className="prose-cn">
    <p>
      前面七节一路在加能力：记忆、资料、工具、技能、长时运行、分工。
      这一节说的是<strong>代价</strong>。
    </p>

    <SplitAnim
      left={{
        title: "它只会说的时代",
        items: ["最坏是说错话", "你可以不理它", "代价按分钟算", "不需要有人守门"],
      }}
      right={{
        title: "它能动手之后",
        items: ["最坏是做错事", "可能要收拾几天", "代价可能不可逆", "必须有人守门"],
      }}
    />

    <div className="my-9 rounded-lg bg-surface p-6">
      <div className="text-body-sm font-semibold">一个必须接受的现实</div>
      <p className="mt-3 text-meta leading-relaxed text-fg-2">
        它会犯错。不是偶尔，是必然会。
        <strong>所有安全设计，都建立在「承认它会犯错」这个前提上。</strong>
      </p>
    </div>

    <h3>于是有了三层约束</h3>
    <dl className="my-9 space-y-5">
      {[
        [
          "权限门",
          "动手之前先问你一句。它是最后一道人工检查点，也是唯一由你直接掌控的环节。",
        ],
        [
          "沙箱",
          "限制它的活动范围。就算它想乱来，也够不到范围之外的东西。",
        ],
        [
          "可追溯",
          "它做了什么、改了哪些文件，你事后能查。出了问题能定位，能回退。",
        ],
      ].map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 sm:flex-row sm:gap-5">
          <dt className="w-24 shrink-0 text-body-sm font-semibold">{k}</dt>
          <dd className="text-meta leading-relaxed text-fg-2">{v}</dd>
        </div>
      ))}
    </dl>

    <Callout>
      一个反直觉但很重要的结论：
      <strong>把所有限制都关掉，得到的不是“更强的助手”，而是“更危险的工具”</strong>
      。限制不是能力的对立面，它是能力可用的前提——
      正因为有边界，你才敢让它真的动手。
    </Callout>

    <h3>给普通人的三条设置建议</h3>
    <p>
      ① 日常保持<strong>每次都问</strong>；② 沙箱放在<strong>限定工作区</strong>；
      ③ 大动作之前<strong>先备份</strong>。
    </p>
  </div>
);

const content: UnitContent = {
  animTitle: "能力涨了，边界也得跟着涨",
  anim: (
    <CompareAnim
      title="能力涨了，边界也得跟着涨"
      left={{
        label: "只加能力，不加边界",
        lines: ["它能读写你的文件", "它能跑命令", "它能联网", "出错时没人拦得住"],
      }}
      right={{
        label: "能力和边界同步",
        lines: ["同样能读写", "但动手前问你", "活动范围有限制", "做了什么都留痕"],
      }}
      caption="它没有牺牲能力，只是给每项能力配了一道闸。"
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      下面这次调用让模型做一次「最坏情况推演」。
      它会给你一份清单——那份清单，就是你每次点“同意”之前该想一遍的东西。
    </p>
  ),
  demos: [
    {
      id: "worst-case",
      label: "① 最坏能坏到什么程度",
      ask: "一个能读写我电脑、能联网、且没有任何限制的助手，最坏能造成什么后果？",
      prompt:
        "假设有一个 AI 助手：能读写我电脑上的任何文件、能执行任何命令、能联网，并且没有任何权限检查或活动范围限制。\n\n请列出它能造成的最严重的 5 类后果，每类给一个具体场景（不要泛泛说“数据泄露”）。然后针对每一类，给出一个能挡住它的最简措施。\n\n请按后果严重程度排序。",
      maxTokens: 4000,
      expect:
        "它会给出很具体的场景，以及对应的最小防护措施。看完这份清单你会理解：为什么默认设置是保守的，而不是设计者小气。",
    },
  ],
};

export default content;
