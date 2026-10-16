"use client";

import { AnimStage, alpha, readTheme, type Sketch } from "./AnimStage";

/* ── 缓动 ───────────────────────────────────────────────────── */
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/* ── 时间基准：整数帧 ──────────────────────────────────────────
   所有周期量都必须在 PERIOD_FRAMES 内走整数个循环，循环点才不会跳。
   这是“无缝循环”的唯一要求，浮点秒数做不到。
   ───────────────────────────────────────────────────────────── */
const FPS = 60;
const PERIOD_FRAMES = 300; // 5 秒一轮
const OFFSETS = [0, 96, 208]; // 三条消息的相位差，整数帧且不等距（等距会显得机械）
const TEXTS = ["我给你写一段介绍", "我帮你总结这份材料", "我去看看你的 D 盘"];

/** 画一颗圆角胶囊 + 居中文字 */
function pill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke: string,
  text: string,
  color: string,
  alphaValue: number,
) {
  ctx.save();
  ctx.globalAlpha = alphaValue;
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font =
    '500 13px -apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.restore();
}

/** 气泡在某个相位下的状态（纯函数，便于同时画主体和拖尾） */
function bubbleAt(p: number, start: number, end: number) {
  let x = start;
  let scaleX = 1;
  let scaleY = 1;
  let a = 0;

  if (p < 0.1) {
    // 预备：反向微缩，积蓄动能
    x = start - 10 * easeOutCubic(p / 0.1);
    a = clamp01((p / 0.1) * 2);
  } else if (p < 0.46) {
    // 行进：进出都用 cubic，不是 linear
    x = start + (end - start) * easeInOutCubic((p - 0.1) / 0.36);
    a = 1;
  } else if (p < 0.56) {
    // 撞击：挤压 squash
    const k = (p - 0.46) / 0.1;
    x = end;
    scaleX = 1 - 0.22 * Math.sin(k * Math.PI);
    scaleY = 1 + 0.26 * Math.sin(k * Math.PI);
    a = 1;
  } else if (p < 0.8) {
    // 回弹：过冲（follow-through）
    const k = (p - 0.56) / 0.24;
    x = end - (end - start) * 0.72 * easeOutBack(k);
    scaleX = 1 + 0.1 * (1 - k);
    scaleY = 1 - 0.1 * (1 - k);
    a = 1;
  } else {
    const k = (p - 0.8) / 0.2;
    x = end - (end - start) * 0.72;
    a = 1 - easeOutCubic(k);
  }
  return { x, scaleX, scaleY, a };
}

