import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { GaugeAnim } from "@/components/anim/diagrams";
import { Callout, Unverified } from "@/components/Note";

/* ── 花费刻度：等级 1–5，用条形一眼看懂谁贵 ───────────────── */
const SPEND: { what: string; tag: string; level: number; why: string }[] = [
  {
    what: "问一句短问题",
    tag: "很小",
    level: 1,
    why: "发过去的字少，它写出来的字也少，两头都省。",
  },
  {
    what: "同一段没变过的内容再发一次",
    tag: "通常便宜些",
    level: 1,
    why: "没变过的前缀有可能被缓存下来。DSH 的用量统计把输入分成“命中缓存”和“没命中”两类，你可以直接看那个数。",
  },
  {
    what: "让它先想清楚再回答（推理模型）",
    tag: "比直觉回答贵",
    level: 2,
    why: "它先在“心里”打的草稿也按输出计费，只是这段字不一定显示给你看。",
  },
  {
    what: "新开一个会话重新问同一件事",
    tag: "不一定省",
    level: 2,
    why: "新会话不是省钱开关：省下的是前面的上下文，花掉的是你重新交代情况的字数。",
  },
  {
    what: "让它通读一份五十页的 PDF 再给结论",
    tag: "大",
    level: 4,
    why: "整份内容都会变成输入，而且之后每一轮还要重新发一遍。",
  },
  {
    what: "让它跑一个二十步的活",
    tag: "大",
    level: 4,
    why: "每一步都是一次完整请求，每次都带上前面所有内容和工具说明。",
  },
  {
    what: "同一个会话里来回聊五十轮",
    tag: "越聊越贵",
    level: 4,
    why: "第 50 轮发出去的量，是第 1 轮的好多倍。",
  },
  {
    what: "开三个子智能体，各读一遍同一份资料",
    tag: "大上加大",
    level: 5,
    why: "同一批字被算了三遍。除非它们本来就该各看各的资料。",
  },
];

/* ── 风险与对应的防线 ─────────────────────────────────────── */
const RISKS: { risk: string; level: number; detail: string; guard: string }[] = [
  {
    risk: "删了东西",
    level: 3,
    detail: "删除是最难收回的一步。DSH 没有内置回收站——删掉的文件不进系统回收站的情况也存在。",
    guard: "动手前先复制一份，让它只动副本",
  },
  {
    risk: "改了不该改的文件",
    level: 2,
    detail: "它动手的范围可能比你想象的大。你说“整理一下”，它可能顺手把旁边几个文件也改了名。",
    guard: "先要一份改动清单，你核对完再放行",
  },
  {
    risk: "把它的结论当成事实",
    level: 2,
    detail: "它不知道的事会顺着话头编，语气还很自信。这就是第 1 节讲的幻觉。",
    guard: "要求它分开“材料里有的”和“它推断的”",
  },
  {
    risk: "把不该发的东西发出去了",
    level: 3,
    detail: "它能读到的东西，也可能被它写进请求里。密钥、身份信息、客户资料都算。",
    guard: "别把密钥放进工作区——沙箱只管写入，不管读取，挡不住它读",
  },
];

/* ── 回滚清单：用编号呈现，比段落好读 ─────────────────────── */
const ROLLBACK: { title: string; detail: string }[] = [
  {
    title: "先复制一份",
    detail: "最土，也最稳。复制粘贴出一个副本，让它去动副本。原件不动，出错就没有代价。",
  },
  {
    title: "先在小范围试",
    detail: "别拿三年的发票上手。挑一个文件夹、一个月的量，做一遍验收完再放大。",
  },
  {
    title: "先把权限收紧",
    detail: "沙箱档位先放在偏紧的那一档（第 6 节讲过三档）。第一次干不熟的活，别给全开。",
  },
  {
    title: "先让它只报告、不动手",
    detail: "只要一份清单：“你打算改哪些文件、改成什么”。看完整份清单再放它动手。",
  },
  {
    title: "备份留到你确认能用为止",
    detail: "很多人毁在“我觉得差不多了”就把副本删了。等你真的用过新结果，再删。",
  },
];

/** 花费刻度条 */
function Meter({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-3.5 w-1.5 rounded-[2px]"
          style={{
            background:
              i <= level
                ? level >= 4
                  ? "var(--color-warn-500)"
                  : "var(--color-ds-500)"
                : "var(--line)",
          }}
        />
      ))}
    </span>
  );
}

