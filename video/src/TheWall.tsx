import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { at, shots, shotAt, TOTAL_FRAMES, FPS } from "./timing";

/* ════════════════════════════════════════════════════════════════
   配色：只用 5 个色。避免「深蓝底 + 霓虹渐变」这个业余签名。
   ════════════════════════════════════════════════════════════════ */
const C = {
  bg: "#151517", // 石墨黑，底（60%）
  surface: "#2c2c2e", // 中性面（30%）
  line: "rgba(255,255,255,0.14)",
  text: "#f9fafb",
  text2: "#cfd3d6",
  text3: "#adb2b8",
  accent: "#7aaaff", // 主强调：模型 / Harness
  warn: "#f7ad31", // 只用于「那道墙」
  ok: "#4ed17e", // 只在最后一步表示「通了」
};

/* ── 缓动：取自 Material 3 的真实 motion token 值 ─────────────── */
const EASE = {
  decel: Easing.bezier(0.05, 0.7, 0.1, 1), // 入场
  accel: Easing.bezier(0.3, 0, 0.8, 0.15), // 出场
  emph: Easing.bezier(0.2, 0, 0, 1), // 通用移动
  legacy: Easing.bezier(0.4, 0, 0.2, 1),
};

/* ── 关键帧轨道：让同一物体全程连续运动，而不是消失再出现 ─────── */
type Key = { at: number; v: number };

function track(frame: number, keys: Key[], easing = EASE.emph): number {
  if (keys.length === 0) return 0;
  if (frame <= keys[0].at) return keys[0].v;
  const last = keys[keys.length - 1];
  if (frame >= last.at) return last.v;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame >= a.at && frame <= b.at) {
      const span = Math.max(1, b.at - a.at);
      const t = (frame - a.at) / span;
      return interpolate(easing(t), [0, 1], [a.v, b.v]);
    }
  }
  return last.v;
}

const FONT =
  '-apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif';

/* ════════════════════════════════════════════════════════════════
   质感层
   ════════════════════════════════════════════════════════════════ */

/** 胶片颗粒（每帧轻微偏移，避免死板） */
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const dx = ((frame * 37) % 13) - 6;
  const dy = ((frame * 53) % 11) - 5;
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%" style={{ transform: `translate(${dx}px,${dy}px)` }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** 暗角 */
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse 78% 68% at 50% 48%, transparent 40%, rgba(0,0,0,0.28) 78%, rgba(0,0,0,0.5) 100%)",
    }}
  />
);

/** 缓慢扫过的高光，给画面一点「活」的痕迹 */
const LightSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const x = interpolate(frame, [0, durationInFrames], [-30, 130], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.05 }}>
      <div
        style={{
          position: "absolute",
          top: "-30%",
          bottom: "-30%",
          left: `${x}%`,
          width: "26%",
          transform: "rotate(14deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};

/** 背景层：渐变 + 缓慢漂浮的粒子（视差 0.2） */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 26 }, (_, i) => {
    const seed = i * 137.5;
    const bx = (seed * 7.3) % 100;
    const by = (seed * 3.1) % 100;
    const speed = 0.15 + ((i % 5) * 0.06);
    const y = (by + frame * speed * 0.045) % 110 - 5;
    const x = bx + Math.sin((frame / 90) * (1 + (i % 3) * 0.3) + i) * 3.5;
    const size = 2 + (i % 4) * 1.6;
    const opacity = 0.10 + (i % 5) * 0.045;
    return { x, y, size, opacity, key: i };
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 620px at 42% 38%, #1d1e21 0%, ${C.bg} 62%, #0f0f11 100%)`,
        }}
      />
      {particles.map((p) => (
        <div
          key={p.key}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: C.text,
            opacity: p.opacity,
            filter: "blur(0.6px)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/* ════════════════════════════════════════════════════════════════
   贯穿全片的物体（放在所有 Sequence 之外，永不重新挂载）
   ════════════════════════════════════════════════════════════════ */

/** 「模型」光点 */
const Dot: React.FC<{ frame: number }> = ({ frame }) => {
  const x = track(frame, [
    { at: at(0, 0), v: 980 },
    { at: at(1, 0.4), v: 760 },
    { at: at(3, 1), v: 700 },
    { at: at(5, 1), v: 600 },
    { at: at(6, 0.32), v: 968 },
    { at: at(6, 0.62), v: 812 },
    { at: at(9, 1), v: 600 },
    { at: at(10, 0.42), v: 1520 },
  ]);
  const y = track(frame, [
    { at: at(0, 0), v: 560 },
    { at: at(6, 0.32), v: 540 },
    { at: at(6, 0.5), v: 592 },
    { at: at(6, 0.75), v: 548 },
    { at: at(10, 0.5), v: 536 },
  ]);
  const scale = track(frame, [
    { at: at(0, 0), v: 0.6 },
    { at: at(0, 0.5), v: 1 },
    { at: at(6, 0.32), v: 1.12 },
    { at: at(6, 0.55), v: 0.88 },
    { at: at(6, 0.85), v: 1 },
    { at: at(10, 0.5), v: 1.06 },
  ]);
  const appear = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.decel,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity: appear,
      }}
    >
      {/* 外层光晕（双层辉光：致密亮核 + 宽淡光晕） */}
      <div
        style={{
          position: "absolute",
          left: -120,
          top: -120,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accent}44 0%, transparent 68%)`,
          transform: `scale(${scale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -30,
          top: -30,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: `radial-gradient(circle, #ffffff 0%, ${C.accent} 55%, transparent 100%)`,
          transform: `scale(${scale})`,
          boxShadow: `0 0 60px ${C.accent}aa`,
        }}
      />
      {/* 标签 */}
      <div
        style={{
          position: "absolute",
          left: -60,
          top: 62,
          width: 120,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 26,
          color: C.accent,
          letterSpacing: "0.08em",
        }}
      >
        模型
      </div>
    </div>
  );
};