const sketch: Sketch = (ctx, t, w, h) => {
  const c = readTheme();
  const cy = h * 0.5;
  const PILL_FONT =
    '500 13px -apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.font = PILL_FONT;
  const pillW = TEXTS.map((tx) => Math.ceil(ctx.measureText(tx).width) + 28);

  /* ── 帧计数与循环相位 ─────────────────────────────────── */
  const fr = Math.round(t * FPS);
  const inPeriod = fr % PERIOD_FRAMES; // 0 .. PERIOD_FRAMES-1
  const ph = inPeriod / PERIOD_FRAMES; // 0 .. 1

  /* ── 背景：极淡的径向光 + 漂浮粒子（视差 0.2）─────────── */
  const bg = ctx.createRadialGradient(w * 0.42, cy, 0, w * 0.42, cy, w * 0.72);
  bg.addColorStop(0, alpha(c.dark ? "#ffffff" : "#000000", c.dark ? 0.045 : 0.025));
  bg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 30; i += 1) {
    const seed = i * 137.508;
    const bx = (seed * 7.31) % 100;
    const by = (seed * 3.17) % 100;
    // 每个粒子在一个周期内走整数圈，循环点才接得上
    const loops = 1 + (i % 3);
    const py = (by + ph * 100 * loops) % 100;
    const px = bx + Math.sin((inPeriod / PERIOD_FRAMES) * Math.PI * 2 * loops + i) * 2.2;
    ctx.beginPath();
    ctx.arc(
      ((px + 100) % 100) * (w / 100),
      py * (h / 100),
      0.9 + (i % 4) * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = alpha(c.fg, (0.18 + (i % 5) * 0.05) * 0.55);
    ctx.fill();
  }

  /* ── 布局 ─────────────────────────────────────────────── */
  const modelX = w * 0.13;
  const wallX = w * 0.545;
  const chipX = w * 0.7;
  const bubbleStart = modelX + 108;
  const bubbleEndFor = (i: number) => wallX - pillW[i] / 2 - 10;
  const laneY = (i: number) => cy - 92 + i * 34;

  /* ── 先算三条气泡，顺便得到撞击强度（用来点亮墙）──────── */
  const bubbles = TEXTS.map((text, i) => {
    const p = (((fr + OFFSETS[i]) % PERIOD_FRAMES) + PERIOD_FRAMES) /
      PERIOD_FRAMES;
    return { p, i, text };
  });

  const glowBase = 0.55 + 0.16 * Math.sin(ph * Math.PI * 2);
  const impactGlow = bubbles.reduce((acc, b) => {
    if (b.p >= 0.46 && b.p < 0.72) {
      const k = (b.p - 0.46) / 0.26;
      return acc + (1 - k) * 0.9;
    }
    return acc;
  }, 0);
  const glow = glowBase + impactGlow;

  /* ── 墙 ───────────────────────────────────────────────── */
  const wallH = h * 0.72;
  ctx.save();
  ctx.shadowColor = alpha(c.warn, Math.min(1, glow) * 0.85);
  ctx.shadowBlur = 26 + glow * 34;
  ctx.strokeStyle = alpha(c.warn, 0.6 + Math.min(1, glow) * 0.4);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(wallX, cy - wallH / 2);
  ctx.lineTo(wallX, cy + wallH / 2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = alpha(c.warn, 0.9);
  ctx.font = '500 12px -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("它过不去", wallX, cy - wallH / 2 - 14);

  /* ── 撞击涟漪 ─────────────────────────────────────────── */
  for (const b of bubbles) {
    if (b.p >= 0.46 && b.p < 0.74) {
      const k = (b.p - 0.46) / 0.28;
      ctx.beginPath();
      ctx.arc(wallX, laneY(b.i), 8 + k * 50, 0, Math.PI * 2);
      ctx.strokeStyle = alpha(c.warn, (1 - k) * 0.5);
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  }

  /* ── 撞击粒子：从接触点溅开 ───────────────────────────────
     位置只由相位决定，且用固定 seed 哈希（不用 Math.random），
     所以它同样在 300 帧内完美循环。
     ───────────────────────────────────────────────────────── */
  for (const b of bubbles) {
    if (b.p < 0.46 || b.p >= 0.78) continue;
    const k = (b.p - 0.46) / 0.32;
    const lane = laneY(b.i);
    for (let j = 0; j < 14; j += 1) {
      const seed = (j + b.i * 7) * 137.508;
      const frac = (x: number) => x - Math.floor(x);
      const ang = (frac(seed * 0.017) - 0.5) * Math.PI * 1.1;
      const speed = 2.2 + frac(seed * 0.031) * 4.4;
      const life = 16 + frac(seed * 0.053) * 14;
      const age = k * 30;
      if (age > life) continue;
      const px = wallX - Math.cos(ang) * speed * age;
      const py = lane + Math.sin(ang) * speed * age + 0.09 * age * age;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = alpha(c.warn, (1 - age / life) * 0.85);
      ctx.fill();
    }
  }

  /* ── 模型节点：光晕呼吸（也在一个周期内整数循环）──────── */
  const breath = 1 + 0.07 * Math.sin(ph * Math.PI * 4);
  const halo = ctx.createRadialGradient(modelX, cy, 0, modelX, cy, 54 * breath);
  halo.addColorStop(0, alpha(c.accent, 0.3));
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(modelX, cy, 54 * breath, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(modelX - 3, cy - 3, 0, modelX, cy, 15);
  core.addColorStop(0, "#ffffff");
  core.addColorStop(0.5, c.accent);
  core.addColorStop(1, alpha(c.accent, 0.85));
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(modelX, cy, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.accent;
  ctx.font = '600 15px -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("模型", modelX, cy + 40);
  ctx.fillStyle = c.fg3;
  ctx.font = '400 12px -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif';
  ctx.fillText("只会想 · 只会说", modelX, cy + 58);

  /* ── 引导虚线 ─────────────────────────────────────────── */
  ctx.save();
  ctx.strokeStyle = alpha(c.fg3, 0.28);
  ctx.setLineDash([3, 4]);
  ctx.lineWidth = 1;
  for (let i = 0; i < TEXTS.length; i += 1) {
    ctx.beginPath();
    ctx.moveTo(modelX + 20, cy - 6);
    ctx.lineTo(bubbleStart - pillW[i] / 2 - 10, laneY(i));
    ctx.stroke();
  }
  ctx.restore();

  /* ── 气泡：先画拖尾，再画主体 ─────────────────────────── */
  const drawBubble = (i: number, p: number, alphaScale: number) => {
    const bw = pillW[i];
    const bh = 26;
    const st = bubbleAt(p, bubbleStart, bubbleEndFor(i));
    if (st.a <= 0.01) return;
    ctx.save();
    ctx.translate(st.x, laneY(i));
    ctx.scale(st.scaleX, st.scaleY);
    pill(
      ctx,
      -bw / 2,
      -bh / 2,
      bw,
      bh,
      c.sunken,
      c.line,
      TEXTS[i],
      c.fg2,
      st.a * alphaScale,
    );
    ctx.restore();
  };

  for (let i = 0; i < bubbles.length; i += 1) {
    const p = bubbles[i].p;
    // 运动拖尾：取稍早的相位，越远越淡。
    // 相位必须环绕取模 —— 否则循环点处 pp 变负、拖尾会突然消失，那就是一道可见的缝。
    for (const [delta, a] of [
      [0.035, 0.22],
      [0.07, 0.12],
      [0.105, 0.06],
    ] as [number, number][]) {
      const pp = (((p - delta) % 1) + 1) % 1;
      drawBubble(i, pp, a);
    }
    drawBubble(i, p, 1);
  }

  /* ── 右侧目标 ─────────────────────────────────────────── */
  const chips = ["你的文件夹", "你的 Excel", "你的邮箱"];
  chips.forEach((label, i) => {
    pill(
      ctx,
      chipX,
      cy - 44 + i * 44 - 15,
      120,
      30,
      c.sunken,
      c.line,
      label,
      c.fg3,
      1,
    );
  });

  /* ── 扫光 ─────────────────────────────────────────────── */
  const sweepX = ph * (w + 320) - 160;
  const sweep = ctx.createLinearGradient(sweepX - 90, 0, sweepX + 90, 0);
  sweep.addColorStop(0, "rgba(255,255,255,0)");
  sweep.addColorStop(0.5, alpha(c.dark ? "#ffffff" : "#000000", 0.03));
  sweep.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, w, h);

  /* ── 分裂调色：暗部偏冷、亮部偏暖 ────────────────────────
     设计配色 ≠ 成片影调。这一层让画布和短片共用同一套影调，
     是"看起来像成片而不是网页截图"最便宜的一步。
     ───────────────────────────────────────────────────────── */
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = c.dark ? 0.22 : 0.14;
  const grade = ctx.createLinearGradient(0, 0, w * 0.4, h);
  grade.addColorStop(0, "#ffd6aa");
  grade.addColorStop(1, "#2b5a8c");
  ctx.fillStyle = grade;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  /* ── 暗角 ─────────────────────────────────────────────── */
  const vig = ctx.createRadialGradient(
    w / 2,
    cy,
    Math.min(w, h) * 0.26,
    w / 2,
    cy,
    Math.max(w, h) * 0.62,
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, alpha("#000000", c.dark ? 0.4 : 0.1));
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
};

/**
 * 第 1 节的动画：模型能“说”，但过不去那道墙。
 *
 * 逐帧渲染（Canvas 2D），并且是**无缝循环**的：
 * 所有周期量都由整数帧计数驱动，在一个 5 秒周期内走整数个循环，
 * 所以循环点不会跳。气泡还带运动拖尾。
 */
export function Unit01Anim() {
  return (
    <figure className="overflow-hidden rounded-lg bg-surface">
      <div className="flex items-center justify-between px-5 pt-5 text-caption text-fg-3 sm:px-6">
        <span>模型的边界</span>
        <span>无缝循环 · 5 秒一轮</span>
      </div>

      <AnimStage
        sketch={sketch}
        height={300}
        label="动画示意：模型发出三条消息，都被中间那道墙挡住弹回；墙的右侧是它够不到的文件"
      />

      <figcaption className="px-5 pb-5 text-meta leading-relaxed text-fg-2 sm:px-6">
        前两句它真能做到。第三句它也会一本正经地回答，但它其实从来没打开过你的硬盘
        ——它只是在“接着往下写”。这道墙，就是后面 22 节要一层层拆的东西。
      </figcaption>
    </figure>
  );
}
