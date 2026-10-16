/**
 * 顺序点亮的步骤条。
 * 用来讲“能力一个个长出来”“任务一步步推进”这类线性过程。
 */
export function SequenceAnim({
  title,
  caption,
  items,
}: {
  title: string;
  caption: string;
  items: { tag: string; label: string }[];
}) {
  return (
    <figure className="rounded-lg bg-surface p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between text-caption text-fg-3">
        <span>{title}</span>
        <span>循环播放</span>
      </div>

      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-3">
        {items.map((it, i) => (
          <li key={`${it.tag}-${it.label}`} className="flex items-center gap-1.5">
            <span
              className="light-up rounded-md bg-canvas px-3 py-2"
              style={{ animationDelay: `${i * 0.55}s` }}
            >
              <span className="block font-mono text-micro text-fg-3">
                {it.tag}
              </span>
              <span className="mt-0.5 block text-meta font-medium text-fg whitespace-nowrap">
                {it.label}
              </span>
            </span>
            {i < items.length - 1 && (
              <span className="text-fg-dim" aria-hidden="true">
                →
              </span>
            )}
          </li>
        ))}
      </ol>

      <figcaption className="mt-5 text-meta leading-relaxed text-fg-2">
        {caption}
      </figcaption>
    </figure>
  );
}