/** 「那道墙」—— 全片同一个物体，从无到有、最后裂开 */
const Wall: React.FC<{ frame: number }> = ({ frame }) => {
  const height = track(frame, [
    { at: at(5, 0.05), v: 0 },
    { at: at(5, 0.75), v: 660 },
  ]);
  const opacity = track(frame, [
    { at: at(5, 0.05), v: 0 },
    { at: at(5, 0.35), v: 1 },
    { at: at(7, 0.1), v: 1 },
    { at: at(7, 0.75), v: 0.2 },
    { at: at(10, 0.3), v: 0.2 },
    { at: at(10, 0.62), v: 0 },
  ]);
  // 裂开：0 = 完整，1 = 完全打开
  const gap = track(frame, [
    { at: at(10, 0.18), v: 0 },
    { at: at(10, 0.6), v: 1 },
  ]);

  const half = (height * (1 - gap)) / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: 1080,
        top: "50%",
        width: 0,
        height: 0,
        opacity,
      }}
    >
      {[
        { sign: -1 },
        { sign: 1 },
      ].map((part) => (
        <div
          key={part.sign}
          style={{
            position: "absolute",
            left: -9,
            top: part.sign < 0 ? -half : 0,
            width: 18,
            height: half,
            // 上段：顶端淡出 → 中缝最亮；下段：中缝最亮 → 底端淡出。
            // 两段在中间严格接上，不能各用一条对称渐变（那会在正中间留一道假裂缝）。
            background:
              part.sign < 0
                ? `linear-gradient(180deg, ${C.warn}00, ${C.warn}cc 55%, ${C.warn})`
                : `linear-gradient(180deg, ${C.warn}, ${C.warn}cc 45%, ${C.warn}00)`,
            boxShadow: `0 0 54px ${C.warn}88, 0 0 140px ${C.warn}33`,
          }}
        />
      ))}

      {/* 墙上方的标签，只在墙没裂开时出现 */}
      {height > 40 && gap < 0.5 && (
        <div
          style={{
            position: "absolute",
            left: -70,
            top: -height / 2 - 62,
            width: 140,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 24,
            color: C.warn,
            opacity: 1 - gap * 2,
          }}
        >
          它过不去
        </div>
      )}
    </div>
  );
};

