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

const PERIOD = 4.6; // 每个气泡一个完整周期
const OFFSETS = [0, 1.53, 3.06];
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
  ctx.font = '500 13px -apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.restore();
}

/** 背景漂浮粒子（视差 0.2） */
function particles(count: number, t: number, w: number, h: number) {
  const out: { x: number; y: number; r: number; a: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const seed = i * 137.508;
    const bx = (seed * 7.31) % 100;
    const by = (seed * 3.17) % 100;
    const speed = 0.5 + ((i % 5) * 0.22);
    out.push({
      x: ((bx + Math.sin(t * 0.16 + i) * 2.4 + 100) % 100) * (w / 100),
      y: ((by + t * speed * 0.9) % 108) * (h / 100) - h * 0.04,
      r: 0.9 + (i % 4) * 0.55,
      a: 0.16 + (i % 5) * 0.05,
    });
  }
  return out;
}

const sketch: Sketch = (ctx, t, w, h) => {
  const c = readTheme();
  const cy = h * 0.5;
  const PILL_FONT =
    '500 13px -apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.font = PILL_FONT;
  // 按文字实际宽度决定胶囊宽度，避免截断
  const pillW = TEXTS.map((tx) => Math.ceil(ctx.measureText(tx).width) + 28);

  /* ── 背景：极淡的径向光 + 漂浮粒子 ───────────────────── */
  const bg = ctx.createRadialGradient(w * 0.42, cy, 0, w * 0.42, cy, w * 0.72);
  bg.addColorStop(0, alpha(c.dark ? "#ffffff" : "#000000", c.dark ? 0.045 : 0.025));
  bg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (const p of particles(30, t, w, h)) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = alpha(c.fg, p.a * 0.5);
    ctx.fill();
  }

  /* ── 布局 ─────────────────────────────────────────────── */
  const modelX = w * 0.13;
  const wallX = w * 0.545;
  const chipX = w * 0.7;
  const bubbleStart = modelX + 108;
  /** 每条消息的终点各不相同：让胶囊右缘正好停在墙前，不能压过墙 */
  const bubbleEndFor = (i: number) => wallX - pillW[i] / 2 - 10;
  /** 三条消息各占一条道，避免互相压在一起 */
  const laneY = (i: number) => cy - 92 + i * 34;

  /* ── 墙：呼吸 + 被撞时发光 ───────────────────────────── */
  const wallH = h * 0.72;
  const glowBase = 0.55 + 0.16 * Math.sin(t * 0.9);

  // 先算三个气泡，顺便得到撞击强度（用来点亮墙）
  const bubbles = TEXTS.map((text, i) => {
    const p = ((t + OFFSETS[i]) % PERIOD) / PERIOD;
    const start = bubbleStart;
    const end = bubbleEndFor(i);
    let x = start;
    let scaleX = 1;
    let scaleY = 1;
    let a = 0;

    if (p < 0.1) {
      // 预备：反向微缩，积蓄动能
      const k = p / 0.1;
      x = start - 10 * easeOutCubic(k);
      a = clamp01(k * 2);
    } else if (p < 0.46) {
      // 行进：进出都用 cubic，不是 linear
      const k = (p - 0.1) / 0.36;
      x = start + (end - start) * easeInOutCubic(k);
      a = 1;
    } else if (p < 0.56) {
      // 撞击：挤压（squash），并弹出涟漪
      const k = (p - 0.46) / 0.1;
      x = end;
      scaleX = 1 - 0.22 * Math.sin(k * Math.PI);
      scaleY = 1 + 0.26 * Math.sin(k * Math.PI);
      a = 1;
    } else if (p < 0.8) {
      // 回弹：带过冲（follow-through）
      const k = (p - 0.56) / 0.24;
      x = end - (end - start) * 0.72 * easeOutBack(k);
      scaleX = 1 + 0.1 * (1 - k);
      scaleY = 1 - 0.1 * (1 - k);
      a = 1;
    } else {
      // 淡出
      const k = (p - 0.8) / 0.2;
      x = end - (end - start) * 0.72;
      a = 1 - easeOutCubic(k);
    }
    return { p, x, scaleX, scaleY, a, text };
  });

  const glow = bubbles.reduce((acc, b) => {
    if (b.p >= 0.46 && b.p < 0.72) {
      const k = (b.p - 0.46) / 0.26;
      return acc + (1 - k) * 0.9;
    }
    return acc;
  }, glowBase);

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

  // 墙上的标签
  ctx.fillStyle = alpha(c.warn, 0.9);
  ctx.font = '500 12px -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("它过不去", wallX, cy - wallH / 2 - 14);

  /* ── 撞击涟漪：从被撞的那条道上扩散 ───────────────────── */
  for (let i = 0; i < bubbles.length; i += 1) {
    const b = bubbles[i];
    if (b.p >= 0.46 && b.p < 0.74) {
      const k = (b.p - 0.46) / 0.28;
      ctx.beginPath();
      ctx.arc(wallX, laneY(i), 8 + k * 50, 0, Math.PI * 2);
      ctx.strokeStyle = alpha(c.warn, (1 - k) * 0.5);
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  }

  /* ── 模型节点：光晕呼吸（连续变化量）─────────────────── */
  const breath = 1 + 0.07 * Math.sin(t * 1.35);
  const halo = ctx.createRadialGradient(modelX, cy, 0, modelX, cy, 54 * breath);
  halo.addColorStop(0, alpha(c.accent, 0.3));
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(modelX, cy, 54 * breath, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(
    modelX - 3,
    cy - 3,
    0,
    modelX,
    cy,
    15,
  );
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

  /* ── 从模型出发的气泡（每条占一条道）─────────────────── */
  for (let i = 0; i < bubbles.length; i += 1) {
    const b = bubbles[i];
    if (b.a <= 0.01) continue;
    const bw = pillW[i];
    const bh = 26;
    ctx.save();
    ctx.translate(b.x, laneY(i));
    ctx.scale(b.scaleX, b.scaleY);
    pill(
      ctx,
      -bw / 2,
      -bh / 2,
      bw,
      bh,
      c.sunken,
      c.line,
      b.text,
      c.fg2,
      b.a,
    );
    ctx.restore();
  }

  // 从模型到每条道起点的引导虚线，让“消息从模型发出”看得更清楚
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

  /* ── 右侧目标 ─────────────────────────────────────────── */
  const chips = ["你的文件夹", "你的 Excel", "你的邮箱"];
  chips.forEach((label, i) => {
    const y = cy - 44 + i * 44;
    pill(
      ctx,
      chipX,
      y - 15,
      120,
      30,
      c.sunken,
      c.line,
      label,
      c.fg3,
      1,
    );
  });

  /* ── 扫光：一条缓慢移动的高光，杜绝静止帧 ─────────────── */
  const sweepX = ((t * 0.16) % 1) * (w + 320) - 160;
  const sweep = ctx.createLinearGradient(sweepX - 90, 0, sweepX + 90, 0);
  sweep.addColorStop(0, "rgba(255,255,255,0)");
  sweep.addColorStop(0.5, alpha(c.dark ? "#ffffff" : "#000000", 0.03));
  sweep.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, w, h);

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
  vig.addColorStop(1, alpha(c.dark ? "#000000" : "#000000", c.dark ? 0.4 : 0.1));
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
};

/**
 * 第 1 节的动画：模型能“说”，但过不去那道墙。
 * 逐帧渲染（Canvas 2D），不是 CSS 关键帧 —— 缓动可编程，
 * 因此能做预备动作、撞击回弹、涟漪与跟随。
 */
export function Unit01Anim() {
  return (
    <figure className="overflow-hidden rounded-lg bg-surface">
      <div className="flex items-center justify-between px-5 pt-5 text-caption text-fg-3 sm:px-6">
        <span>模型的边界</span>
        <span>循环播放</span>
      </div>

      <div className="relative">
        <AnimStage
          sketch={sketch}
          height={300}
          label="动画示意：模型发出三条消息，都被中间那道墙挡住弹回；墙的右侧是它够不到的文件"
        />
      </div>

      <figcaption className="px-5 pb-5 text-meta leading-relaxed text-fg-2 sm:px-6">
        前两句它真能做到。第三句它也会一本正经地回答，但它其实从来没打开过你的硬盘
        ——它只是在“接着往下写”。这道墙，就是后面 22 节要一层层拆的东西。
      </figcaption>
    </figure>
  );
}
