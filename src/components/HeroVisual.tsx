/**
 * 首屏结构图：一句话说清这份指南要讲的东西。
 * 模型 → Harness → 你的电脑。纯 CSS，无依赖。
 */
function Layer({
  title,
  sub,
  accent = false,
}: {
  title: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-md bg-accent-soft px-4 py-3"
          : "rounded-md bg-canvas px-4 py-3"
      }
    >
      <div
        className={
          accent
            ? "text-body-sm font-semibold text-accent"
            : "text-body-sm font-medium text-fg"
        }
      >
        {title}
      </div>
      <div className="mt-0.5 text-caption text-fg-2">{sub}</div>
    </div>
  );
}

function Connector({ delay }: { delay: 0 | 1 }) {
  return (
    <div className="relative h-9" aria-hidden="true">
      <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-line-2" />
      <div
        className={
          delay === 0
            ? "flow-dot absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent"
            : "flow-dot-2 absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent"
        }
      />
    </div>
  );
}

export function HeroVisual() {
  return (
    <figure className="rounded-lg bg-surface p-5">
      <Layer title="模型" sub="只会想、只会说" />
      <Connector delay={0} />
      <Layer title="Harness" sub="替它记、替它动手、替它把关" accent />
      <Connector delay={1} />
      <Layer title="你的电脑" sub="文件 · Excel · 邮箱 · 浏览器" />
      <figcaption className="mt-5 text-caption text-fg-3">
        中间这一层，就是这份指南要教你用的东西。
      </figcaption>
    </figure>
  );
}