/** 「Harness」那一层 —— 第 7 个镜头之后出现在墙的位置 */
const Band: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = track(frame, [
    { at: at(7, 0.05), v: 0 },
    { at: at(7, 0.7), v: 1 },
  ]);
  const scale = track(frame, [
    { at: at(7, 0.05), v: 0.82 },
    { at: at(7, 0.8), v: 1 },
  ]);
  const chipOn = track(frame, [
    { at: at(8, 0.1), v: 0 },
    { at: at(8, 0.85), v: 1 },
  ]);

  const chips = ["替它记", "替它动手", "替它把关"];

  return (
    <div
      style={{
        position: "absolute",
        left: 1080,
        top: "50%",
        width: 0,
        height: 0,
        opacity: appear,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -7,
          top: -330,
          width: 14,
          height: 660,
          borderRadius: 8,
          background: `linear-gradient(180deg, ${C.accent}00, ${C.accent}, ${C.accent}00)`,
          boxShadow: `0 0 70px ${C.accent}77`,
        }}
      />

      {chips.map((c, i) => {
        const t = interpolate(chipOn, [i * 0.22, i * 0.22 + 0.34], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: -318,
              top: -230 + i * 96,
              padding: "14px 22px",
              borderRadius: 12,
              background: `rgba(122,170,255,${0.10 * t})`,
              border: `1px solid rgba(122,170,255,${0.42 * t})`,
              fontFamily: FONT,
              fontSize: 24,
              color: C.accent,
              opacity: t,
              transform: `translateX(${interpolate(t, [0, 1], [-16, 0])}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {c}
          </div>
        );
      })}
    </div>
  );
};

/** 目标文件（模型够不到的东西） */
const Files: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = track(frame, [
    { at: at(4, 0.1), v: 0 },
    { at: at(4, 0.8), v: 1 },
  ]);
  const lit = track(frame, [
    { at: at(10, 0.45), v: 0 },
    { at: at(10, 0.85), v: 1 },
  ]);
  const items = ["D:\\发票", "你的 Excel", "你的邮箱"];

  return (
    <div
      style={{
        position: "absolute",
        left: 1330,
        top: "50%",
        opacity: appear,
      }}
    >
      {items.map((t, i) => (
        <div
          key={t}
          style={{
            position: "absolute",
            left: 0,
            top: -150 + i * 96,
            padding: "18px 26px",
            borderRadius: 14,
            background: `color-mix(in srgb, ${C.ok} ${lit * 14}%, ${C.surface})`,
            border: `1px solid ${lit > 0.5 ? "rgba(78,209,126,0.5)" : C.line}`,
            fontFamily: FONT,
            fontSize: 25,
            color: lit > 0.5 ? C.ok : C.text3,
            whiteSpace: "nowrap",
          }}
        >
          {t}
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   分镜内容（每镜头只在需要时出现的新元素）
   ════════════════════════════════════════════════════════════════ */

const Caption: React.FC<{ text: string; accent?: string }> = ({ text, accent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inn = interpolate(frame, [6, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.decel,
  });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames - 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 86,
        textAlign: "center",
        opacity: inn * out,
        transform: `translateY(${interpolate(inn, [0, 1], [14, 0])}px)`,
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 38,
          lineHeight: 1.5,
          color: accent ?? C.text2,
        }}
      >
        {text}
      </span>
    </div>
  );
};

/** 镜头 1：文字流进、文字流出 */
const Shot2: React.FC = () => {
  const frame = useCurrentFrame();
  const tokens = ["你", "给", "它", "文", "字", "，", "它", "接", "着", "写"];
  const outTokens = ["写", "得", "又", "快", "又", "好"];
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 500, display: "flex", gap: 10 }}>
        {tokens.map((t, i) => (
          <span
            key={`${t}${i}`}
            style={{
              fontFamily: FONT,
              fontSize: 46,
              color: C.text,
              // 错开 60ms（≈2 帧）—— 调研给的是 30–80ms
              opacity: interpolate(frame, [4 + i * 2, 16 + i * 2], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE.decel,
              }),
              transform: `translateY(${interpolate(
                frame,
                [4 + i * 2, 18 + i * 2],
                [18, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.decel },
              )}px)`,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div style={{ position: "absolute", left: 900, top: 500, display: "flex", gap: 10 }}>
        {outTokens.map((t, i) => (
          <span
            key={`${t}${i}`}
            style={{
              fontFamily: FONT,
              fontSize: 46,
              color: C.accent,
              opacity: interpolate(frame, [52 + i * 2, 64 + i * 2], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE.decel,
              }),
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </>
  );
};

/** 镜头 3：用户那句话 */
const Shot3: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [4, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.decel,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 210,
        top: 250,
        padding: "24px 34px",
        borderRadius: 18,
        background: C.surface,
        border: `1px solid ${C.line}`,
        opacity: t,
        transform: `translateY(${interpolate(t, [0, 1], [26, 0])}px) scale(${interpolate(
          t,
          [0, 1],
          [0.94, 1],
        )})`,
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: 19, color: C.text3, marginBottom: 10 }}>
        你
      </div>
      <div style={{ fontFamily: FONT, fontSize: 32, color: C.text }}>
        帮我把 D:\发票 里的 PDF 按月份重命名
      </div>
    </div>
  );
};

/** 镜头 4：它只能给出一段说明 */
const Shot4: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [2, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.decel,
  });
  const lines = ["先打开文件夹", "按月份新建子目录", "逐个选中文件重命名", "……"];
  return (
    <div
      style={{
        position: "absolute",
        left: 780,
        top: 300,
        width: 620,
        padding: "24px 30px",
        borderRadius: 16,
        background: C.surface,
        border: `1px solid ${C.line}`,
        opacity: t,
        transform: `scale(${interpolate(t, [0, 1], [0.96, 1])})`,
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: 19, color: C.text3, marginBottom: 14 }}>
        它给你的，只是一段说明
      </div>
      {lines.map((l, i) => (
        <div
          key={l}
          style={{
            fontFamily: FONT,
            fontSize: 26,
            color: C.text2,
            lineHeight: 1.75,
            // 逐行落位，间隔 100ms ≈ 3 帧
            opacity: interpolate(frame, [14 + i * 3, 28 + i * 3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
};

/** 镜头 7：撞墙 */
const Shot7: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const impact = interpolate(frame, [40, 46, 74, 92], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      {impact > 0.01 && (
        <>
          <div
            style={{
              position: "absolute",
              left: 940,
              top: 540,
              width: 300,
              height: 300,
              marginLeft: -150,
              marginTop: -150,
              borderRadius: "50%",
              border: `3px solid ${C.warn}`,
              opacity: impact * 0.9,
              transform: `scale(${interpolate(impact, [0, 1], [0.3, 1.5])})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 1040,
              top: 250,
              bottom: 250,
              width: 8,
              background: C.warn,
              opacity: impact,
              filter: "blur(12px)",
            }}
          />
        </>
      )}
      <Caption text={""} />
    </>
  );
};

