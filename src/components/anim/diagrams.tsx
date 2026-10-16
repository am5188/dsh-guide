"use client";

import { AnimStage, alpha, readTheme, type Sketch } from "./AnimStage";

/* ════════════════════════════════════════════════════════════════
   内联动画原件库

   为什么要有这个库：全书 23 节如果每个动画都手写一遍，成本高到做不完。
   而这些图要讲的事情反复出现 —— 流程、对照、量级、组成、循环。
   所以把它们抽成**参数化的原件**，每节只需要传标签。

   所有原件都遵守同一条硬约束：**由整数帧驱动，在一个周期内走整数个循环**，
   所以每一张图都是无缝循环的（验证方法见 docs/BUILD.md 第 10 节）。
   ════════════════════════════════════════════════════════════════ */

const FONT =
  '-apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif';
const BODY = `500 14px ${FONT}`;
const SMALL = `400 12px ${FONT}`;
const TAG = `600 12px ${FONT}`;

type Ctx = CanvasRenderingContext2D;

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function roundRect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function text(
  ctx: Ctx,
  str: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = "center",
  a = 1,
) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(str, x, y);
  ctx.restore();
}

/** 量文本宽度，用来定胶囊/方块的尺寸，避免中文被截断 */
function measure(ctx: Ctx, str: string, font: string) {
  ctx.save();
  ctx.font = font;
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
}

