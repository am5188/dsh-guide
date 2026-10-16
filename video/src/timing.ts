import narration from "./narration.json";

export const FPS = 30;

/** 每镜头在旁白之后留的停顿（秒），避免句与句之间太赶 */
const TAIL_SECONDS = 0.45;
/** 镜头最短时长（帧） */
const MIN_FRAMES = 70;

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

/**
 * 镜头边界完全由旁白实际时长推导 —— 改旁白只要重跑 scripts/tts.mjs，
 * 合成会自动跟着变，不需要手改数字。
 */
export const shots: Shot[] = (() => {
  let cursor = 0;
  return narration.lines.map((line, index) => {
    const durationInFrames = Math.max(
      Math.round((line.seconds + TAIL_SECONDS) * FPS),
      MIN_FRAMES,
    );
    const from = cursor;
    cursor += durationInFrames;
    return {
      id: line.id,
      index,
      from,
      durationInFrames,
      audio: `audio/${line.file}`,
      seconds: line.seconds,
      text: line.text,
    };
  });
})();

export const TOTAL_FRAMES = shots.reduce((a, s) => a + s.durationInFrames, 0);

/** 第 i 个镜头内部的第 p 帧（绝对帧） */
export const at = (index: number, progress = 0): number => {
  const shot = shots[Math.min(Math.max(index, 0), shots.length - 1)];
  return shot.from + progress * shot.durationInFrames;
};

/** 某个绝对帧落在第几个镜头里 */
export function shotAt(frame: number): { index: number; local: number; shot: Shot } {
  for (let i = shots.length - 1; i >= 0; i -= 1) {
    if (frame >= shots[i].from) {
      return { index: i, local: frame - shots[i].from, shot: shots[i] };
    }
  }
  return { index: 0, local: frame, shot: shots[0] };
}
