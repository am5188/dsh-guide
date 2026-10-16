import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { CommandBlock } from "@/components/CommandBlock";
import { Playground } from "@/components/Playground";
import {
  IconDiagram,
  IconFilm,
  IconTerminal,
  type IconProps,
} from "@/components/icons";
import { unitContent } from "@/content";
import { abilities, units, type Unit } from "@/lib/curriculum";

function Slot({
  id,
  Icon,
  label,
  title,
  children,
}: {
  id: string;
  Icon: (p: IconProps) => React.ReactElement;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-sm bg-surface text-fg-2">
          <Icon size={15} />
        </span>
        <span className="text-caption text-fg-3">{label}</span>
        <h2 className="text-title font-bold tracking-tight">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function UnitPage({ unit }: { unit: Unit }) {
  const content = unitContent[unit.no];
  const prev = units.find((u) => u.no === unit.no - 1);
  const next = units.find((u) => u.no === unit.no + 1);
  const unlocked = unit.unlocks ?? [];

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[920px] px-5 sm:px-8">
        <div className="mx-auto max-w-[704px]">
          <nav className="pt-8 text-meta text-fg-3">
            <Link href="/" className="transition-colors hover:text-fg">
              目录
            </Link>
            <span className="mx-2">/</span>
            <span>第 {unit.no} 节</span>
          </nav>

          <header className="mt-6 border-b border-hair pb-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-meta text-fg-3">
              <span className="font-mono">
                {String(unit.no).padStart(2, "0")} / 22
              </span>
              {unit.era && (
                <span className="rounded-xs bg-sunken px-1.5 py-0.5 font-mono text-micro">
                  {unit.era}
                </span>
              )}
              {unlocked.map((u) => (
                <span
                  key={u}
                  className="rounded-xs bg-accent-soft px-1.5 py-0.5 text-micro text-accent"
                >
                  点亮「{abilities.find((a) => a.id === u)?.label}」
                </span>
              ))}
            </div>

            <h1 className="mt-4 text-head font-bold tracking-tight text-balance">
              {unit.title}
            </h1>
            <p className="mt-4 max-w-[520px] text-lead text-fg-2">{unit.hook}</p>
          </header>

          <div className="mt-14 space-y-16">
            {content ? (
              <>
                {content.anim && (
                  <Slot
                    id="anim"
                    Icon={IconFilm}
                    label="先看一眼"
                    title={content.animTitle ?? "先建立直觉"}
                  >
                    {content.anim}
                  </Slot>
                )}
                {content.theory && (
                  <Slot
                    id="theory"
                    Icon={IconDiagram}
                    label="到底怎么回事"
                    title="机制与边界"
                  >
                    {content.theory}
                  </Slot>
                )}
                {(content.demos?.length || content.commands?.length) && (
                  <Slot
                    id="practice"
                    Icon={IconTerminal}
                    label="你自己跑一遍"
                    title="现场验证"
                  >
                    <div className="space-y-6">
                      {content.practiceIntro}
                      {content.demos && content.demos.length > 0 && (
                        <Playground demos={content.demos} />
                      )}
                      {content.commands && content.commands.length > 0 && (
                        <CommandBlock commands={content.commands} />
                      )}
                    </div>
                  </Slot>
                )}
              </>
            ) : (
              <div className="rounded-lg bg-surface p-7">
                <h2 className="text-body-sm font-semibold">这一节还没有写</h2>
                <p className="mt-2 text-meta text-fg-2">
                  内容按顺序推进，目前只完成了第 1 节。这一节会沿用同一个三段式结构：
                </p>
                <ul className="mt-5 space-y-3 text-meta text-fg-2">
                  <li className="flex items-center gap-2.5">
                    <IconFilm size={15} /> 先看一眼 —— 一段动画说明痛点
                  </li>
                  <li className="flex items-center gap-2.5">
                    <IconDiagram size={15} /> 到底怎么回事 —— 图解与边界
                  </li>
                  <li className="flex items-center gap-2.5">
                    <IconTerminal size={15} /> 你自己跑一遍 —— 当场可运行的代码
                  </li>
                </ul>
              </div>
            )}
          </div>

          <nav className="mt-20 flex flex-col gap-3 border-t border-hair pt-8 sm:flex-row">
            {prev ? (
              <Link
                href={`/u/${prev.no}/`}
                className="min-w-0 flex-1 rounded-lg bg-surface p-5 transition-colors hover:bg-hover"
              >
                <div className="text-caption text-fg-3">上一节</div>
                <div className="mt-1.5 truncate text-body-sm font-medium">
                  {prev.title}
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {next ? (
              <Link
                href={`/u/${next.no}/`}
                className="min-w-0 flex-1 rounded-lg bg-surface p-5 text-right transition-colors hover:bg-hover"
              >
                <div className="text-caption text-fg-3">下一节</div>
                <div className="mt-1.5 truncate text-body-sm font-medium">
                  {next.title}
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </nav>
        </div>
      </main>
    </>
  );
}
