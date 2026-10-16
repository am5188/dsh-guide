"use client";

import { useEffect, useState } from "react";

/**
 * 顺序点亮的步骤条。
 *
 * 用 JS 驱动「当前进行到第几步」，而不是纯 CSS 延迟 —— 这样才能：
 * - 每步之间用真实缓动（Material 3 的 Emphasized 曲线）过渡
 * - 已走过 / 正在走 / 还没到 三种状态各自呈现
 * - 连接线上的进度是连续推进的，不是一跳一跳
 * - 尊重 prefers-reduced-motion（直接显示全部完成态）
 */
export function SequenceAnim({
  title,
  caption,
  items,
}: {
  title: string;
  caption: string;
  items: { tag: string; label: string }[];
}) {
  const [active, setActive] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    if (mq.matches) {
      setActive(items.length - 1);
      return;
    }
    // 每 900ms 推进一步；走完停一会儿再从头来
    const id = window.setInterval(() => {
      setActive((a) => (a >= items.length ? 0 : a + 1));
    }, 900);
    return () => window.clearInterval(id);
  }, [items.length]);

  const n = items.length;
  const progress = n <= 1 ? 1 : Math.min(active, n - 1) / (n - 1);
  /** 圆点中心到两端的距离；轨道与进度都按它对齐，才不会偏 */
  const inset = `calc(100% / ${2 * n})`;
  const span = `calc(100% - 100% / ${n})`;

  return (
    <figure className="overflow-hidden rounded-lg bg-surface p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between text-caption text-fg-3">
        <span>{title}</span>
        <span>{reduce ? "已全部展开" : "逐步推进"}</span>
      </div>

      {/* 步骤轨道：单行等分，不换行 */}
      <div className="relative">
        {/* 底线 */}
        <div
          className="absolute top-[15px] h-px bg-line"
          style={{ left: inset, right: inset }}
          aria-hidden="true"
        />
        {/* 进度线：连续推进 */}
        <div
          className="absolute top-[15px] h-px bg-accent"
          style={{
            left: inset,
            width: `calc(${span} * ${progress})`,
            transition: "width 900ms cubic-bezier(0.2,0,0,1)",
          }}
          aria-hidden="true"
        />
        {/* 行进中的光点 */}
        {!reduce && (
          <div
            className="absolute top-[11px] size-[9px] rounded-full bg-accent"
            style={{
              left: `calc(${inset} + ${span} * ${progress} - 4px)`,
              boxShadow: "0 0 12px var(--accent)",
              transition: "left 900ms cubic-bezier(0.2,0,0,1)",
            }}
            aria-hidden="true"
          />
        )}

        <ol className="relative flex items-start gap-x-1">
          {items.map((it, i) => {
            const state =
              active > i ? "done" : active === i ? "current" : "upcoming";
            return (
              <li key={`${it.tag}-${it.label}`} className="min-w-0 flex-1">
                <div className="flex flex-col items-center">
                  <span
                    className={
                      "relative z-10 grid size-[31px] shrink-0 place-items-center rounded-full border text-caption " +
                      (state === "upcoming"
                        ? "border-line bg-surface text-fg-3"
                        : "border-accent bg-surface text-accent")
                    }
                    style={{
                      transition:
                        "border-color 400ms cubic-bezier(0.2,0,0,1), color 400ms cubic-bezier(0.2,0,0,1), transform 400ms cubic-bezier(0.05,0.7,0.1,1)",
                      transform:
                        state === "current" ? "scale(1.14)" : "scale(1)",
                    }}
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>

                  <span
                    className="mt-3 block px-0.5 text-center"
                    style={{
                      opacity: state === "upcoming" ? 0.4 : 1,
                      transform:
                        state === "upcoming"
                          ? "translateY(5px)"
                          : "translateY(0)",
                      transition:
                        "opacity 500ms cubic-bezier(0.05,0.7,0.1,1), transform 500ms cubic-bezier(0.05,0.7,0.1,1)",
                    }}
                  >
                    <span className="block font-mono text-micro text-fg-3">
                      {it.tag}
                    </span>
                    <span className="mt-0.5 block text-meta font-medium text-fg">
                      {it.label}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <figcaption className="mt-6 text-meta leading-relaxed text-fg-2">
        {caption}
      </figcaption>
    </figure>
  );
}
