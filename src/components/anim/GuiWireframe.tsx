/**
 * DSH 网页界面的三栏线框图（手绘 SVG，非截图）。
 * 第 4 节用来说明“第一次打开你会看到什么”。
 */
function Pane({
  x,
  w,
  title,
  lines,
}: {
  x: number;
  w: number;
  title: string;
  lines: number[];
}) {
  return (
    <g>
      <rect
        x={x}
        y={38}
        width={w}
        height={158}
        rx={8}
        fill="var(--surface)"
      />
      <text
        x={x + 12}
        y={58}
        fontSize={10}
        fill="var(--fg-3)"
        fontFamily="var(--font-sans)"
      >
        {title}
      </text>
      {lines.map((ly, i) => (
        <rect
          key={ly}
          x={x + 12}
          y={ly}
          width={w - 24 - (i % 3) * 12}
          height={7}
          rx={3.5}
          fill="var(--line-2)"
        />
      ))}
    </g>
  );
}

export function GuiWireframe() {
  return (
    <figure className="rounded-lg bg-surface p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between text-caption text-fg-3">
        <span>DSH 网页界面 · 线框示意</span>
        <span>不是截图</span>
      </div>

      <svg
        viewBox="0 0 640 210"
        className="w-full"
        role="img"
        aria-label="DSH 网页界面的三栏布局示意：左侧会话列表，中间对话区，右侧文件与终端"
      >
        {/* 顶栏 */}
        <rect x="0" y="0" width="640" height="26" rx="6" fill="var(--surface)" />
        <circle cx="16" cy="13" r="4" fill="var(--accent)" />
        <rect x="28" y="9.5" width="72" height="7" rx="3.5" fill="var(--line-2)" />
        <rect x="560" y="9" width="64" height="8" rx="4" fill="var(--line-2)" />

        <Pane
          x={0}
          w={152}
          title="会话"
          lines={[82, 100, 118, 136, 154]}
        />
        <Pane
          x={164}
          w={304}
          title="对话"
          lines={[84, 100, 116, 132, 148, 164, 180]}
        />
        <Pane x={480} w={160} title="文件 / 终端" lines={[82, 100, 118, 136, 154]} />

        {/* 输入区 */}
        <rect
          x={164}
          y={176}
          width={304}
          height={20}
          rx={8}
          fill="var(--canvas)"
          stroke="var(--line-2)"
          strokeWidth={0.8}
        />
        <rect x={176} y={183} width={120} height={6} rx={3} fill="var(--line-2)" />
        <circle cx={452} cy={186} r={7} fill="var(--accent)" />
      </svg>

      <figcaption className="mt-5 text-meta leading-relaxed text-fg-2">
        左边是你的会话列表，中间是对话，右边是文件树和终端。
        你不需要记这些区域叫什么，只要记住：
        <strong className="font-semibold text-fg">它做的事都发生在中间</strong>
        ，而
        <strong className="font-semibold text-fg">它动过的文件会出现在右边</strong>。
      </figcaption>
    </figure>
  );
}
