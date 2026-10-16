import narration from "./narration.json";

export const FPS = 30;

/** 每镜头在旁白之后留的停顿（秒），避免句与句之间太赶 */
const TAIL_SECONDS = 0.45;
/** 镜头最短时长（帧） */
const MIN_FRAMES = 70;

/**
 * 个别镜头额外加长（帧）。
 * 调研指出：全片镜头长度如果完全均匀，会产生“等间隔软切”的节奏疲劳。
 * 至少要有**一个明显更长的镜头**让观众喘口气 —— 这里选在第 5 句
 * 「因为它碰不到你的电脑」这个结论处，加长到约 6.2 秒。
 */
const EXTRA_HOLD: Record<number, number> = { 4: 100 };

/**
 * 插入镜头（帧）。
 * 全片都是“元素缓入缓出”的软性过渡，缺真正的硬切做节奏锚点。
 * 插入镜头用**全屏特写**实现：画面突然切到一个细节，约 1 秒后切回来。
 * 这就是硬切，而且不占旁白时间（旁白只在 shot 段里播）。
 */
export type InsertId = "wall-detail" | "files-detail";

const INSERTS: { afterShot: number; id: InsertId; durationInFrames: number }[] = [
  { afterShot: 5, id: "wall-detail", durationInFrames: 34 }, // ≈1.13s
  { afterShot: 9, id: "files-detail", durationInFrames: 30 }, // ≈1.0s
];

/**
 * 结尾的静默停留（帧）。
 * 旁白说完之后不要让画面立刻结束 —— 给它 2.5 秒把最后一帧留在观众眼前，
 * 而且画面全程仍在运动（不是淡到黑）。
 */
const END_HOLD_FRAMES = 75;

export type Shot = {
  id: string;
  index: number;
  /** 起始帧 */
  from: number;
  durationInFrames: number;
  /** 该镜头的旁白文件（public 下相对路径） */
  audio: string;
  seconds: number;
  text: string;
};

export type Segment =
  | ({ kind: "shot" } & Shot)
  | {
      kind: "insert";
      id: InsertId;
      from: number;
      durationInFrames: number;
    };

/**
 * 时间轴由旁白实际时长推导，再按 EXTRA_HOLD 与 INSERTS 排布。
 * 改旁白只要重跑 scripts/tts.mjs，整条时间轴自动跟着变。
 */
const built = (() => {
  let cursor = 0;
  const shots: Shot[] = [];
  const segments: Segment[] = [];

  narration.lines.forEach((line, index) => {
    const base = Math.max(
      Math.round((line.seconds + TAIL_SECONDS) * FPS),
      MIN_FRAMES,
    );
    const durationInFrames = base + (EXTRA_HOLD[index] ?? 0);
    const shot: Shot = {
      id: line.id,
      index,
      from: cursor,
      durationInFrames,
      audio: `audio/${line.file}`,
      seconds: line.seconds,
      text: line.text,
    };
    shots.push(shot);
    segments.push({ kind: "shot", ...shot });
    cursor += durationInFrames;

    const insert = INSERTS.find((x) => x.afterShot === index);
    if (insert) {
      segments.push({
        kind: "insert",
        id: insert.id,
        from: cursor,
        durationInFrames: insert.durationInFrames,
      });
      cursor += insert.durationInFrames;
    }
  });

  return { shots, segments, end: cursor };
})();

export const shots = built.shots;
export const segments = built.segments;
export const TOTAL_FRAMES = built.end + END_HOLD_FRAMES;

/** 第 i 个镜头内部的第 p 帧（绝对帧） */
export const at = (index: number, progress = 0): number => {
  const shot = shots[Math.min(Math.max(index, 0), shots.length - 1)];
  return shot.from + progress * shot.durationInFrames;
};

/** 某个绝对帧落在哪一段（镜头或插入镜头） */
export function segmentAt(frame: number): Segment {
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    if (frame >= segments[i].from) return segments[i];
  }
  return segments[0];
}

/** 某个绝对帧落在第几个镜头里（插入镜头归到它前面的那个镜头） */
export function shotAt(frame: number): {
  index: number;
  local: number;
  shot: Shot;
} {
  for (let i = shots.length - 1; i >= 0; i -= 1) {
    if (frame >= shots[i].from) {
      return { index: i, local: frame - shots[i].from, shot: shots[i] };
    }
  }
  return { index: 0, local: frame, shot: shots[0] };
}
