export type AbilityId =
  | "memory"
  | "knowledge"
  | "tools"
  | "endurance"
  | "teamwork"
  | "safety";

export type Ability = {
  id: AbilityId;
  label: string;
  blurb: string;
};

/** 能力仪表盘：这套系统让模型一块块长出来的本事。 */
export const abilities: Ability[] = [
  { id: "memory", label: "记忆", blurb: "把之前说过的话带回来" },
  { id: "knowledge", label: "知识", blurb: "接上它本来不知道的资料" },
  { id: "tools", label: "工具", blurb: "真的动手，而不只是动嘴" },
  { id: "endurance", label: "长任务", blurb: "一口气做完，中途不跑偏" },
  { id: "teamwork", label: "协作", blurb: "多个角色分工配合" },
  { id: "safety", label: "安全", blurb: "该拦的拦住，该问的问一句" },
];

export type Unit = {
  /** 全书连续编号 1..22 */
  no: number;
  part: number;
  title: string;
  /** 一句话钩子：先说人话，再讲机制 */
  hook: string;
  /** 学完这一节点亮哪项能力（第 19 节一次性点亮全部） */
  unlocks?: AbilityId[];
  /** 时间轴上的时代标签 */
  era?: string;
};

export type Part = {
  no: number;
  title: string;
  lead: string;
  /** 这一段主要用什么形式讲 */
  form: string;
};

export const parts: Part[] = [
  {
    no: 1,
    title: "为什么需要它",
    lead: "先搞清楚模型能做什么、不能做什么，再理解为什么要有一层东西替它动手。",
    form: "短片 + 界面导览",
  },
  {
    no: 2,
    title: "用起来",
    lead: "从第一句话开始，到让它交出 Word、Excel、PPT。这一部读完你就能干活。",
    form: "交互演示 + 真实命令",
  },
  {
    no: 3,
    title: "能力是怎么长出来的",
    lead: "沿着 2022 到 2026 的时间线，每一节解决一个真实痛点，并且当场跑给你看。",
    form: "动画 + 图文 + 现场试跑",
  },
  {
    no: 4,
    title: "进阶与边界",
    lead: "自动化、花多少钱、闯祸了怎么收场，以及一张能查的速查表。",
    form: "图文 + 清单",
  },
];

export const units: Unit[] = [
  // ── 第一部 ──────────────────────────────────────────────
  {
    no: 1,
    part: 1,
    title: "一个模型能做什么、不能做什么",
    hook: "它会写、会答、会编，但它碰不到你的电脑。",
    era: "起点",
  },
  {
    no: 2,
    part: 1,
    title: "能力是怎么一块块长出来的",
    hook: "从 2022 年底到今天，每一步都是被一个具体痛点逼出来的。",
    era: "2022 → 2026",
  },
  {
    no: 3,
    part: 1,
    title: "Harness：给它装上手和脚",
    hook: "模型负责想，Harness 负责真的去做。",
  },
  {
    no: 4,
    part: 1,
    title: "装上 DSH，第一次打开看到什么",
    hook: "左边是会话，中间是对话，右边是文件和终端。",
  },

  // ── 第二部 ──────────────────────────────────────────────
  {
    no: 5,
    part: 2,
    title: "第一次对话：怎么把需求说清楚",
    hook: "同一件事，换个说法，结果差十倍。",
  },
  {
    no: 6,
    part: 2,
    title: "它要动你的文件：什么时候该点同意",
    hook: "不是弹窗找麻烦，是它准备真的下手了。",
  },
  {
    no: 7,
    part: 2,
    title: "日常场景：写作、整理、汇总、查资料",
    hook: "把嘴边那句“帮我弄一下”翻译成它能执行的话。",
  },
  {
    no: 8,
    part: 2,
    title: "让它交作业：Word / Excel / PPT",
    hook: "不是给你一段文本，是直接生成能打开的文件。",
  },
  {
    no: 9,
    part: 2,
    title: "出错了怎么办",
    hook: "看懂那行红字，比重新问一遍有用得多。",
  },

  // ── 第三部：能力演进线 ──────────────────────────────────
  {
    no: 10,
    part: 3,
    title: "单次调用：它天生没有记忆",
    hook: "你问两遍，它当两件事。",
    era: "2022",
  },
  {
    no: 11,
    part: 3,
    title: "多轮对话：把说过的话带回来",
    hook: "记忆不是模型的能力，是外面替它记的。",
    unlocks: ["memory"],
    era: "2023",
  },
  {
    no: 12,
    part: 3,
    title: "装不下了：总结与压缩",
    hook: "历史越堆越长，你只有一次机会决定留什么。",
    unlocks: ["memory"],
    era: "2023",
  },
  {
    no: 13,
    part: 3,
    title: "它不知道你的资料：RAG",
    hook: "与其让它记住一切，不如需要时把资料递给它。",
    unlocks: ["knowledge"],
    era: "2023",
  },
  {
    no: 14,
    part: 3,
    title: "它动不了手：function calling",
    hook: "模型不会读文件，但它可以决定“该去读哪个文件”。",
    unlocks: ["tools"],
    era: "2023",
  },
  {
    no: 15,
    part: 3,
    title: "工具太多：技能与插件",
    hook: "装得越多，越需要有人管得住。",
    unlocks: ["tools"],
    era: "2024",
  },
  {
    no: 16,
    part: 3,
    title: "任务太长：目标与检查点",
    hook: "跑一半崩了，不该从头再来。",
    unlocks: ["endurance"],
    era: "2025",
  },
  {
    no: 17,
    part: 3,
    title: "一个不够用：子智能体与多智能体",
    hook: "一个人从头做到尾，不如分工再汇总。",
    unlocks: ["teamwork"],
    era: "2025",
  },
  {
    no: 18,
    part: 3,
    title: "手脚放开的代价：权限门与沙箱",
    hook: "能力越强，越要知道边界在哪。",
    unlocks: ["safety"],
    era: "2025",
  },
  {
    no: 19,
    part: 3,
    title: "于是有了 DSH：把它们拼成一个运行时",
    hook: "所有零件都在了，差一个把它们装起来的东西。",
    unlocks: ["memory", "knowledge", "tools", "endurance", "teamwork", "safety"],
    era: "2026",
  },

  // ── 第四部 ──────────────────────────────────────────────
  {
    no: 20,
    part: 4,
    title: "工作流、定时任务与自定义配置",
    hook: "从“每次都说一遍”到“它自己按时做”。",
  },
  {
    no: 21,
    part: 4,
    title: "成本、风险与回滚",
    hook: "花了多少、错在哪、怎么退回去。",
  },
  {
    no: 22,
    part: 4,
    title: "术语表与速查表",
    hook: "看不懂的词，和“我想做 X 该怎么说”。",
  },
];

export const unitsByPart = (partNo: number): Unit[] =>
  units.filter((u) => u.part === partNo);
