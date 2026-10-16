import type { ReactNode } from "react";

/**
 * 明确标注“我还没能核实”的内容。
 * 站点上出现的每一处不确定，都应该用它标出来，而不是含糊过去。
 */
export function Unverified({ children }: { children: ReactNode }) {
  return (
    <div className="my-9 rounded-lg bg-warn-100 p-5 dark:bg-warn-900">
      <div className="flex items-center gap-2 text-meta font-semibold text-warn-600 dark:text-warn-400">
        <span className="size-1.5 rounded-full bg-warn-500" aria-hidden="true" />
        待核实
      </div>
      <div className="mt-2 text-meta leading-relaxed text-fg-2">{children}</div>
    </div>
  );
}

/** 一般提示 */
export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="my-9 border-l-2 border-accent pl-5">
      <div className="text-body-sm leading-relaxed text-fg-2">{children}</div>
    </div>
  );
}
