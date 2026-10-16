"use client";

import { useState } from "react";
import type { CommandSpec } from "@/content/types";

const SHELL = "$";

export function CommandBlock({ commands }: { commands: CommandSpec[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const active = commands[activeIdx];

  async function copy() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.cmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 剪贴板不可用就忽略 */
    }
  }

  if (!active) return null;

  return (
    <div className="elev-soft overflow-hidden rounded-lg bg-raised">
      {commands.length > 1 && (
        <div className="border-b border-hair p-4 sm:p-5">
          <div className="inline-flex flex-wrap gap-1 rounded-sm bg-sunken p-1">
            {commands.map((c, i) => (
              <button
                key={c.title}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={
                  i === activeIdx
                    ? "elev-panel rounded-xs bg-raised px-3 py-1.5 text-meta font-medium text-fg"
                    : "rounded-xs px-3 py-1.5 text-meta text-fg-2 transition-colors duration-150 hover:text-fg"
                }
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {commands.length === 1 && (
          <div className="text-meta font-medium text-fg">{active.title}</div>
        )}

        <div className="mt-3 flex items-stretch gap-2">
          <pre className="min-w-0 flex-1 overflow-x-auto rounded-sm bg-sunken px-4 py-3 font-mono text-body-sm leading-relaxed">
            <span className="select-none text-fg-3">{SHELL} </span>
            {active.cmd}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-sm px-3 text-caption text-fg-2 transition-colors duration-150 hover:bg-hover hover:text-fg"
          >
            {copied ? "已复制" : "复制"}
          </button>
        </div>

        <div className="mt-4">
          <div className="text-caption text-fg-3">跑完你应该看到</div>
          <p className="mt-1.5 text-meta text-fg-2">{active.expect}</p>
        </div>

        {active.note && (
          <p className="mt-3 text-meta text-fg-3">{active.note}</p>
        )}
      </div>
    </div>
  );
}
