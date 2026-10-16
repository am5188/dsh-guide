import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { HeroVisual } from "@/components/HeroVisual";
import {
  IconArrowRight,
  IconDiagram,
  IconFilm,
  IconTerminal,
} from "@/components/icons";
import { abilities, parts, units, unitsByPart } from "@/lib/curriculum";

const SHELL = "mx-auto max-w-[920px] px-5 sm:px-8";

/* ── 首屏 ─────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_296px] lg:gap-14">
        <div>
          <p className="text-meta text-fg-3">写给完全没用过命令行的人</p>

          <h1 className="mt-4 max-w-[520px] text-display font-medium tracking-tight text-balance">
            不会写代码，
            <br />
            也能让 AI 真的把活干完
          </h1>

          <p className="mt-6 max-w-[500px] text-lead text-fg-2">
            模型只会“想”——它写得出一份方案，却打不开你电脑里的那个文件夹。
            真正让它动手的，是它外面那层系统。
            <span className="text-fg"> DeepSeek Harness </span>
            就是这层系统。这份指南不教你写程序，只教你用它把事办成。
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/u/1/"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-5 text-body-sm font-medium text-on-brand transition-opacity duration-200 hover:opacity-90"
            >
              从第 1 节开始
              <IconArrowRight size={15} />
            </Link>
            <Link
              href="#roadmap"
              className="inline-flex h-10 items-center rounded-md px-4 text-body-sm text-fg-2 transition-colors duration-200 hover:bg-hover hover:text-fg"
            >
              先看 22 节目录
            </Link>
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

/* ── 每一节的结构 ─────────────────────────────────────────── */
const MODES = [
  {
    Icon: IconFilm,
    title: "先看一眼",
    body: "一段几十秒的动画，先说清“痛在哪”。不记名词，先建立直觉。",
  },
  {
    Icon: IconDiagram,
    title: "到底怎么回事",
    body: "图解加对照表，把刚才看到的现象，换成你能复述给别人的说法。",
  },
  {
    Icon: IconTerminal,
    title: "你自己跑一遍",
    body: "填你自己的 API Key，浏览器直接调用。出来的是真结果，不是截图。",
  },
];

function Modes() {
  return (
    <section className="pb-20">
      <h2 className="text-title font-semibold tracking-tight">
        每一节都是同一个结构
      </h2>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {MODES.map((m) => (
          <div key={m.title} className="rounded-lg bg-surface p-6">
            <span className="flex size-9 items-center justify-center rounded-sm bg-canvas text-accent">
              <m.Icon size={17} />
            </span>
            <h3 className="mt-4 text-body-sm font-semibold">{m.title}</h3>
            <p className="mt-2 text-meta text-fg-2">{m.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 能力进度 ─────────────────────────────────────────────── */
function AbilityStrip() {
  return (
    <section className="pb-20">
      <div className="rounded-lg bg-surface p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-title font-semibold tracking-tight">
            读完第三部，这些能力会一块块点亮
          </h2>
          <span className="text-caption text-fg-3">0 / 6</span>
        </div>
        <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {abilities.map((a) => (
            <li key={a.id} className="flex gap-3">
              <span
                className="mt-[7px] size-2 shrink-0 rounded-full bg-line-3"
                aria-hidden="true"
              />
              <span>
                <span className="text-body-sm font-medium">{a.label}</span>
                <span className="mt-0.5 block text-meta text-fg-2">
                  {a.blurb}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 22 节路线图 ──────────────────────────────────────────── */
function UnitRow({ unit }: { unit: (typeof units)[number] }) {
  return (
    <li>
      <Link
        href={`/u/${unit.no}/`}
        className="group flex gap-5 border-t border-hair py-5 transition-colors hover:bg-hover sm:gap-7 sm:px-3"
      >
        <span className="w-6 shrink-0 pt-0.5 font-mono text-meta text-fg-3">
          {String(unit.no).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <span className="text-body-sm font-semibold text-fg group-hover:text-accent">
              {unit.title}
            </span>
            {unit.era && (
              <span className="rounded-xs bg-sunken px-1.5 py-0.5 font-mono text-micro text-fg-3">
                {unit.era}
              </span>
            )}
            {unit.no === 1 && (
              <span className="rounded-xs bg-accent-soft px-1.5 py-0.5 text-micro text-accent">
                已可阅读
              </span>
            )}
            {unit.unlocks?.map((u) => (
              <span
                key={u}
                className="rounded-xs bg-sunken px-1.5 py-0.5 text-micro text-fg-3"
              >
                点亮 {abilities.find((a) => a.id === u)?.label}
              </span>
            ))}
          </span>
          <span className="mt-1.5 block text-meta text-fg-2">{unit.hook}</span>
        </span>
      </Link>
    </li>
  );
}

function Roadmap() {
  return (
    <section id="roadmap" className="scroll-mt-20 pb-24">
      <h2 className="text-title font-semibold tracking-tight">22 节，四部</h2>
      <p className="mt-2 max-w-[44ch] text-meta text-fg-2">
        前三部按顺序读，第四部当工具书查。内容按顺序推进，目前第 1 节已可阅读。
      </p>

      {parts.map((p) => (
        <div key={p.no} className="mt-14 first:mt-10">
          <div className="flex items-baseline gap-3">
            <span className="text-meta font-medium text-accent">
              第 {["一", "二", "三", "四"][p.no - 1]}部
            </span>
            <h3 className="text-head font-semibold tracking-tight">{p.title}</h3>
          </div>
          <p className="mt-2 max-w-[50ch] text-meta text-fg-2">{p.lead}</p>
          <ul className="mt-6">
            {unitsByPart(p.no).map((u) => (
              <UnitRow key={u.no} unit={u} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hair py-10">
      <p className="max-w-[56ch] text-meta text-fg-3">
        内容只讲「普通人怎么用 DSH 干活」，不是工程原理教程。
        所有演示代码都在真实 API 上验证过；无法验证的说法会明确标注。
      </p>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <TopBar />
      <main className={SHELL}>
        <Hero />
        <Modes />
        <AbilityStrip />
        <Roadmap />
        <Footer />
      </main>
    </>
  );
}
