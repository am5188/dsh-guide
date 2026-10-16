import type { UnitContent } from "../types";
import { SequenceAnim } from "@/components/anim/SequenceAnim";
import { Callout, Unverified } from "@/components/Note";

const THREE: [string, string, string][] = [
  ["这套做法我讲过一遍了，不想再讲", "把一整套步骤固定下来，下次照着走", "工作流"],
  ["这事每天都得做，我老是忘", "到点自动开始，不用人先想起来", "定时任务"],
  ["我这边的情况，它每次都忘", "把规矩提前写下来，每次自动带上", "自定义配置"],
];

const CAN: string[] = [
  "重复的：今天这么做，下个月还是这么做",
  "规则说得清的：什么文件、放哪里、叫什么名字",
  "结果有固定去处的：存到某个文件夹、发到某个地方",
  "你一眼能验收的：打开看一眼就知道对不对",
  "用的是副本的：原件还好好躺在那儿",
];

const CANNOT: string[] = [
  "每次情况都不一样的：得临场看一眼才知道怎么办",
  "要跟别人确认的：中间得有人点头",
  "好坏你自己都说不出标准的：写得“好不好”全凭感觉",
  "要动唯一一份原件的：错了没有第二条路",
  "做错了没人会发现的：安安静静错上一个月",
];

const CONDITIONS: [string, string, string][] = [
  [
    "任务稳定",
    "同一件事手动做十次，步骤基本一样，没有每次都变的花样",
    "它会把偶发的例外当成常态，天天错，而且错得很稳定",
  ],
  [
    "结果可验证",
    "你能用一句话说清“做成什么样算对”",
    "它交回来的东西对不对，你自己也拿不准，只能凭感觉收下",
  ],
  [
    "失败有通知",
    "它没跑成、或者跑出来的东西不对，当天就有人知道",
    "坏了没人知道，等你发现的时候已经错了很多次",
  ],
];

