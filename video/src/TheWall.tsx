import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FONT =
  '-apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif';
const MONO = '"Cascadia Code", Consolas, monospace';

const C = {
  bg: "#151517",
  surface: "#232324",
  raised: "#2c2c2e",
  fg: "#f9fafb",
  fg2: "#cfd3d6",
  fg3: "#adb2b8",
  line: "rgba(255,255,255,0.12)",
  line2: "rgba(255,255,255,0.20)",
  accent: "#7aaaff",
  accentSoft: "rgba(122,170,255,0.14)",
  warn: "#f7ad31",
  ok: "#4ed17e",
};

/* ── 场景边界（30fps，由旁白实际时长推导）──────────────────── */
const FPS = 30;
const S1 = { from: 0, dur: 319 };
const S2 = { from: 319, dur: 386 };
const S3 = { from: 705, dur: 234 };
const S4 = { from: 939, dur: 516 };
export const THE_WALL_DURATION = S4.from + S4.dur; // 1455 帧 ≈ 48.5 秒

/* ── 小工具 ──────────────────────────────────────────────── */
const Fade: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [18, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Caption: React.FC<{ text: string; delay?: number; accent?: string }> = ({
  text,
  delay = 8,
  accent,
}) => (
  <Fade
    delay={delay}
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 92,
      textAlign: "center",
    }}
  >
    <span
      style={{
        fontFamily: FONT,
        fontSize: 40,
        lineHeight: 1.5,
        color: accent ?? C.fg2,
        letterSpacing: "0.01em",
      }}
    >
      {text}
    </span>
  </Fade>
);

const ModelBox: React.FC<{ label?: string; sub?: string; dim?: boolean }> = ({
  label = "模型",
  sub = "只会想 · 只会说",
  dim,
}) => (
  <div
    style={{
      width: 300,
      padding: "28px 0",
      borderRadius: 20,
      background: dim ? C.surface : C.accentSoft,
      border: `1px solid ${dim ? C.line : "rgba(122,170,255,0.35)"}`,
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontFamily: FONT,
        fontSize: 34,
        fontWeight: 600,
        color: dim ? C.fg2 : C.accent,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: FONT,
        fontSize: 20,
        color: C.fg3,
        marginTop: 10,
      }}
    >
      {sub}
    </div>
  </div>
);

const FileChip: React.FC<{
  text: string;
  on: boolean;
  delay: number;
}> = ({ text, on, delay }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        padding: "16px 26px",
        borderRadius: 14,
        background: on ? "rgba(78,209,126,0.14)" : C.surface,
        border: `1px solid ${on ? "rgba(78,209,126,0.45)" : C.line}`,
        fontFamily: FONT,
        fontSize: 24,
        color: on ? C.ok : C.fg3,
        opacity: on ? t : 1,
      }}
    >
      {text}
    </div>
  );
};

