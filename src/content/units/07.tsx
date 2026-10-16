import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { FlowAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const SCENES: [string, string, string][] = [
  [
    "改文字",
    "把下面这段改得更正式一点，意思不要变。",
    "最稳的一类活儿。它不会动你的文件，纯输出，放心用。",
  ],
  [
    "整理",
    "把这 8 条零散记录合并成一页说明，同类项合并，冲突的地方单独列出来。",
    "“合并 + 冲突单列”这个要求很关键，能避免它悄悄替你拍板。",
  ],
  [
    "改名",
    "把 D:\\发票 里的 PDF 按「年月-金额」重命名，先列出你打算怎么改，我确认后再动。",
    "凡是批量改名字，务必先让它交方案。一次改错一百个文件很难救。",
  ],
  [
    "汇总",
    "把这 3 个表格合成一张，列名不一致的按内容对齐，对不上的单独标出来。",
    "一定要加“对不上的单独标出来”，否则它会硬凑，错得还很隐蔽。",
  ],
  [
    "查资料",
    "去网上查一下这件事的现行规定，给出结论和 3 个来源链接，注明各自的发布日期。",
    "查资料必须要求来源。没有来源的结论，只能当线索，不能当依据。",
  ],
];

const theory = (
  <div className="prose-cn">
    <p>
      下面这五类活儿，占了普通人用 DSH 的绝大多数场景。每一类我都给了一句
      <strong>可以直接照着改的说法</strong>，以及这句说法里那个不能省的关键要求。
    </p>

    <FlowAnim
      nodes={["改文字", "整理", "汇总", "查资料", "改名 / 改文件"]}
    />

    <div className="my-9 space-y-5">
      {SCENES.map(([scene, how, why]) => (
        <div key={scene} className="rounded-lg bg-surface p-6">
          <div className="text-body-sm font-semibold">{scene}</div>
          <p className="mt-3 border-l-2 border-accent pl-4 text-body-sm text-fg">
            {how}
          </p>
          <p className="mt-3 text-meta text-fg-2">{why}</p>
        </div>
      ))}
    </div>

    <h3>一条通用的分界线</h3>
    <p>
      你可以把活儿分成两类：<strong>“动嘴的”和“动手的”</strong>。
    </p>
    <p>
      动嘴的（改文字、总结、解释、起名字）——大胆用，错了顶多重来一次。
      动手的（改文件、删东西、发东西）——每次都先要方案，看清楚了再放行。
    </p>

    <Callout>
      还有一个习惯很值钱：<strong>让它把结果分成“材料里有的”和“它推断的”两部分</strong>
      。前者你能核对，后者你知道要自己判断。这一句要求，能让它的输出立刻可信很多。
    </Callout>
  </div>
);

const content: UnitContent = {
  animTitle: "五类最常见的活儿",
  anim: (
    <SequenceAnim
      title="五类最常见的活儿"
      caption="认得出手上的活儿属于哪一类，就知道该补哪句关键要求。"
      items={[
        { tag: "1", label: "改文字" },
        { tag: "2", label: "整理" },
        { tag: "3", label: "改名" },
        { tag: "4", label: "汇总" },
        { tag: "5", label: "查资料" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      两类活儿的真实样例：一次纯动嘴，一次要求分清事实与推断。
    </p>
  ),
  demos: [
    {
      id: "rewrite",
      label: "① 纯动嘴：改文字",
      ask: "把一段口语记录改成正式的会议纪要。",
      prompt:
        "把下面这段口语记录改写成正式的会议纪要，意思不要变，不要添加任何原话里没有的信息。\n\n「那个供应商的事儿，老王说交期能压到十天，但是得加钱，加多少还没定。然后对账单那块，上个月少了一笔退款两千三，小李去查了，说是系统问题，已经补了。」",
      maxTokens: 3000,
      expect:
        "一段干净、正式、没有添油加醋的纪要。注意它是怎么做到“不添加原话里没有的信息”的——这个约束很值得保留。",
    },
    {
      id: "separate",
      label: "② 让它分开“材料”和“推断”",
      ask: "整理客户反馈，并区分哪些是原话、哪些是它的推断。",
      prompt:
        "下面是 4 条客户反馈，请整理成一张表：问题、涉及功能、严重程度。\n\n严格要求：把「客户原话里明确说到的」和「你自己推断出来的」分成两列，不要混在一起。推断的那一列如果是猜的，就写“推测”两个字。\n\n1. 导出 Excel 老是卡住，一万行左右就转圈\n2. 希望能批量改价格，一个个改太慢了\n3. 昨天登录不上，试了十几次，同事也登不上\n4. 界面挺好用的，就是手机上字太小",
      maxTokens: 4000,
      expect:
        "重点看它有没有老实分开两列。这个测试能让你直观感受到：当你明确要求区分事实与推断时，输出的可信度会明显不同。",
    },
  ],
};

export default content;
