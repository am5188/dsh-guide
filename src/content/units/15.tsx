import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { FlowAnim } from "@/components/anim/diagrams";
import { Callout, Unverified } from "@/components/Note";

const theory = (
  <div className="prose-cn">
    <p>
      有了工具之后，新的问题很快就来了：工具越来越多。
      读文件的、写文件的、跑命令的、搜网页的、生成 Word 的、生成 Excel 的……
      几十个工具摆在面前，怎么用？
    </p>

    <FlowAnim
      nodes={["一个工具", "几十个工具", "技能：把做法打包", "插件：给系统换零件"]}
    />

    <h2>工具多了，会带来三个新麻烦</h2>
    <div className="my-7 grid gap-4 sm:grid-cols-3">
      {[
        ["选错工具", "工具一多、名字又像，模型会挑错。挑错一次就白跑一圈。"],
        [
          "说不清用法",
          "每个工具都要说明“什么时候用、参数怎么填”。说明写得差，它就用得差。",
        ],
        ["装进来不安全", "每装一个新工具，就多一处它可能动到你东西的地方。"],
      ].map(([k, v]) => (
        <div key={k} className="rounded-lg bg-surface p-5">
          <div className="text-body-sm font-semibold">{k}</div>
          <p className="mt-2 text-meta text-fg-2">{v}</p>
        </div>
      ))}
    </div>

    <h2>三个词，一层管一层</h2>
    <div className="my-7 space-y-3">
      {[
        {
          name: "工具",
          what: "一个具体的动作",
          eg: "读一个文件、跑一条命令、搜一次网页",
          risk: "低",
          tone: "var(--color-ok-500)",
        },
        {
          name: "技能",
          what: "把一套做法打包",
          eg: "「生成 Excel 报表」：先确认表头 → 再核对合计数 → 生成后自己打开检查一遍",
          risk: "低",
          tone: "var(--color-ok-500)",
        },
        {
          name: "插件",
          what: "给整个系统换零件",
          eg: "接一个新的模型来源、加一个全新的面板、改变它的工作方式",
          risk: "高",
          tone: "var(--color-warn-500)",
        },
      ].map((r) => (
        <div key={r.name} className="rounded-lg bg-surface p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className="size-2 rounded-full"
              style={{ background: r.tone }}
              aria-hidden="true"
            />
            <span className="text-title font-bold">{r.name}</span>
            <span className="text-meta text-fg-2">{r.what}</span>
            <span className="ml-auto rounded-xs bg-canvas px-2 py-0.5 text-caption text-fg-3">
              风险 {r.risk}
            </span>
          </div>
          <p className="mt-2.5 text-meta text-fg-2">{r.eg}</p>
        </div>
      ))}
    </div>

    <Callout>
      从使用者的角度，记住一句就够：
      <strong>技能是“教它怎么干这件事”，插件是“给它换零件”</strong>。
      前者风险低，后者风险高。技能把老手的经验固化了下来，所以它比单个工具更好用。
    </Callout>

    <Unverified>
      插件生态的真实情况比宣传的数字复杂得多。我们读过的一份第三方调研给出了几个
      值得你警惕的数字（<strong>来自第三方采集，我没有逐条复核</strong>）：
      同一周内不同来源统计的“插件总数”差异极大；
      被实测判定为可用的比例并不高；而且<strong>大版本升级会大面积打破旧插件</strong>。
      结论：<strong>插件要少装、慎装，能用内置的就不装外部的。</strong>
      装之前先看它的更新时间和说明，装之后先在小事上试。
    </Unverified>
  </div>
);

const content: UnitContent = {
  animTitle: "工具是怎么多起来的",
  anim: (
    <SequenceAnim
      title="工具是怎么多起来的"
      caption="工具越多越乱，技能和插件就是来解决这个的。"
      items={[
        { tag: "第1件", label: "读文件" },
        { tag: "第2件", label: "写文件" },
        { tag: "第3件", label: "跑命令" },
        { tag: "第4件", label: "搜网页" },
        { tag: "第5件", label: "生成 Word" },
        { tag: "越来越多", label: "开始混乱" },
        { tag: "应对", label: "技能打包" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      让它自己说清「该用哪个工具」。
    </p>
  ),
  demos: [
    {
      id: "when-skill",
      label: "① 什么样的活儿值得打包成技能",
      ask: "我每天都要重复做的一些事，哪些该做成技能？",
      prompt:
        "我用一个能读写我电脑文件的 AI 助手干活。我想知道：什么样的重复性工作值得被固化成一套标准流程（技能），什么样的不值得？\n\n请给出明确的判断标准（3 到 5 条），每条配一个正例和一个反例。反例要说明为什么它不该被固化。",
      maxTokens: 4000,
      expect:
        "它会给出类似“步骤稳定、判断标准明确、出错代价可控”的标准。合理使用这个判断，能帮你决定该不该为某件事花时间做自动化。",
    },
  ],
  commands: [
    {
      title: "查看和管理插件",
      cmd: "dsh plugin --profile web ls",
      expect: "列出当前 profile 已安装的插件。换成 add / remove 等参数可以安装或卸载。",
      note: "装之前先想清楚：这个插件来自哪里、它能碰到你的什么。不确定就先别装。",
    },
  ],
};

export default content;
