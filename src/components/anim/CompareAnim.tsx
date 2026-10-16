/**
 * 两栏对照，交替高亮。
 * 说明“同一件事，换个说法 / 换个做法，结果差很多”。
 */
type Panel = {
  label: string;
  lines: string[];
};

export function CompareAnim({
  title,
  caption,
  left,
  right,
}: {
  title: string;
  caption: string;
  left: Panel;
  right: Panel;
}) {
  return (
    <figure className="rounded-lg bg-surface p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between text-caption text-fg-3">
        <span>{title}</span>
        <span>交替高亮</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="ring-a rounded-md bg-canvas p-5">
          <div className="text-meta font-semibold text-fg-2">{left.label}</div>
          <ul className="mt-3 space-y-2">
            {left.lines.map((l) => (
              <li key={l} className="text-body-sm text-fg">
                {l}
              </li>
            ))}
          </ul>
        </div>

        <div className="ring-b rounded-md bg-canvas p-5">
          <div className="text-meta font-semibold text-fg-2">{right.label}</div>
          <ul className="mt-3 space-y-2">
            {right.lines.map((l) => (
              <li key={l} className="text-body-sm text-fg">
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <figcaption className="mt-5 text-meta leading-relaxed text-fg-2">
        {caption}
      </figcaption>
    </figure>
  );
}