const theory = (
  <div className="prose-cn">
    <p>
      上一节为止，你都是在<strong>派活</strong>
      ：说一句，它做一件。这一节讲的是怎么从“每次都说一遍”，走到“它自己按时做”。
      中间其实只有三样东西，各自治一个病：
    </p>

    <div className="my-9 overflow-x-auto">
      <table className="w-full border-collapse text-meta">
        <thead>
          <tr className="text-fg-3">
            <th className="px-3 py-3 text-left font-medium">你的处境</th>
            <th className="px-3 py-3 text-left font-medium">于是加上了</th>
            <th className="px-3 py-3 text-left font-medium whitespace-nowrap">
              在 DSH 里叫
            </th>
          </tr>
        </thead>
        <tbody>
          {THREE.map(([pain, fix, name]) => (
            <tr key={name} className="border-t border-hair align-top">
              <td className="px-3 py-3 text-fg-2">{pain}</td>
              <td className="px-3 py-3 text-fg-2">{fix}</td>
              <td className="px-3 py-3 whitespace-nowrap text-fg">{name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h3>先说最诱人的那一件：让它每天早上自己干</h3>
    <p>
      普通人听到“自动化”，第一反应都是这句：
      <strong>能不能让它每天早上自动把这件事做了？</strong>
      能。但你得先知道它到底是怎么“自动”的，因为这里有个特别常见的误会。
    </p>
    <p>
      定时任务本身并不会干活。它做的只有一件事：
      <strong>到了那个点，往一个会话里发一条消息</strong>
      ，那条消息大概等于有人在早上八点替你说了一句“该整理昨天的记录了”。
      发完，定时任务这一部分的工作就结束了。
      后面会发生什么，取决于接到这条消息的那个会话里的它——
      和你平时在对话框里派活时，那个它是同一个它，能力一样，毛病也一样。
    </p>

    <Callout>
      记住这个分工，能省掉很多误会：
      <strong>定时任务是闹钟，不是工人。</strong>
      闹钟响得再准，也不能替你起床。所以“它自己按时做”这件事真正的难点，
      从来不是定时间，而是你有没有把该交代的交代清楚。
    </Callout>

    <h3>哪些事能交出去，哪些事交出去就是给自己找麻烦</h3>
    <div className="my-9 grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg bg-surface p-6">
        <div className="flex items-center gap-2 text-body-sm font-semibold">
          <span className="size-1.5 rounded-full bg-ok-500" aria-hidden="true" />
          适合自动化
        </div>
        <ul className="mt-4 space-y-2 text-meta text-fg-2">
          {CAN.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-surface p-6">
        <div className="flex items-center gap-2 text-body-sm font-semibold">
          <span
            className="size-1.5 rounded-full bg-warn-500"
            aria-hidden="true"
          />
          别自动化，先手动
        </div>
        <ul className="mt-4 space-y-2 text-meta text-fg-2">
          {CANNOT.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </div>

    <h3>动手之前，必须满足的三个条件</h3>
    <p>
      这三条不是我的规矩，是从失败里反推出来的：一条不满足，
      自动化只是把你的错误从“一次”变成“每天一次”。
    </p>

    <div className="my-9 overflow-x-auto">
      <table className="w-full border-collapse text-meta">
        <thead>
          <tr className="text-fg-3">
            <th className="px-3 py-3 text-left font-medium whitespace-nowrap">
              条件
            </th>
            <th className="px-3 py-3 text-left font-medium">什么算满足</th>
            <th className="px-3 py-3 text-left font-medium">
              不满足会怎样
            </th>
          </tr>
        </thead>
        <tbody>
          {CONDITIONS.map(([name, yes, no]) => (
            <tr key={name} className="border-t border-hair align-top">
              <td className="px-3 py-3 whitespace-nowrap font-medium text-fg">
                {name}
              </td>
              <td className="px-3 py-3 text-fg-2">{yes}</td>
              <td className="px-3 py-3 text-fg-2">{no}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h3>“先手动跑顺十次再自动化”</h3>
    <p>
      这条经验听起来很土，但它防的是最难防的一种错。手动做的时候，
      你会随手处理各种例外：这份文件名字是乱的、那天没有记录、上个月的数据缺了一天。
      这些例外，你处理完就忘了，因为对你不费力。
    </p>
    <p>
      可一旦交给定时任务，<strong>没人站在旁边随手处理例外了</strong>
      。它遇到那个乱名字的文件会怎么办？不知道。
      所以手动跑十次的作用不是让你熟练，而是
      <strong>把例外抖出来</strong>：第十次还出现的例外，才是你真正需要写进规则里的东西；
      只出现过一次的，多半是那次你自己手滑了。
    </p>
    <p>
      手动跑的时候顺手做一件事：每做一次，记一句
      <strong>“我刚才凭什么这么判断”</strong>
      。这些判断，就是自动化时必须提前写进交代里的部分。
      比如“同一个月的发票放在同一个文件夹里”——你觉得这是常识，
      它不知道你的常识。
    </p>

    <h3>DSH 里这些东西长什么样</h3>
    <p>
      定时任务在 DSH 里叫<strong>自动化任务</strong>
      ：界面里有一个跨会话的“自动化任务”页面，每个会话的右侧栏里也有一个任务页签。
      到点之后，提醒会作为一条消息回到<strong>当初创建它的那个会话</strong>
      里，由那个会话接着干——所以它天然是“绑定会话”的，不是凭空变出一个新助手。
      页面上可以改名字、改指令、改运行时间，也能看这条任务过去几次的运行记录。
    </p>
    <p>
      时间规则是选的，不用你背语法：每周、周一至周五、每天、每 N 小时、每 N 分钟、
      每 N 秒、仅一次，还有一条“自定义”可以填 cron 表达式。时区可以单独指定。
      最短的重复间隔是 60 秒。创建动作本身是在会话里完成的——
      在自动化任务页上点“新建”会打开一个新会话，然后由你在那个会话里让它建任务。
    </p>

    <Unverified>
      上面这段我是从 DSH 自己的实现文档里读来的，没有在你的界面上一一核对过，
      有两处请你复核：一是“自动化任务”这个能力在随发行版交付的默认组合里
      <strong>不一定开着</strong>，它属于实验性能力，可能要在插件管理页的“官方”分组里启用
      （包名形如 <span className="font-mono text-caption">
        @deepseek-ai/dsh-experimental-schedule-bundle
      </span>），或者写进 profile 的配置里；二是桌面版和网页版的界面在这件事上是否完全一致，
      我没有两边都点过。你在界面上找不到“自动化任务”时，先去插件管理看一眼，
      别以为自己的版本坏了。
    </Unverified>

    <p>
      再说<strong>工作流</strong>。它是给“一堆互不相干的小活”用的：
      你的任务拆开之后有十几块，谁都不等谁，这时候可以让它写一小段调度脚本，
      把这些小活同时派给好几个自己，跑完汇总成一份结果。
      一两件小活不需要工作流，普通的子智能体就够了——
      为两件事开一场会，纯属浪费。
    </p>
    <p>
      好消息是：<strong>你不需要自己写这段脚本</strong>。
      你只要在派活的时候说清楚“这些文件互不相关，可以同时处理”，
      剩下的它自己决定。工作流是它的工具，不是你要学的新语言。
    </p>

    <h3>自定义配置：把“我这边的情况”提前交出去</h3>
    <p>
      你可能已经烦了同一件事：每次新开会话，都要重新交代一遍
      “我叫什么、我文件放哪、别用那种腔调写、日期一律写成 2026-03-05 这种格式”。
      这就是自定义配置要解决的。
    </p>
    <p>
      DSH 有几种把话提前说好的地方，从“随手”到“正式”排下来是：
      会话里的记忆（这件事第 12 节讲过）、一份每次都自动带上的规矩文件、
      一个管着模型和联网这些开关的设置页、再往上一层是 profile 和插件。
    </p>
    <p>
      其中普通人最该知道的是那份<strong>规矩文件</strong>：DSH 会在开始干活前，
      读取放在 DSH 数据目录里的一份 <span className="font-mono">AGENTS.md</span>
      （全局的，管你所有的活），再读项目目录里的同名文件，
      越靠近当前工作目录的越具体、越优先。写在里面的内容，每次都会被带上，
      不用你复述。它不会自己长出来——文件不存在就自己新建一个，
      用记事本写就行，几条短句足够：
    </p>

    <div className="my-9 rounded-lg bg-surface p-6">
      <div className="text-body-sm font-semibold">一份规矩文件可以写什么</div>
      <ul className="mt-4 space-y-2 text-meta text-fg-2">
        {[
          "我平时把文件放在哪个盘、哪个文件夹",
          "交东西给我时，默认要什么格式（Word、Excel、还是 Markdown）",
          "日期、金额、人名的写法，统一成什么样",
          "不许做的事：别删原件、别动这个文件夹以外的东西",
          "说话的方式：结论先行，别复述我的要求",
        ].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>

    <Unverified>
      规矩文件这件事，我读到的是：全局那份放在 DSH 的数据目录里
      （这台机器上是 <span className="font-mono text-caption">
        C:\Users\你的用户名\.dsh\AGENTS.md
      </span>），项目级的那份放在项目目录里，文件名还兼容{" "}
      <span className="font-mono text-caption">CLAUDE.md</span>，
      同名目录下的 <span className="font-mono text-caption">*.local.md</span>{" "}
      当作本地覆盖；整份内容有字节上限，太长会从最宽泛的那份开始省略。
      这些我没在自己的界面上逐条验证过，也没有验证桌面版和命令行版的行为完全一样。
      你先写三行试一次，看它是否照做——这比信我要快。
    </Unverified>

    <Callout>
      最后留一句可以贴在墙上的话：
      <strong>自动化放大的不是你的能力，是你原本的做法。</strong>
      做法本身有毛病，自动化只会让它每天准时发作一次。
    </Callout>
  </div>
);

const content: UnitContent = {
  animTitle: "一件事是怎么变成自动化的",
  anim: (
    <SequenceAnim
      title="一件事是怎么变成自动化的"
      caption="顺序别跳过。中间那几步看着啰嗦，正是它们把“偶尔出错”挡在了门外。跳过第 3、4 步直接定时间，等于每天定时给自己制造一次意外。"
      items={[
        { tag: "1", label: "手动做一遍" },
        { tag: "2", label: "记下判断" },
        { tag: "3", label: "跑顺十次" },
        { tag: "4", label: "定验收标准" },
        { tag: "5", label: "定时间" },
        { tag: "6", label: "接上通知" },
      ]}
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      自动化这件事最容易犯的错，是<strong className="font-semibold text-fg">
        把还没想清楚的事先定上时间
      </strong>
      。下面三次调用，是让模型帮你把这件事想清楚：先筛一遍这活该不该自动化，
      再解释那条“十次”的经验到底在防什么，最后设计一个你当天就能知道的失败通知。
    </p>
  ),
  demos: [
    {
      id: "pick",
      label: "① 这活该不该自动化",
      ask: "「每天早上整理前一天的工作记录」，哪些部分适合交给定时任务？",
      prompt:
        "我每天要做这件事：整理前一天的工作记录，写成一段总结。我想改成每天早上 8 点由 AI 自动做。请判断：这件事的哪些部分适合自动化，哪些部分不适合？不适合的部分请说明原因。最后给我一句可以直接交给 AI 助手执行的任务描述。不要提具体价格。",
      maxTokens: 4000,
      expect:
        "它通常会把“收集昨天改过的文件、按固定格式汇总”划到可自动化一边，把“判断哪些事值得写进去”划到另一边。最后那句任务描述，就是你要提前交代的全部内容。",
    },
    {
      id: "ten-times",
      label: "② 十次那条经验在防什么",
      ask: "为什么说“手动做顺十次再自动化”？给我一个反例。",
      prompt:
        "有句经验：先把一件事手动做顺十次，再考虑自动化。请解释这条经验在防的是什么，并给我一个具体的反例——什么情况下手动做顺了十次，自动化之后依然会经常出错？",
      maxTokens: 2500,
      expect:
        "它多半会说到“例外”：手动做的时候你随手处理了各种特殊情况，自己没意识到；这些处理没有写进规则，自动化之后就成了每天的故障点。",
    },
    {
      id: "notify",
      label: "③ 失败了怎么让你知道",
      ask: "如果我每天早上自动跑一个任务，失败或跑错了，怎么让我当天就知道？",
      prompt:
        "我打算让 AI 每天早上自动跑一个任务（把前一天的工作记录整理成总结）。如果它某天失败了、或者跑出了一份看起来不对的结果，我希望当天就知道，而不是等一周后才发现。请给我三种由弱到强的失败通知方案，说明各自需要什么条件，并指出最省事的那一种在什么情况下会失效。",
      maxTokens: 4000,
      expect:
        "第三个问题的答案最有价值：最省事的方案（比如“跑不通就留个记号”）往往在你最需要它的时候恰好失效。哪种方案适合你，取决于这件事出错后你多久才会去看。",
    },
  ],
  commands: [
    {
      title: "不开界面，跑一次性的活",
      cmd: 'dsh --profile headless "把 D:\\记录 里昨天的文件整理成一段总结，存到 D:\\记录\\总结.md"',
      expect:
        "它跑完只打印最终答案，然后退出。这就是所有自动化的最小零件：一条跑完就退出的命令。",
      note: "运行命令时所在的目录会成为它默认的工作目录，所以先切到你想让它动手的那个目录，再运行。",
    },
    {
      title: "把插件装进某个 profile",
      cmd: "dsh plugin --profile web add @deepseek-ai/dsh-experimental-schedule-bundle",
      expect:
        "它会在 web 这个 profile 的目录里执行安装，把这个插件装进去；装完重启 DSH 生效。",
      note: "这条只是把能力装进 profile，开不开、怎么配仍然在插件管理页里切。包名以插件管理页里实际显示的那一条为准。",
    },
  ],
};

export default content;