function Theory() {
  return (
    <div className="prose-cn">
      <p>
        这一节只回答两件事：<strong>钱花在哪</strong>，以及<strong>怎么保证不把东西搞坏</strong>。
        两件事都有能直接照做的做法，所以下面尽量用图表说话。
      </p>

      <h2>钱花在哪几个桶里</h2>
      <p>
        DSH 的用量统计把它分成<strong>输入侧和输出侧</strong>，
        输入侧再按“有没有命中缓存”细分。注意<strong>没有一个单独的「思考」桶</strong>——
        推理模型打的草稿是并进输出里算的。
      </p>
      <div className="my-7 grid gap-4 sm:grid-cols-2">
        {[
          [
            "输入 · 没命中缓存",
            "这一轮新发过去、之前没算过的内容。最贵的那一类。",
          ],
          [
            "输入 · 命中缓存",
            "没变过的前缀有可能被复用，单价更低。长会话里省的就是这部分。",
          ],
          [
            "输入 · 写缓存",
            "把前缀存进缓存本身也有成本。",
          ],
          [
            "输出",
            "它写给你的字，外加推理模型先打的草稿——草稿不一定显示给你看，但算在这里。",
          ],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-surface p-5">
            <div className="text-body-sm font-semibold">{k}</div>
            <div className="mt-1.5 text-meta text-fg-2">{v}</div>
          </div>
        ))}
      </div>
      <Callout>
        最容易忽略的是输入侧：<strong>每多聊一轮，前面所有内容都要重发一次</strong>。
        所以「长会话」和「长任务」贵起来的真正原因，不是它一次算了多少，
        而是同一批字被算了多少遍。
      </Callout>

      <GaugeAnim
        value={0.9}
        label="第 10 轮请求里，重复内容占多少"
        hint="前九轮 9 份 + 本轮 1 份 = 10 份"
        threshold={0.5}
        thresholdLabel="直觉上以为重复只占一半"
      />

      <h2>哪些操作贵，一眼看刻度</h2>
      <div className="my-7 space-y-2">
        {SPEND.map((s) => (
          <div key={s.what} className="rounded-md bg-surface px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Meter level={s.level} />
              <span className="text-body-sm font-medium">{s.what}</span>
              <span className="rounded-xs bg-canvas px-1.5 py-0.5 text-caption text-fg-3">
                {s.tag}
              </span>
            </div>
            <p className="mt-2 text-meta text-fg-2">{s.why}</p>
          </div>
        ))}
      </div>

      <h2>四种风险，和各自的防线</h2>
      <div className="my-7 space-y-3">
        {RISKS.map((r) => (
          <div key={r.risk} className="rounded-lg bg-surface p-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="size-2 rounded-full"
                style={{
                  background:
                    r.level >= 3
                      ? "var(--color-danger-500)"
                      : "var(--color-warn-500)",
                }}
                aria-hidden="true"
              />
              <span className="text-body-sm font-semibold">{r.risk}</span>
              <span className="rounded-xs bg-canvas px-1.5 py-0.5 text-caption text-fg-3">
                {r.level >= 3 ? "后果不好收" : "容易发生"}
              </span>
            </div>
            <p className="mt-2 text-meta text-fg-2">{r.detail}</p>
            <p className="mt-3 text-meta">
              <span className="text-fg-3">防线 · </span>
              <span className="text-accent">{r.guard}</span>
            </p>
          </div>
        ))}
      </div>

      <h2>回滚清单</h2>
      <ol className="my-7 space-y-4">
        {ROLLBACK.map((r, i) => (
          <li key={r.title} className="flex gap-4">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm bg-surface font-mono text-caption text-accent">
              {i + 1}
            </span>
            <span>
              <span className="text-body-sm font-semibold">{r.title}</span>
              <span className="mt-1 block text-meta text-fg-2">{r.detail}</span>
            </span>
          </li>
        ))}
      </ol>

      <Callout>
        这五条里真正救命的只有第一条。其余四条都是它的补充。
        <strong>如果你只记一件事，就记“先复制一份”。</strong>
      </Callout>

      <h2>用量去哪个界面看</h2>
      <div className="my-7 space-y-2">
        {[
          [
            "用量明细",
            "设置 → 通用设置 → 性能与用量。默认是详细模式，可以切成简洁模式；简洁模式会显示缓存命中率。",
          ],
          [
            "余额与额度",
            "桌面版的设置 → 账号页。普通的网页客户端不显示账号设置。",
          ],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex flex-col gap-1 rounded-md bg-surface px-5 py-3.5 sm:flex-row sm:gap-6"
          >
            <span className="w-28 shrink-0 text-meta font-semibold">{k}</span>
            <span className="text-meta text-fg-2">{v}</span>
          </div>
        ))}
      </div>

      <Unverified>
        这一节<strong>故意不给任何价格数字</strong>。DeepSeek 的计费标准会变，
        我没有核实过当前价目，也不想让你拿一个过期数字去估预算。
        请以官网计费页和你自己的账单为准。
        上面那两处界面位置读自实现文档，我没在你的界面上逐个点过。
      </Unverified>
    </div>
  );
}

