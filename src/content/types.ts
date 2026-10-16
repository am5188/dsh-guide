import type { ReactNode } from "react";
import type { PlaygroundDemo } from "@/components/Playground";
import type { PythonDemo } from "@/components/PythonPlayground";

/** 一条可以直接复制去本地跑的 DSH 命令 */
export type CommandSpec = {
  /** 这条命令解决什么 */
  title: string;
  /** 命令行内容 */
  cmd: string;
  /** 跑完你应该看到什么 */
  expect: string;
  /** 补充说明（可选） */
  note?: string;
};

/**
 * 每个知识单元固定三段。
 * 第 3 段可以是「浏览器里真实调用」（demos），也可以是「本地 DSH 命令」（commands），
 * 两者可以同时出现。
 */
export type UnitContent = {
  /** 🎬 先看一眼 —— 该段小标题，不给就用默认 */
  animTitle?: string;
  /** 🎬 先看一眼 */
  anim?: ReactNode;
  /** 📐 到底怎么回事 */
  theory?: ReactNode;
  /** ⌨️ 引导文字 */
  practiceIntro?: ReactNode;
  /** ⌨️ 浏览器内真实调用 DeepSeek */
  demos?: PlaygroundDemo[];
  /**
   * ⌨️ 原理演示：真正的 Python 代码，浏览器里用 Pyodide 执行。
   * 代码里可以直接用 DSH_API_KEY 变量。
   */
  python?: {
    intro?: ReactNode;
    demos: PythonDemo[];
  };
  /** ⌨️ 本地 DSH 命令 */
  commands?: CommandSpec[];
};
