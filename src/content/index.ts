import type { UnitContent } from "./types";
import u01 from "./units/01";
import u02 from "./units/02";
import u03 from "./units/03";
import u04 from "./units/04";
import u05 from "./units/05";
import u06 from "./units/06";
import u07 from "./units/07";
import u08 from "./units/08";
import u09 from "./units/09";
import u10 from "./units/10";
import u11 from "./units/11";
import u12 from "./units/12";
import u13 from "./units/13";
import u14 from "./units/14";
import u15 from "./units/15";
import u16 from "./units/16";
import u17 from "./units/17";
import u18 from "./units/18";
import u19 from "./units/19";
import u20 from "./units/20";
import u21 from "./units/21";
import u22 from "./units/22";
import u23 from "./units/23";

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
  5: u05,
  6: u06,
  7: u07,
  8: u08,
  9: u09,
  10: u10,
  11: u11,
  12: u12,
  13: u13,
  14: u14,
  15: u15,
  16: u16,
  17: u17,
  18: u18,
  19: u19,
  20: u20,
  21: u21,
  22: u22,
  23: u23,
};