/** 镜头 10：名字 */
const Shot10: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [4, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.decel,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 170,
        textAlign: "center",
        opacity: t,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "20px 40px",
          borderRadius: 20,
          background: `rgba(122,170,255,0.10)`,
          border: `1px solid rgba(122,170,255,0.42)`,
          transform: `scale(${interpolate(t, [0, 1], [0.9, 1])})`,
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: 52,
            fontWeight: 600,
            color: C.accent,
            letterSpacing: "0.01em",
          }}
        >
          DeepSeek Harness
        </span>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   镜头运动：每个镜头一次缓推/缓拉，且全程连续
   ════════════════════════════════════════════════════════════════ */
const CAM_SCALE: Key[] = [
  { at: at(0, 0), v: 1.0 },
  { at: at(0, 1), v: 1.06 },
  { at: at(4, 0), v: 1.0 },
  { at: at(5, 0), v: 1.0 },
  { at: at(5, 1), v: 0.93 },
  { at: at(6, 0.3), v: 1.02 },
  { at: at(6, 0.7), v: 1.1 },
  { at: at(7, 1), v: 1.02 },
  { at: at(9, 1), v: 1.0 },
  { at: at(10, 1), v: 1.09 },
];
const CAM_X: Key[] = [
  { at: at(0, 0), v: 0 },
  { at: at(1, 1), v: -20 },
  { at: at(5, 1), v: 20 },
  { at: at(7, 1), v: -10 },
  { at: at(10, 1), v: -46 },
];