/** 统一的图壳：一块画布 + 可选说明 */
function Figure({
  height,
  label,
  caption,
  sketch,
}: {
  height: number;
  label: string;
  caption?: string;
  sketch: Sketch;
}) {
  return (
    <div className="my-7 overflow-hidden rounded-lg bg-surface">
      <AnimStage sketch={sketch} height={height} label={label} />
      {caption ? (
        <p className="px-5 pb-4 text-meta leading-relaxed text-fg-2">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   1. 流程图：一串节点，一个脉冲依次点亮它们
   用于「先做 A，再做 B，最后 C」这类线性过程
   ════════════════════════════════════════════════════════════════ */
export function FlowAnim({
  nodes,
  caption,
  keep = 26,
}: {
  nodes: string[];
  caption?: string;
  /** 每个节点停留多少帧 */
  keep?: number;
}) {
  const sketch: Sketch = (ctx, t, w, h) => {
    const c = readTheme();
    const n = nodes.length;
    const per = keep + 24; // 每跳 24 帧
    const period = per * n;
    const fr = Math.round(t * 60) % period;
    const idx = Math.floor(fr / per);
    const local = (fr % per) / per;

    const padX = Math.max(26, w * 0.06);
    const span = w - padX * 2;
    const cy = h * 0.46;

    ctx.font = BODY;
    const wid = nodes.map((s) => Math.max(58, measure(ctx, s, BODY) + 26));

    // 轨道
    ctx.strokeStyle = alpha(c.fg3, 0.22);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padX + wid[0] / 2, cy);
    ctx.lineTo(w - padX - wid[n - 1] / 2, cy);
    ctx.stroke();

    // 已点亮部分的进度线
    const prog = clamp01((idx + easeOutCubic(clamp01(local * 1.6))) / (n - 1 || 1));
    ctx.strokeStyle = alpha(c.accent, 0.75);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padX + wid[0] / 2, cy);
    ctx.lineTo(
      padX + wid[0] / 2 + (w - padX - wid[n - 1] / 2 - padX - wid[0] / 2) * prog,
      cy,
    );
    ctx.stroke();

    // 节点
    const wid0 = wid[0];
    const step = n > 1 ? span / (n - 1) : 0;
    for (let i = 0; i < n; i += 1) {
      const x = padX + wid0 / 2 + step * i;
      const on = i < idx || (i === idx && local > 0.5);
      const isNow = i === idx;
      const blobW = wid[i];
      const scale = isNow ? 1 + 0.06 * Math.sin(clamp01(local) * Math.PI) : 1;

      ctx.save();
      ctx.translate(x, cy);
      ctx.scale(scale, scale);
      roundRect(ctx, -blobW / 2, -19, blobW, 38, 12);
      ctx.fillStyle = on ? alpha(c.accent, 0.12) : c.canvas;
      ctx.fill();
      ctx.strokeStyle = on ? alpha(c.accent, 0.7) : alpha(c.fg3, 0.3);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      text(
        ctx,
        nodes[i],
        x,
        cy,
        BODY,
        on ? c.accent : c.fg3,
        "center",
        on ? 1 : 0.75,
      );
    }

    // 脉冲点
    const px = padX + wid0 / 2 + step * (idx + easeOutCubic(clamp01(local * 1.6)));
    ctx.beginPath();
    ctx.arc(px, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = c.accent;
    ctx.shadowColor = c.accent;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    text(ctx, "循环演示", w - 14, 16, TAG, c.fg3, "right", 0.6);
  };

  return (
    <Figure
      height={130}
      label={`流程示意：${nodes.join(" → ")}`}
      caption={caption}
      sketch={sketch}
    />
  );
}

/* ════════════════════════════════════════════════════════════════
   2. 对照图：两栏逐条落位
   用于「A 是这样的，B 是那样的」这类对比
   ════════════════════════════════════════════════════════════════ */
export function SplitAnim({
  left,
  right,
  caption,
}: {
  left: { title: string; items: string[] };
  right: { title: string; items: string[] };
  caption?: string;
}) {
  const sketch: Sketch = (ctx, t, w, h) => {
    const c = readTheme();
    const total = left.items.length + right.items.length;
    const period = total * 22 + 110;
    // 起始相位偏移：第一帧就该有内容，不能给读者一个空盒子
    const fr = (Math.round(t * 60) + period - 70) % period;

    const colW = (w - 36) / 2;
    const xs = [18, 18 + colW + 12];

    const drawCol = (
      x: number,
      col: { title: string; items: string[] },
      tone: string,
      startIndex: number,
    ) => {
      const boxH = h - 34;
      roundRect(ctx, x, 14, colW, boxH, 12);
      ctx.fillStyle = c.canvas;
      ctx.fill();
      ctx.strokeStyle = alpha(tone, 0.3);
      ctx.lineWidth = 1.2;
      ctx.stroke();

      text(ctx, col.title, x + colW / 2, 40, TAG, tone);

      col.items.forEach((it, i) => {
        const at = startIndex + i;
        const k = clamp01((fr - at * 22) / 20);
        const y = 72 + i * 30;
        ctx.save();
        ctx.globalAlpha = 0.25 + 0.75 * k;
        roundRect(ctx, x + 14, y - 11, colW - 28, 24, 8);
        ctx.fillStyle = alpha(tone, 0.06 + 0.06 * k);
        ctx.fill();
        ctx.restore();
        text(
          ctx,
          it,
          x + 24,
          y + 1,
          SMALL,
          c.fg2,
          "left",
          0.35 + 0.65 * k,
        );
      });
    };

    drawCol(xs[0], left, c.fg3, 0);
    drawCol(xs[1], right, c.accent, left.items.length);
  };

  return (
    <Figure
      height={190}
      label={`对照示意：${left.title} / ${right.title}`}
      caption={caption}
      sketch={sketch}
    />
  );
}

/* ════════════════════════════════════════════════════════════════
   3. 量级图：一条刻度条涨到某个位置，可带阈值
   用于「花了多少」「占比多大」「上限在哪」
   ════════════════════════════════════════════════════════════════ */
export function GaugeAnim({
  value,
  label,
  hint,
  threshold,
  thresholdLabel,
  caption,
}: {
  /** 0 – 1 */
  value: number;
  label: string;
  hint?: string;
  /** 0 – 1，画一根阈值竖线 */
  threshold?: number;
  thresholdLabel?: string;
  caption?: string;
}) {
  const sketch: Sketch = (ctx, t, w, h) => {
    const c = readTheme();
    const period = 300;
    // 从「刚涨满」起手：读者一进来就看到结果，而不是空条
    const fr = (Math.round(t * 60) + 120) % period;
    // 0–120 涨、120–230 停、230–300 归零
    let k = 0;
    if (fr < 120) k = easeOutCubic(fr / 120);
    else if (fr < 230) k = 1;
    else k = 1 - easeInOutCubic((fr - 230) / 70);

    const x0 = 34;
    const x1 = w - 34;
    const barW = x1 - x0;
    const y = h * 0.58;

    text(ctx, label, x0, 30, TAG, c.fg2, "left");
    if (hint) text(ctx, hint, x1, 30, SMALL, c.fg3, "right");

    roundRect(ctx, x0, y - 9, barW, 18, 9);
    ctx.fillStyle = c.canvas;
    ctx.fill();
    ctx.strokeStyle = alpha(c.fg3, 0.25);
    ctx.lineWidth = 1;
    ctx.stroke();

    const fill = barW * value * k;
    roundRect(ctx, x0, y - 9, Math.max(fill, 0.1), 18, 9);
    ctx.fillStyle = alpha(c.accent, 0.85);
    ctx.fill();

    const head = x0 + fill;
    if (k > 0.02) {
      ctx.beginPath();
      ctx.arc(head, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = c.accent;
      ctx.shadowColor = c.accent;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (threshold !== undefined) {
      const tx = x0 + barW * threshold;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = alpha(c.warn, 0.85);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx, y - 22);
      ctx.lineTo(tx, y + 22);
      ctx.stroke();
      ctx.restore();
      if (thresholdLabel)
        text(ctx, thresholdLabel, tx, y + 36, SMALL, c.warn, "center", 0.9);
    }

    text(ctx, `${Math.round(value * 100)}%`, x0, y + 36, SMALL, c.fg3, "left");
  };

  return (
    <Figure
      height={130}
      label={`量级示意：${label} ${Math.round(value * 100)}%`}
      caption={caption}
      sketch={sketch}
    />
  );
}

/* ════════════════════════════════════════════════════════════════
   4. 组成图：一块一块填进容器，直到超出上限
   用于「上下文窗口」「预算被什么吃掉」这类
   ════════════════════════════════════════════════════════════════ */
export function StackAnim({
  items,
  capLabel,
  overLabel,
  caption,
}: {
  items: { label: string; weight: number }[];
  capLabel: string;
  overLabel?: string;
  caption?: string;
}) {
  const sketch: Sketch = (ctx, t, w, h) => {
    const c = readTheme();
    const period = 330;
    // 从「已经填满」起手
    const fr = (Math.round(t * 60) + 250) % period;
    let k = 0;
    if (fr < 200) k = fr / 200;
    else if (fr < 290) k = 1;
    else k = 1 - (fr - 290) / 40;
    k = clamp01(k);

    const x0 = 30;
    const bw = w - 60;
    const top = 24;
    const bh = h - 58;
    const total = items.reduce((a, x) => a + x.weight, 0);

    roundRect(ctx, x0, top, bw, bh, 12);
    ctx.fillStyle = c.canvas;
    ctx.fill();
    ctx.strokeStyle = alpha(c.fg3, 0.25);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 上限标注画在盒子**里面**，画在外面会被画布边缘裁掉
    const capY = top + 10;
    text(ctx, capLabel, x0 + 16, capY + 1, TAG, c.warn, "left", 0.85);

    let cursor = 0;
    const grown = total * k;
    items.forEach((it, i) => {
      const from = cursor;
      const to = cursor + it.weight;
      cursor = to;
      if (grown <= from) return;
      const shown = Math.min(grown, to) - from;
      const y = capY + 26 + (from / total) * (bh - 48);
      const hh = (shown / total) * (bh - 48);
      const over = to / total > 1;
      roundRect(ctx, x0 + 10, y, bw - 20, Math.max(hh - 4, 1), 7);
      ctx.fillStyle = alpha(i === items.length - 1 ? c.warn : c.accent, 0.24);
      ctx.fill();
      ctx.strokeStyle = alpha(i === items.length - 1 ? c.warn : c.accent, 0.5);
      ctx.lineWidth = 1;
      ctx.stroke();
      if (hh > 15)
        text(
          ctx,
          it.label,
          x0 + 24,
          y + hh / 2 - 2,
          `600 13px ${FONT}`,
          over ? c.warn : c.fg,
          "left",
          clamp01((grown - from) / 8),
        );
    });

    // 溢出提示
    if (grown > total * 0.985 && overLabel) {
      const pulse = 0.6 + 0.4 * Math.sin(fr * 0.12);
      text(ctx, overLabel, x0 + bw / 2, top + bh + 22, SMALL, c.warn, "center", pulse);
    }
  };

  return (
    <Figure
      height={200}
      label={`组成示意：${items.map((i) => i.label).join("、")}`}
      caption={caption}
      sketch={sketch}
    />
  );
}

/* ════════════════════════════════════════════════════════════════
   5. 循环图：一个环，光点绕一圈依次点亮各步
   用于「一遍一遍地做」这类循环过程
   ════════════════════════════════════════════════════════════════ */
export function CycleAnim({
  steps,
  center,
  caption,
}: {
  steps: string[];
  center?: string;
  caption?: string;
}) {
  const sketch: Sketch = (ctx, t, w, h) => {
    const c = readTheme();
    const n = steps.length;
    const per = 54;
    const period = per * n;
    const fr = Math.round(t * 60) % period;
    const idx = Math.floor(fr / per);
    const local = (fr % per) / per;

    const cx = w / 2;
    const cy = h / 2;
    // 用椭圆环：画布很宽很矮，正圆会浪费两侧、标签还会互相挤
    const rx = Math.min(w * 0.3, 320);
    const ry = Math.min(h * 0.29, 92);

    ctx.strokeStyle = alpha(c.fg3, 0.2);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 已走过的弧
    const a0 = -Math.PI / 2;
    const sweep = ((idx + local) / n) * Math.PI * 2;
    ctx.strokeStyle = alpha(c.accent, 0.75);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, a0, a0 + sweep);
    ctx.stroke();

    for (let i = 0; i < n; i += 1) {
      const ang = a0 + (i / n) * Math.PI * 2;
      const x = cx + Math.cos(ang) * rx;
      const y = cy + Math.sin(ang) * ry;
      const on = i < idx || (i === idx && local > 0.4);
      const now = i === idx;
      const sc = now ? 1 + 0.18 * Math.sin(local * Math.PI) : 1;

      ctx.beginPath();
      ctx.arc(x, y, 5.5 * sc, 0, Math.PI * 2);
      ctx.fillStyle = on ? c.accent : c.canvas;
      ctx.fill();
      ctx.strokeStyle = on ? c.accent : alpha(c.fg3, 0.4);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 标签放在环外侧，并夹在画布内，避免被裁掉或互相压住
      const rawX = cx + Math.cos(ang) * rx * 1.22;
      const rawY = cy + Math.sin(ang) * (ry + 32);
      const lx = Math.max(62, Math.min(w - 62, rawX));
      const ly = Math.max(15, Math.min(h - 13, rawY));
      text(ctx, steps[i], lx, ly, SMALL, on ? c.fg : c.fg3, "center", on ? 1 : 0.6);
    }

    // 光点
    const pa = a0 + ((idx + easeInOutCubic(local)) / n) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(pa) * rx, cy + Math.sin(pa) * ry, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = c.accent;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (center) text(ctx, center, cx, cy, TAG, c.fg2);
  };

  return (
    <Figure
      height={230}
      label={`循环示意：${steps.join(" → ")}`}
      caption={caption}
      sketch={sketch}
    />
  );
}

/* ════════════════════════════════════════════════════════════════
   说明：所有原件的 sketch 都在组件体内内联创建。
   AnimStage 把 sketch 存在 ref 里、effect 只依赖 height，
   所以内联创建不会导致动画被重置。
   ════════════════════════════════════════════════════════════════ */
