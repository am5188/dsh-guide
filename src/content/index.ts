import type { UnitContent } from "./types";
import u01 from "./units/01";
import u02 from "./units/02";
import u03 from "./units/03";
import u04 from "./units/04";

export type { UnitContent, CommandSpec } from "./types";

/**
 * 每节一个文件（src/content/units/NN.tsx），方便并行写稿、互不冲突。
 * 没登记的节会走 UnitPage 里的占位分支。
 */
export const unitContent: Record<number, UnitContent> = {
  1: u01,
  2: u02,
  3: u03,
  4: u04,
};
