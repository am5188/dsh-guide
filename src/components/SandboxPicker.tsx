"use client";

import { useState } from "react";

type Tier = {
  id: string;
  name: string;
  key: string;
  summary: string;
  can: string[];
  cannot: string[];
};

const TIERS: Tier[] = [
  {
    id: "read-only",
    name: "只读",
    key: "read-only",
    summary: "什么都不能改。适合「只想让它读一读、告诉我结论」的场合。",
    can: ["读文件、列目录", "搜索内容", "给你结论和建议"],
    cannot: ["写、改、删、重命名任何文件", "执行会改动系统的命令"],
  },
  {
    id: "workspace-write",
    name: "限定工作区",
    key: "workspace-write",
    summary: "只能改你当前这个文件夹里的东西，出了这个范围就动不了。日常最常用。",
    can: ["读文件、列目录", "在指定文件夹里新建、修改、删除", "生成文档并保存"],
    cannot: ["碰到工作区之外的任何路径", "改动系统目录"],
  },
  {
    id: "danger-full-access",
    name: "全开",
    key: "danger-full-access",
    summary: "没有围栏。它想动哪里就动哪里。除非你非常清楚在做什么，否则别开。",
    can: ["访问整台电脑上的任何路径", "执行任何命令", "读写系统配置"],
    cannot: ["（没有任何技术限制拦着它）"],
  },
];

export function SandboxPicker() {
  const [activeId, setActiveId] = useState(TIERS[1].id);
  const active = TIERS.find((t) => t.id === activeId) ?? TIERS[0];

  return (
    <div className="my-9 rounded-lg bg-surface p-6">
      <div className="text-caption text-fg-3">点一下切换，看每档分别允许什么</div>

      <div className="mt-3 inline-flex flex-wrap gap-1 rounded-sm bg-sunken p-1">
        {TIERS.map((t) => {
          const on = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              aria-pressed={on}
              className={
                on
                  ? "elev-panel rounded-xs bg-raised px-4 py-2 text-meta font-medium text-fg"
                  : "rounded-xs px-4 py-2 text-meta text-fg-2 transition-colors duration-150 hover:text-fg"
              }
            >
              {t.name}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-meta leading-relaxed text-fg-2">
        {active.summary}
        <span className="ml-2 font-mono text-caption text-fg-3">
          {active.key}
        </span>
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md bg-canvas p-5">
          <div className="flex items-center gap-2 text-meta font-semibold">
            <span className="size-1.5 rounded-full bg-ok-500" aria-hidden="true" />
            这一档允许
          </div>
          <ul className="mt-3 space-y-2 text-meta text-fg-2">
            {active.can.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md bg-canvas p-5">
          <div className="flex items-center gap-2 text-meta font-semibold">
            <span
              className="size-1.5 rounded-full bg-warn-500"
              aria-hidden="true"
            />
            这一档挡不住 / 不允许
          </div>
          <ul className="mt-3 space-y-2 text-meta text-fg-2">
            {active.cannot.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
