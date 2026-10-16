import type { UnitContent } from "../types";
import { CompareAnim } from "@/components/anim/CompareAnim";
import { SplitAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const PAIRS: [string, string, string][] = [
  [
    "做什么",
    "帮我弄个周报",
    "把这周这 5 条记录，写成一份 400 字左右的周报",
  ],
  [
    "给什么材料",
    "（什么都没给）",
    "材料在下面，我会一起贴给你",
  ],
  [
    "要什么格式",
    "（没说）",
    "分三段：本周进展、遇到的问题、下周计划",
  ],
  [
    "怎么算做完",
    "（没说）",
    "每段不超过 3 句话，不要出现“持续推进”这种空话",
  ],
];

const theory = (
  <div className="prose-cn">
    <p>
      跟 DSH 打交道，成败的八成在第一句话。好消息是：把话说清楚有固定套路，
      记住三件事就够了——<strong>说清目标、给足材料、定验收标准</strong>。
    </p>

    <SplitAnim
      left={{
        title: "含糊地说",
        items: ["它只能猜", "猜错了你得重来", "来回好几轮", "最后还是你自己动手"],
      }}
      right={{
        title: "按套路说",
        items: ["目标说清", "材料给足", "格式定死", "验收标准写明"],
      }}
      caption="左边这条路不是它笨，是它真的没有别的依据。右边四件事你每次都说，成功率会高一个量级。"
    />

    <p>下面这张表是逐项对照，可以直接当模板抄。</p>
    <div className="my-9 overflow-x-auto">
      <table className="w-full border-collapse text-meta">
        <thead>
          <tr className="text-fg-3">
            <th className="px-3 py-3 text-left font-medium whitespace-nowrap">
              要素
            </th>
            <th className="px-3 py-3 text-left font-medium">含糊的说法</th>
            <th className="px-3 py-3 text-left font-medium">换成这样</th>
          </tr>
        </thead>
        <tbody>
          {PAIRS.map(([k, bad, good]) => (
            <tr key={k} className="border-t border-hair align-top">
              <td className="px-3 py-3 whitespace-nowrap text-fg">{k}</td>
              <td className="px-3 py-3 text-fg-3">{bad}</td>
              <td className="px-3 py-3 text-fg-2">{good}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h3>最好用的一招：让它先交计划，再动手</h3>
    <p>
      在容易出错的活儿上，多加一句
      <strong>“先告诉我你打算怎么做，我确认了你再动手”</strong>
      。这一步能挡掉大量返工——你花十秒看一眼计划，比它埋头做错二十分钟划算得多。
    </p>

    <Callout>
      它反问你，通常是好事。它一声不吭就开始干，你才该紧张。
      遇到它反问，把答案补上就行，别嫌麻烦——你补的这句话，就是它做对的前提。
    </Callout>

    <h3>还有一个反直觉的点</h3>
    <p>
      不用客气，也不用铺垫。“你好，麻烦你了，我想请问一下……”
      这些字它<strong>不会读得更认真</strong>，只会多占地方。
      直接说事，它反而更准。
    </p>
  </div>
);

const content: UnitContent = {
  animTitle: "同一件事，两种说法",
  anim: (
    <CompareAnim
      title="同一件事，两种说法"
      left={{
        label: "含糊地说",
        lines: ["帮我弄个周报", "（没给材料）", "（没说格式）", "它只能猜"],
      }}
      right={{
        label: "说清楚",
        lines: [
          "把这 5 条记录写成周报",
          "材料一起贴给它",
          "分三段，每段 ≤3 句",
          "不要“持续推进”这类空话",
        ],
      }}
      caption="右栏这四句话，说全了大概多花你 30 秒。它换来的是一份不用返工的结果。这一节要练的就是这个。"
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      下面两次调用是<strong className="font-semibold text-fg">同一件事</strong>
      ，只改了说法。先跑第一次看它怎么猜，再跑第二次看差别有多大。
    </p>
  ),
  demos: [
    {
      id: "vague",
      label: "① 含糊地说",
      ask: "帮我弄个周报。",
      prompt: "帮我弄个周报。",
      maxTokens: 2500,
      expect:
        "它要么反问你一堆问题，要么凭空编一份跟你完全无关的周报。这就是“含糊派活”的真实代价。",
    },
    {
      id: "specific",
      label: "② 说清楚",
      ask: "给出目标、材料、格式、验收标准之后再派活。",
      prompt:
        "请把这周的记录写成一份周报，400 字左右。\n\n本周记录：\n- 周一：跟供应商确认了交期，从 15 天压到 10 天\n- 周三：发现上月的对账单少了一笔 2300 元的退款\n- 周四：退款已到账\n- 周四：新来的同事开始接手部分对账工作\n- 周五：把对账模板的公式修好了，以后不会再算错\n\n要求：分三段——本周进展、遇到的问题、下周计划。每段不超过 3 句话。不要出现“持续推进”“赋能”这类空话。",
      maxTokens: 3000,
      expect:
        "它直接给你一份能用的周报。同样的模型、同样的长度，只是你把要求说全了。",
    },
  ],
};

export default content;