const content: UnitContent = {
  animTitle: "一笔钱是怎么花掉的",
  anim: (
    <SequenceAnim
      title="一笔钱是怎么花掉的"
      caption="聊得越久，前面那几步被重复的次数就越多。"
      items={[
        { tag: "1", label: "把资料发过去" },
        { tag: "2", label: "它先想一遍" },
        { tag: "3", label: "它写出来" },
        { tag: "4", label: "下一轮全部重发" },
        { tag: "5", label: "账单是这几步相加" },
      ]}
    />
  ),
  theory: <Theory />,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      让它把「钱花在哪」讲成生活里的话。
    </p>
  ),
  demos: [
    {
      id: "cost-anatomy",
      label: "① 钱花在哪几个地方",
      ask: "用生活话讲讲：一次 AI 对话里，钱的三个主要去处是什么？",
      prompt:
        "我在用 AI 助手干活，按 token 计费。请用生活化的方式解释：一次对话里，钱的三个主要去处分别是什么；为什么“来回聊很多轮”比“一次问清楚”更贵；以及缓存命中会不会影响价钱——如果不确定就直接说不确定。不要给出任何具体价格数字。",
      maxTokens: 16000,
      expect:
        "你会得到一份把人话讲明白的账：进去的、出来的、还有它自己想的。这次回答本身也计入用量，等它跑完看一眼上面那排 token 数。",
    },
    {
      id: "expensive-habits",
      label: "② 哪些习惯在偷偷加钱",
      ask: "列出 6 个会让我的用量明显变大的习惯，每个都给个改法。",
      prompt:
        "我正在用 AI 助手处理电脑里的文件。请列出 6 个会让我的用量明显变大的习惯，每个都给出一个具体的改法。要求：不要提具体价格，只讲用量多少，改法要具体到我能照着做。",
      maxTokens: 16000,
      expect:
        "常见的几条：把整个文件夹的内容一次性塞进去、在同一个会话里连着聊一整天、反复让它读同一份大文件、不先说清楚就让它试。",
    },
    {
      id: "rollback-plan",
      label: "③ 一份能照做的回滚清单",
      ask: "我要让它批量整理三年的发票，动手前后我该做什么准备？",
      prompt:
        "我准备让一个能读写我电脑文件的 AI 助手，批量整理 D:\\发票 里三年的 PDF：重命名、按年份分文件夹、删掉重复的。请给我一份“动手前 / 动手时 / 动手后”三段的准备清单，目标是我在任何一步都能退回原样。要具体到我能照着做，不要讲道理。",
      maxTokens: 16000,
      expect:
        "重点看它有没有提“先复制一份”和“先小范围试一年”。凡是不提备份就让你直接开干的方案，都可以直接扔了。",
    },
  ],
  commands: [
    {
      title: "先让它只报告、不动手",
      cmd: 'dsh --profile headless "列出 D:\\发票 里所有 PDF，按年份归类打印出来，不要修改、重命名或删除任何文件"',
      expect:
        "它只打印一份清单就退出，你的文件一个字都没变。拿这份清单核对完，再下达真正动手的命令。",
      note: "同一条命令加上“不要修改任何文件”这句约束，就是最便宜的一份保险。先用它，再放开手。",
    },
  ],
};

export default content;
