import type { UnitContent } from "../types";
import { GuiWireframe } from "@/components/anim/GuiWireframe";
import { FlowAnim } from "@/components/anim/diagrams";
import { Callout, Unverified } from "@/components/Note";

const FIRST_RUN: [string, string][] = [
  ["① 新建一个会话", "左边栏顶部那个按钮。一个会话就是一段独立的对话，互不干扰。"],
  [
    "② 说一件小事",
    "别一上来就派大活。先让它做一件你两分钟能验收的事，比如整理一段文字。",
  ],
  ["③ 看它请求授权", "如果它要读或写文件，会先停下来问你。第 6 节专门讲这个。"],
  [
    "④ 看右边变化",
    "它动过的文件会出现在右边。这是判断它有没有真的干活的唯一凭据。",
  ],
];

const theory = (
  <div className="prose-cn">
    <p>
      第一次打开 DSH，界面会比你想象的空。这是正常的——
      它不是那种一打开就有一堆卡片要你点的软件，
      它更像一个<strong>等你派活的窗口</strong>。
    </p>

    <h3>第一次打开，照着这四步做</h3>
    <FlowAnim
      nodes={["新建会话", "说一件小事", "它请求授权", "看右边变化"]}
    />

    <Callout>
      一个很实用的心理准备：
      <strong>把它当成一个能力很强、但不熟悉你情况的实习生</strong>
      。你交代得越具体，它做得越对。含含糊糊地派活，它也会含含糊糊地交差。
    </Callout>

    <h3>关于安装</h3>
    <p>
      正常的安装方式是<b>从官网下载 Windows 安装包，双击安装</b>
      ，和装其它软件没有区别。装完之后，桌面上会有一个 DeepSeek Harness 图标，双击即可。
    </p>

    <Unverified>
      这台机器上 DSH 已经装好了，所以我写不出「从下载到安装」的逐步流程——
      官网{" "}
      <span className="font-mono text-caption">deepseek.com/harness</span>{" "}
      从我这里访问被反爬拦住了（HTTP 429）。
      这一段需要你装一遍、或者给我一张安装界面的截图来核实；
      在那之前我不会把没验证过的步骤写成教程。
    </Unverified>

    <h3>命令行入口（进阶，现在可以跳过）</h3>
    <p>
      除了点图标，DSH 还有一个命令行入口。日常使用完全不需要它，
      但等你熟了之后会有用：可以不开界面直接派任务，也能接到自动化里。
      下面这几条先放在这，混个眼熟。
    </p>
  </div>
);

const content: UnitContent = {
  animTitle: "第一次打开你会看到什么",
  anim: <GuiWireframe />,
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      在真正打开界面之前，先解决一个更根本的问题：
      <strong className="font-semibold text-fg">怎么把话说成它能执行的</strong>
      。下面这次调用会让模型自己演示一遍——你给它一句含糊的话，它告诉你该怎么改。
    </p>
  ),
  demos: [
    {
      id: "rewrite",
      label: "① 把含糊的话改成能执行的话",
      ask: "我说「帮我整理一下文件」，你希望我怎么说？",
      prompt:
        "我对着一个能读写我电脑文件的 AI 助手说「帮我整理一下文件」。请指出这句话哪里不够，并给我 3 个改写后的版本，要求具体到它不需要再反问我。",
      maxTokens: 4000,
      expect:
        "它会指出「整理」和「文件」都太模糊，然后给出带路径、带规则、带验收标准的具体说法。这些话术第 5 节会正式讲。",
    },
  ],
  commands: [
    {
      title: "打开网页界面",
      cmd: "dsh web",
      expect: "终端会打印一个本地地址，用浏览器打开就是上面的三栏界面。",
      note: "命令行入口需要先能用 dsh 命令；日常用桌面图标即可，不必配。",
    },
    {
      title: "看有哪些命令",
      cmd: "dsh --help",
      expect: "列出启动器支持的全部参数，包括 profile 与插件管理。",
    },
    {
      title: "不开界面，直接派一个任务",
      cmd: 'dsh --profile headless "把 D:\\发票 里的 PDF 按月份重命名"',
      expect: "它跑完只打印最终答案，然后退出。适合放进批处理或定时任务。",
      note: "这是第 20 节自动化那一节的基础。",
    },
  ],
};

export default content;
