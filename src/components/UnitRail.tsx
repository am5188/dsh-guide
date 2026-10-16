"use client";

import { useEffect, useState } from "react";
import { abilities, units, type Unit } from "@/lib/curriculum";

const SECTIONS = [
  { id: "anim", label: "先看一眼" },
  { id: "theory", label: "到底怎么回事" },
  { id: "practice", label: "你自己跑一遍" },
];

/**
 * 单元页右侧栏。
 *
 * 独立成客户端组件只为一件事：**滚动高亮**。
 * 原来的侧栏是个静态目录，读者滚到哪儿它都不知道，那它就只是占地方。
 * 现在它跟着阅读位置走，才配得上右侧这 228px。
 */
export function UnitRail({
  unit,
  unlocked,
  available,
}: {
  unit: Unit;
  unlocked: Unit["unlocks"];
  /** 这一节实际渲染了哪几段，没内容的段不列出来 */
  available: string[];
}) {
  const on = unlocked ?? [];
  const [active, setActive] = useState<string>(available[0] ?? "");
  // 用字符串做依赖：available 每次渲染都是新数组，直接当依赖会让 observer 反复重建
  const key = available.join(",");

  useEffect(() => {
    const ids = key ? key.split(",") : [];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const shown = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (shown[0]) setActive(shown[0].target.id);
      },
      // 顶部留出顶栏高度，底部收窄 => 只有真正读到的段落才算“当前”
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);

  const pct = Math.round((unit.no / units.length) * 100);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 space-y-3.5">
        <nav className="rounded-lg bg-surface p-3.5">
          <div className="px-2 text-caption font-medium text-fg-3">本页</div>
          <ul className="mt-2 space-y-0.5">
            {SECTIONS.filter((s) => available.includes(s.id)).map((s) => {
              const now = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={now ? "true" : undefined}
                    className={
                      "flex items-center gap-2 rounded-sm px-2 py-1.5 text-meta transition-colors duration-150 " +
                      (now
                        ? "bg-accent-soft font-medium text-accent"
                        : "text-fg-2 hover:bg-hover hover:text-fg")
                    }
                  >
                    <span
                      className={
                        "h-3.5 w-[2px] rounded-full " +
                        (now ? "bg-accent" : "bg-transparent")
                      }
                      aria-hidden="true"
                    />
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="rounded-lg bg-surface p-3.5">
          <div className="px-2 text-caption font-medium text-fg-3">能力进度</div>
          <ul className="mt-2 space-y-1">
            {abilities.map((a) => {
              const active2 = on.includes(a.id);
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-2 px-2 text-meta"
                >
                  <span
                    className={
                      "size-1.5 shrink-0 rounded-full " +
                      (active2 ? "bg-accent" : "bg-line-3")
                    }
                    aria-hidden="true"
                  />
                  <span className={active2 ? "text-accent" : "text-fg-3"}>
                    {a.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="px-2">
          <div className="flex items-baseline justify-between text-caption text-fg-3">
            <span>进度</span>
            <span className="font-mono">
              {unit.no} / {units.length}
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
