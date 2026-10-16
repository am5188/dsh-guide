import type { UnitContent } from "../types";
import { CompareAnim } from "@/components/anim/CompareAnim";
import { FlowAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

/** 两条路的对照 */
const ROADS: {
  name: string;
  how: string;
  cost: string;
  update: string;
  good: boolean;
}[] = [
  {
    name: "把资料训进模型",
    how: "让模型“学会”你的资料",
    cost: "极高",
    update: "资料一改就得重来",
    good: false,
  },
  {
    name: "需要时把资料递过去",
    how: "用时把原文一起发过去",
    cost: "几乎为零",
    update: "换一份新资料即可",
    good: true,
  },
];

/** RAG 的三步 */
const STEPS: [string, string][] = [
  ["找到", "从你的资料里挑出和这个问题相关的那几段"],
  ["一起发", "把挑出来的原文，连同你的问题一起交给模型"],
  ["核得动", "答案的依据就在对话里，你能一条条对回去"],
];

/** 拿到答案后必须回原文核对的信息 */
const MUST_CHECK = ["数字", "日期", "金额", "条款编号"];

function Theory() {
  return (
    <div className="prose-cn">
      <p>
        上一节解决了“记住你说过的话”。但还有个更大的问题：
        <strong>它完全不知道你的资料</strong>——你公司的规定、手上的合同、刚做完的表，
        从来没进过它的训练数据。而第 1 节我们已经见过，这种情况下它会干什么：<strong>编</strong>。
      </p>

      <h2>两条路，选更实用的那条</h2>
      <div className="my-7 grid gap-4 sm:grid-cols-2">
        {ROADS.map((r) => (
          <div
            key={r.name}
            className="rounded-lg bg-surface p-5"
            style={{
              borderLeft: `3px solid ${
                r.good ? "var(--color-ok-500)" : "var(--line)"
              }`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="size-1.5 rounded-full"
                style={{
                  background: r.good
                    ? "var(--color-ok-500)"
                    : "var(--color-fg-3, #81858c)",
                }}
                aria-hidden="true"
              />
              <span className="text-body-sm font-semibold">{r.name}</span>
            </div>
            <p className="mt-2 text-meta text-fg-2">{r.how}</p>
            <dl className="mt-4 space-y-1.5 text-caption">
              <div className="flex justify-between gap-3">
                <dt className="text-fg-3">成本</dt>
                <dd className="text-fg-2">{r.cost}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-fg-3">资料更新时</dt>
                <dd className="text-fg-2">{r.update}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
      <p>
        右边这条路的正式名字叫<strong>检索增强生成</strong>（RAG）。
        名字拗口，做法一句话说完。
      </p>

      <h2>三步，就这么简单</h2>
      <FlowAnim
        nodes={["找到相关资料", "连同问题一起发", "答案有据可查"]}
      />

      <Callout>
        它把“问一个什么都懂但会编的模型”，变成了
        <strong>“问一个只看过你给的材料的助手”</strong>。后者你能核对——这就是全部意义。
      </Callout>

      <h2>拿到答案之后，这四类信息必须自己回原文核</h2>
      <p>
        递资料只解决“它有没有看到”，不解决“它有没有看懂”。材料里写了三行，它可能只用了其中一行。
      </p>
      <div className="my-6 flex flex-wrap gap-2">
        {MUST_CHECK.map((k) => (
          <span
            key={k}
            className="rounded-sm bg-warn-100 px-3 py-1.5 text-meta text-warn-600 dark:bg-warn-900 dark:text-warn-400"
          >
            {k}
          </span>
        ))}
      </div>

      <h2>资料不多的时候，别搞复杂</h2>
      <div className="my-7 space-y-3">
        {[
          ["几页纸，贴得下", "直接复制粘贴进对话。这就是最朴素、也最常用的用法。"],
          [
            "几百页，贴不下",
            "才需要真正的“检索”——让它去你的文件夹里找相关片段，再交给你。",
          ],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex flex-col gap-1 rounded-md bg-surface px-5 py-4 sm:flex-row sm:gap-6"
          >
            <span className="w-40 shrink-0 text-body-sm font-semibold">
              {k}
            </span>
            <span className="text-meta text-fg-2">{v}</span>
          </div>
        ))}
      </div>

      <p>
        最后配一句最好用的话，和第 7 节那条一起记：
        <strong>“只依据我给你的材料回答，材料里没有的就说没有。”</strong>
      </p>
    </div>
  );
}

const content: UnitContent = {
  animTitle: "指望它记住，还是当场递给它",
  anim: (
    <CompareAnim
      title="指望它记住，还是当场递给它"
      left={{
        label: "指望它记住",
        lines: ["资料没进过它脑子", "它只能猜", "猜得很像真的", "你没法核对"],
      }}
      right={{
        label: "需要时递给它",
        lines: ["把原文一起发过去", "要求只看材料", "答案有据可查", "你能逐条核对"],
      }}
      caption="区别只在于你有没有把材料一起发过去。"
    />
  ),
  theory: <Theory />,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      RAG 的最小形态：把材料连同问题一起发过去。
    </p>
  ),
  demos: [
    {
      id: "grounded",
      label: "① 只依据材料回答",
      ask: "拿一段公司规定问它问题，要求材料里没有就说没有。",
      prompt:
        "下面是我们公司的差旅报销规定，请只依据这段材料回答我的问题。材料里没有的内容，直接回答“材料里没有写”，不要推测，不要补充你自己的常识。\n\n【材料】\n1. 市内交通费凭票报销，单次超过 200 元的需提前申请。\n2. 住宿费标准：一线城市每人每晚不超过 600 元，其他城市不超过 400 元。\n3. 单笔报销金额超过 1200 元的，必须由部门负责人和财务两人签字。\n4. 报销单据须在费用发生后 30 日内提交。\n5. 餐费补贴每人每天 100 元，不需要发票。\n\n【问题】\n1. 我在二线城市出差，住宿花了 520 元一晚，合规吗？\n2. 我有一笔 1500 元的报销，需要几个人签字？\n3. 出差的机票可以报销吗？",
      maxTokens: 4000,
      expect:
        "前两问它应该答得又准又稳（第二问是 1200 元那条规则）。第三问材料里确实没写——看它有没有老实说“材料里没有写”，而不是顺着常识答“可以”。",
    },
  ],
};

export default content;
