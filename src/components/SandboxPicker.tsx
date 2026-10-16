"use client";

import { useState } from "react";

type Tier = {
  id: string;
  /** 界面上的中文名（读自 DSH 的权限档位界面） */
  name: string;
  /** 实现里的档位标识 */
  key: string;
  summary: string;
  can: string[];
  cannot: string[];
};

/**
 * 三档权限。
 *
 * 名称用的是 DSH 界面上的原词（仅可查看 / 工作区内修改 / 完全权限），
 * 不是我自己起的「只读 / 限定工作区 / 全开」。
 *
 * 另有一条很容易搞错、也最容易误导人的边界：
 * **这几档管的是「文件写」，不管网络、进程、系统调用或凭据。**
 * 所以下面「挡不住」一栏不再写「执行命令」「改系统配置」这类断言
 * ——那不属于这个开关的职责范围。
 */
const TIERS: Tier[] = [
  {
    id: "read-only",
    name: "仅可查看",
    key: "read-only",
    summary: "不会写入任何文件。适合「只想让它读一读、告诉我结论」的场合。",
    can: ["读文件、列目录", "搜索内容", "给你结论和建议"],
    cannot: ["写、改、删、重命名任何文件"],
  },
  {
    id: "workspace-write",
    name: "工作区内修改",
    key: "workspace-write",
    summary:
      "只能写当前工作区内的文件，另外还允许写后端指定的临时区域。出厂默认就是这一档。",
    can: ["读文件、列目录", "在工作区内新建、修改、删除", "生成文档并保存"],
    cannot: ["写入工作区之外的路径"],
  },
  {
    id: "danger-full-access",
    name: "完全权限",
    key: "danger-full-access",
    summary: "文件写入没有围栏。除非你非常清楚在做什么，否则别开。",
    can: ["写入这台电脑上的任何路径"],
    cannot: ["（文件层面没有任何限制拦着它）"],
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

      <p className="mt-3 text-caption leading-relaxed text-fg-3">
        注意这几档管的是<strong className="text-fg-2">文件写入</strong>，
        不涉及网络、进程或凭据——那些不在这个开关的职责范围内。
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
