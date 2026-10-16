import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { SplitAnim } from "@/components/anim/diagrams";
import { Callout, Unverified } from "@/components/Note";

const FORMATS: [string, string, string][] = [
  ["Word", "报告、说明、合同草稿、会议纪要", "文字排版类。表格和标题能做，复杂版式不要指望一次到位。"],
  ["Excel", "台账、对账单、汇总表、清单", "数据类。公式它也能写，但公式结果对不对要你自己打开验。"],
  ["PPT", "汇报、培训、方案", "页面类。它擅长把内容拆成页，不擅长做出好看的视觉设计。"],
  ["PDF", "把上面几种转成 PDF", "转换类。原文件里的字体和排版可能有细微变化，重要文件要逐页看。"],
];

const CHECKS: [string, string][] = [
  ["打开看得见", "文件能不能正常打开、有没有报损坏。"],
  ["数字对得上", "关键数字跟原始材料核一遍，尤其是合计和日期。"],
  ["公式算得出", "Excel 里的公式要自己点一下单元格，看结果对不对。"],
  ["内容没过界", "它有没有加进原材料里根本没有的信息。"],
];

const theory = (
  <div className="prose-cn">
    <p>
      这一节是很多人最想要的能力：<strong>不是给你一段文字，而是直接生成一个能打开的文件</strong>
      。这是 DSH 相对网页版聊天最直观的差别之一。
    </p>

    <SplitAnim
      left={{
        title: "它能直接给你",
        items: ["Word 报告与说明", "Excel 台账与汇总表", "PPT 汇报页面", "转成 PDF"],
      }}
      right={{
        title: "必须你自己验的",
        items: ["文件能不能打开", "数字对不对得上", "公式算得出吗", "有没有加进原材料没有的内容"],
      }}
      caption="生成文件是它最直观的能力之一，但「交付」不等于「验收」。右栏这四项每次都要自己过一遍。"
    />

    <h3>四种文件，各自擅长什么</h3>
    <div className="my-9 overflow-x-auto">
      <table className="w-full border-collapse text-meta">
        <thead>
          <tr className="text-fg-3">
            <th className="px-3 py-3 text-left font-medium whitespace-nowrap">
              格式
            </th>
            <th className="px-3 py-3 text-left font-medium">典型用途</th>
            <th className="px-3 py-3 text-left font-medium">要注意的</th>
          </tr>
        </thead>
        <tbody>
          {FORMATS.map(([f, use, note]) => (
            <tr key={f} className="border-t border-hair align-top">
              <td className="px-3 py-3 whitespace-nowrap text-fg">{f}</td>
              <td className="px-3 py-3 text-fg-2">{use}</td>
              <td className="px-3 py-3 text-fg-2">{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h3>交到你手上之后，一定要做的四步</h3>
    <dl className="my-9 space-y-4">
      {CHECKS.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 sm:flex-row sm:gap-5">
          <dt className="w-36 shrink-0 text-body-sm font-semibold">{k}</dt>
          <dd className="text-meta leading-relaxed text-fg-2">{v}</dd>
        </div>
      ))}
    </dl>

    <Callout>
      一个预期管理：<strong>它做的是“能用的初稿”，不是“能直接交的成品”</strong>
      。内容框架、数据整理、格式雏形它做得又快又好；
      但版式美观、行业惯例、领导偏好，还是得你自己收尾。
      把省下来的时间用在最后那 20% 上，是最划算的用法。
    </Callout>

    <Unverified>
      生成的文件默认存在哪个目录、能不能指定保存路径，我没有在真实环境里逐步验证过。
      第一次用的时候，让它<strong>告诉你文件被存在了哪里</strong>，再把那个位置记下来。
      如果它说不清，就直接问它“你刚才把文件写到哪个完整路径了”。
    </Unverified>
  </div>
);

const content: UnitContent = {
  animTitle: "从一句话到一个文件",
  anim: (
    <SequenceAnim
      title="从一句话到一个文件"
      caption="和网页版聊天最大的不同在最后两步：它真的把文件写出来了，而且你可以打开验。中间那一步「检查自己写的文件」，是它不把活儿搞砸的关键。"
      items={[
        { tag: "1", label: "你说要什么" },
        { tag: "2", label: "它列结构" },
        { tag: "3", label: "写文件" },
        { tag: "4", label: "自己检查" },
        { tag: "5", label: "给你路径" },
        { tag: "6", label: "你打开验收" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      文件是它写出来的，你没法在这里看到成品，但<strong className="font-semibold text-fg">可以让它先把设计交给你</strong>
      ——下面这次调用就是让模型先给出一个表格的字段设计。方案对了，再让它去写文件。
    </p>
  ),
  demos: [
    {
      id: "sheet-design",
      label: "① 先要方案，再让它写文件",
      ask: "我要做一个日常记账表，帮我设计字段。",
      prompt:
        "我要用 Excel 做一个家庭日常记账表，用来记录三个人的开销。请先给我字段设计（列名、类型、填写规则），并说明为什么这么设计。先不要写文件，我要先看方案。\n\n要求：能直接算出每人每月合计和分类合计，字段不要超过 10 个，普通人看得懂。",
      maxTokens: 4000,
      expect:
        "它会给出列名、每列填什么、怎么分类，以及能算出合计的设计理由。看顺眼了，你再回 DSH 里让它照这个方案生成文件。",
    },
  ],
  commands: [
    {
      title: "在 DSH 里派这类活儿",
      cmd: 'dsh --profile headless "把 D:\\对账 里的三个表格合成一张汇总表，存成 Excel，列名不一致的按内容对齐"',
      expect: "跑完它会打印结果和文件路径。这正是不打开界面也能用的场景。",
      note: "真实使用建议在界面里做，能看到它每一步在干什么、随时打断。",
    },
  ],
};

export default content;
