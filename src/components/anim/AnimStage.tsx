"use client";

import { useEffect, useRef, useState } from "react";

export type Sketch = (
  ctx: CanvasRenderingContext2D,
  t: number,
  w: number,
  h: number,
) => void;

export type AnimTheme = {
  accent: string;
  warn: string;
  ok: string;
  fg: string;
  fg2: string;
  fg3: string;
  surface: string;
  canvas: string;
  line: string;
  sunken: string;
  dark: boolean;
};

/**
 * 从 CSS 变量读当前主题色，画布才能跟着明暗切换。
 * 结果缓存 400ms —— 逐帧调用 getComputedStyle 会强制样式重算，代价太高。
 */
let themeCache: AnimTheme | null = null;
let themeCacheAt = 0;

export function readTheme(force = false): AnimTheme {
  const now =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  if (!force && themeCache && now - themeCacheAt < 400) return themeCache;

  const el = document.documentElement;
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback;
  themeCache = {
    accent: v("--accent", "#4176e6"),
    warn: v("--color-warn-500", "#f59e0b"),
    ok: v("--color-ok-500", "#22c55e"),
    fg: v("--fg", "#0f1115"),
    fg2: v("--fg-2", "#61666b"),
    fg3: v("--fg-3", "#81858c"),
    surface: v("--surface", "#f9fafb"),
    canvas: v("--canvas", "#ffffff"),
    line: v("--line", "rgba(0,0,0,0.1)"),
    sunken: v("--sunken", "#f5f6f7"),
    dark: el.getAttribute("data-theme") === "dark",
  };
  themeCacheAt = now;
  return themeCache;
}

/** 把 #rrggbb 加上透明度 */
export function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * 逐帧动画容器。
 * - 时间是纯函数：draw(t)，不累积状态，所以能暂停、能重播、能适应任意帧率
 * - 帧计数用整数累加，长时间运行不会漂移（循环动画要靠它做到无缝）
 * - 离屏自动暂停（省电、不拖累滚动）
 * - prefers-reduced-motion 时只画一帧静止画面
 * - 跟随系统主题切换重新取色
 * - 带播放/暂停按钮（参考 ciechanow.ski 的做法：读者能自己关掉动画）
 */
export function AnimStage({
  sketch,
  height = 260,
  label,
}: {
  sketch: Sketch;
  height?: number;
  label?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  /**
   * sketch 放进 ref，effect 只依赖 height。
   * 否则调用方每次渲染新建一个函数，effect 就会重跑、动画被不断重置 ——
   * 这是内联写 sketch 时最容易踩的坑。
   */
  const sketchRef = useRef(sketch);
  sketchRef.current = sketch;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduce);
    readTheme(true);

    /**
     * 测试钩子：?animframe=N 把动画冻结在第 N 帧。
     * 循环动画的正确性可以这样严格验证 —— 渲染第 0 帧和第 PERIOD 帧，
     * 两图应当逐像素相同。生产环境不带这个参数时没有任何影响。
     */
    const forcedRaw = new URLSearchParams(window.location.search).get("animframe");
    const forced = forcedRaw === null ? null : Number(forcedRaw);
    const forcedFrame = Number.isFinite(forced) ? forced : null;

    let raf = 0;
    let frameCount = 0; // 整数帧计数：不漂移
    let visible = true;
    let cssW = 0;
    let cssH = height;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH);
      sketchRef.current(ctx, frameCount / 60, cssW, cssH);
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || pausedRef.current) return;
      frameCount += 1;
      draw();
    };

    resize();
    if (forcedFrame !== null) {
      frameCount = forcedFrame;
      draw();
    } else {
      frameCount = Math.round(1.6 * 60); // reduced-motion：停在动作中段
      draw();
    }

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const mo = new MutationObserver(() => {
      readTheme(true);
      draw();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    if (!reduce && forcedFrame === null) {
      frameCount = 0;
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, [height]);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={ref}
        role="img"
        aria-label={label}
        style={{ width: "100%", height, display: "block" }}
      />
      {!reduced && (
        <button
          type="button"
          onClick={() => {
            pausedRef.current = !pausedRef.current;
            setPaused(pausedRef.current);
          }}
          aria-label={paused ? "播放动画" : "暂停动画"}
          title={paused ? "播放动画" : "暂停动画"}
          className="absolute bottom-2 left-2 grid size-7 place-items-center rounded-sm bg-canvas/85 text-caption text-fg-3 backdrop-blur-sm transition-colors duration-150 hover:text-fg"
        >
          <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
        </button>
      )}
    </div>
  );
}