/* ── 场景 1：它只会说 ─────────────────────────────────────── */
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const tokens = ["给", "它", "文", "字", "，", "它", "接", "着", "写"];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* 文字流：你给它文字，它接着写 */}
      <div style={{ display: "flex", gap: 14, marginBottom: 26 }}>
        {tokens.map((t, i) => (
          <span
            key={`${t}-${i}`}
            style={{
              fontFamily: FONT,
              fontSize: 64,
              color: C.fg,
              opacity: interpolate(frame, [12 + i * 5, 24 + i * 5], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 40, color: C.fg3, marginBottom: 60 }}>↓</div>

      <Fade delay={40} style={{ transform: "scale(1.25)" }}>
        <ModelBox />
      </Fade>

      <Caption text="它写得又快又好" />
    </AbsoluteFill>
  );
};

/* ── 场景 2：但它碰不到你的电脑 ───────────────────────────── */
const Scene2: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <Fade delay={2}>
      <div
        style={{
          padding: "22px 34px",
          borderRadius: 18,
          background: C.raised,
          border: `1px solid ${C.line2}`,
          fontFamily: FONT,
          fontSize: 30,
          color: C.fg,
          marginBottom: 40,
        }}
      >
        帮我把 D:\发票 里的 PDF 按月份重命名
      </div>
    </Fade>

    <div style={{ fontSize: 32, color: C.fg3, marginBottom: 36 }}>↓</div>

    <Fade delay={16}>
      <ModelBox />
    </Fade>

    <div style={{ fontSize: 32, color: C.fg3, margin: "36px 0" }}>↓</div>

    <Fade delay={44}>
      <div
        style={{
          width: 720,
          padding: "24px 30px",
          borderRadius: 16,
          background: C.surface,
          border: `1px solid ${C.line}`,
          fontFamily: FONT,
        }}
      >
        <div style={{ fontSize: 19, color: C.fg3, marginBottom: 12 }}>
          它给你的
        </div>
        <div style={{ fontSize: 24, color: C.fg2, lineHeight: 1.7 }}>
          你可以这样操作：先打开文件夹，按月份新建子目录，
          然后逐个选中文件重命名……
        </div>
      </div>
    </Fade>

    <Caption text="它只能给你一段说明，因为它碰不到你的电脑" />
  </AbsoluteFill>
);

/* ── 场景 3：中间那道墙 ───────────────────────────────────── */
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const wallProgress = interpolate(frame, [14, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 气泡撞墙后弹回
  const bounce = interpolate(
    frame % 70,
    [0, 24, 34, 70],
    [0, 250, 190, 250],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          width: "100%",
        }}
      >
        {/* 左：模型 */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ position: "relative" }}>
            <ModelBox />
            <div
              style={{
                position: "absolute",
                top: -66,
                left: bounce,
                padding: "10px 18px",
                borderRadius: 999,
                background: C.raised,
                border: `1px solid ${C.line2}`,
                fontFamily: FONT,
                fontSize: 20,
                color: C.fg2,
                whiteSpace: "nowrap",
              }}
            >
              我去看看你的 D 盘
            </div>
          </div>
        </div>

        {/* 中：墙 */}
        <div
          style={{
            width: 180,
            display: "flex",
            justifyContent: "center",
            opacity: wallProgress,
          }}
        >
          <div
            style={{
              width: 3,
              height: 420 * wallProgress,
              background: C.warn,
              borderRadius: 3,
              boxShadow: `0 0 40px rgba(247,173,49,${0.5 * wallProgress})`,
            }}
          />
        </div>

        {/* 右：真实世界 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "flex-start",
            opacity: interpolate(frame, [46, 70], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <FileChip text="D:\发票" on={false} delay={60} />
          <FileChip text="你的 Excel" on={false} delay={66} />
          <FileChip text="你的邮箱" on={false} delay={72} />
        </div>
      </div>

      <Caption text="模型和你的电脑之间，隔着一道它自己过不去的墙" accent={C.warn} />
    </AbsoluteFill>
  );
};

/* ── 场景 4：墙外有人 ─────────────────────────────────────── */
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const bandIn = spring({ frame: frame - 20, fps: FPS, config: { damping: 200 } });
  const opened = interpolate(frame, [26, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Fade delay={4}>
            <ModelBox />
          </Fade>
        </div>

        {/* 中间：Harness 那一层 */}
        <div
          style={{
            width: 260,
            display: "flex",
            justifyContent: "center",
            transform: `scale(${interpolate(bandIn, [0, 1], [0.8, 1])})`,
            opacity: bandIn,
          }}
        >
          <div
            style={{
              width: 8,
              height: 460,
              borderRadius: 8,
              background: `linear-gradient(180deg, ${C.accent}, rgba(122,170,255,0.35))`,
              boxShadow: `0 0 60px rgba(122,170,255,${0.45 * opened})`,
            }}
          />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <FileChip text="D:\发票" on delay={54} />
          <FileChip text="你的 Excel" on delay={60} />
          <FileChip text="你的邮箱" on delay={66} />
        </div>
      </div>

      {/* Harness 标签 */}
      <Fade
        delay={24}
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "18px 36px",
            borderRadius: 18,
            background: C.accentSoft,
            border: "1px solid rgba(122,170,255,0.4)",
            fontFamily: FONT,
          }}
        >
          <span style={{ fontSize: 34, fontWeight: 600, color: C.accent }}>
            DeepSeek Harness
          </span>
          <span style={{ fontSize: 24, color: C.fg2, marginLeft: 20 }}>
            替它记 · 替它动手 · 替它把关
          </span>
        </div>
      </Fade>

      <Caption
        text="模型负责想，它负责让「想」真的发生"
        delay={70}
        accent={C.accent}
      />
    </AbsoluteFill>
  );
};

/* ── 主合成 ───────────────────────────────────────────────── */
export const TheWall: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      {/* 轻微的背景光晕 */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(900px 500px at 50% 0%, rgba(122,170,255,0.10), transparent 70%)",
        }}
      />

      <Sequence from={S1.from} durationInFrames={S1.dur}>
        <Scene1 />
      </Sequence>
      <Sequence from={S2.from} durationInFrames={S2.dur}>
        <Scene2 />
      </Sequence>
      <Sequence from={S3.from} durationInFrames={S3.dur}>
        <Scene3 />
      </Sequence>
      <Sequence from={S4.from} durationInFrames={S4.dur}>
        <Scene4 />
      </Sequence>

      {/* 旁白 */}
      <Sequence from={S1.from}>
        <Audio src={staticFile("audio/model.wav")} />
      </Sequence>
      <Sequence from={S2.from}>
        <Audio src={staticFile("audio/cannot.wav")} />
      </Sequence>
      <Sequence from={S3.from}>
        <Audio src={staticFile("audio/wall.wav")} />
      </Sequence>
      <Sequence from={S4.from}>
        <Audio src={staticFile("audio/harness.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
