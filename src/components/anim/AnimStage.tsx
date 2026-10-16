"use client";

import { useEffect, useRef } from "react";

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
 * - 离屏自动暂停（省电、不拖累滚动）
 * - prefers-reduced-motion 时只画一帧静止画面
 * - 跟随系统主题切换重新取色
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

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const theme = readTheme(true);
    void theme;
    let raf = 0;
    let start = performance.now();
    let elapsed = 0;
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

    const draw = (t: number) => {
      ctx.clearRect(0, 0, cssW, cssH);
      sketch(ctx, t, cssW, cssH);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) {
        start = now - elapsed; // 离屏时把时间冻住
        return;
      }
      elapsed = now - start;
      draw(elapsed / 1000);
    };

    resize();
    draw(reduce ? 1.6 : 0); // reduced-motion：画在动作中段，信息量最大

    const ro = new ResizeObserver(() => {
      resize();
      draw(reduce ? 1.6 : elapsed / 1000);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    // 主题切换时重新取色
    const mo = new MutationObserver(() => {
      readTheme(true);
      draw(reduce ? 1.6 : elapsed / 1000);
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, [sketch, height]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      style={{ width: "100%", height, display: "block" }}
    />
  );
}