const Camera: React.FC<{ frame: number; children: React.ReactNode }> = ({
  frame,
  children,
}) => {
  const scale = track(frame, CAM_SCALE, EASE.legacy);
  const x = track(frame, CAM_X, EASE.legacy);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translate(${x}px, 0px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ════════════════════════════════════════════════════════════════
   音效表：位移 → whoosh；撞击 → hit；文字 → tick；升级 → riser
   ════════════════════════════════════════════════════════════════ */
type Sfx = { at: number; src: string; volume: number };

const SFX: Sfx[] = [
  { at: at(0, 0), src: "sfx/whoosh.wav", volume: 0.5 },
  { at: at(1, 0), src: "sfx/whoosh.wav", volume: 0.32 },
  { at: at(1, 0.06), src: "sfx/tick.wav", volume: 0.28 },
  { at: at(1, 0.14), src: "sfx/tick.wav", volume: 0.24 },
  { at: at(1, 0.22), src: "sfx/tick.wav", volume: 0.22 },
  { at: at(2, 0.02), src: "sfx/whoosh.wav", volume: 0.36 },
  { at: at(3, 0.04), src: "sfx/switch.wav", volume: 0.3 },
  { at: at(4, 0.04), src: "sfx/whoosh.wav", volume: 0.3 },
  { at: at(5, 0.02), src: "sfx/hit.wav", volume: 0.5 },
  { at: at(5, 0.5), src: "sfx/whoosh.wav", volume: 0.28 },
  { at: at(6, 0.3), src: "sfx/whoosh.wav", volume: 0.5 },
  { at: at(6, 0.36), src: "sfx/hit.wav", volume: 0.62 },
  { at: at(7, 0.0), src: "sfx/riser.wav", volume: 0.4 },
  { at: at(7, 0.62), src: "sfx/ding.wav", volume: 0.34 },
  { at: at(8, 0.06), src: "sfx/tick.wav", volume: 0.3 },
  { at: at(8, 0.28), src: "sfx/tick.wav", volume: 0.3 },
  { at: at(8, 0.5), src: "sfx/tick.wav", volume: 0.3 },
  { at: at(9, 0.02), src: "sfx/whoosh.wav", volume: 0.36 },
  { at: at(9, 0.3), src: "sfx/ding.wav", volume: 0.3 },
  { at: at(10, 0.16), src: "sfx/riser.wav", volume: 0.34 },
  { at: at(10, 0.42), src: "sfx/whoosh.wav", volume: 0.44 },
  { at: at(10, 0.52), src: "sfx/ding.wav", volume: 0.3 },
];

/* ════════════════════════════════════════════════════════════════
   主合成
   ════════════════════════════════════════════════════════════════ */
const CAPTIONS: (string | null)[] = [
  null,
  null,
  null,
  null,
  "它碰不到你的电脑",
  null,
  null,
  null,
  null,
  null,
  null,
];

export const TheWall: React.FC = () => {
  const frame = useCurrentFrame();
  const { index } = shotAt(frame);

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      {/* ── 背景层（视差 0.2）────────────────────────────── */}
      <Backdrop />

      {/* ── 镜头运动包住中景与贯穿物体 ───────────────────── */}
      <Camera frame={frame}>
        <Dot frame={frame} />
        <Wall frame={frame} />
        <Band frame={frame} />
        <Files frame={frame} />

        {index === 1 && <Shot2 />}
        {index === 2 && <Shot3 />}
        {index === 3 && <Shot4 />}
        {index === 6 && <Shot7 />}
        {index === 9 && <Shot10 />}
      </Camera>

      {/* ── 每镜头字幕（淡入淡出，不做硬切）─────────────── */}
      <Sequence
        key={index}
        from={shots[index].from}
        durationInFrames={shots[index].durationInFrames}
      >
        {CAPTIONS[index] ? <Caption text={CAPTIONS[index] as string} /> : <></>}
      </Sequence>

      {/* ── 前景质感层 ───────────────────────────────────── */}
      <LightSweep />
      <Vignette />
      <Grain />

      {/* ── 声音 ─────────────────────────────────────────── */}
      <Audio src={staticFile("sfx/pad.wav")} volume={0.16} />
      {shots.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames}>
          <Audio src={staticFile(s.audio)} />
        </Sequence>
      ))}
      {SFX.map((s, i) => (
        <Sequence key={`${s.src}-${i}`} from={s.at}>
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const COMPOSITION = {
  durationInFrames: TOTAL_FRAMES,
  fps: FPS,
  width: 1920,
  height: 1080,
};
