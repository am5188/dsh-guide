/**
 * 第 1 节的动画：模型能“说”，但过不去那道墙。
 * 纯 CSS keyframes，无 JS、无第三方库。
 */
export function Unit01Anim() {
  const bubbles = [
    { text: "我给你写一段介绍", cls: "nudge" },
    { text: "我帮你总结这份材料", cls: "nudge-2" },
    { text: "我去看看你的 D 盘", cls: "bounce-back" },
  ];

  return (
    <figure className="rounded-lg bg-surface p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between text-caption text-fg-3">
        <span>模型的边界</span>
        <span>循环播放</span>
      </div>

      <div className="flex items-stretch gap-3 sm:gap-5">
        {/* 模型 */}
        <div className="flex w-[88px] shrink-0 flex-col justify-center rounded-md bg-accent-soft px-3 py-4 text-center sm:w-[104px]">
          <div className="text-body-sm font-semibold text-accent">模型</div>
          <div className="mt-1 text-caption leading-snug text-fg-2">
            只会想
            <br />
            只会说
          </div>
        </div>

        {/* 气泡 + 墙 */}
        <div className="relative h-[116px] min-w-0 flex-1 overflow-hidden rounded-md bg-canvas">
          {bubbles.map((b, i) => (
            <div
              key={b.text}
              className={`absolute left-3 rounded-full bg-surface px-3 py-1 text-caption whitespace-nowrap text-fg-2 ${b.cls}`}
              style={{ top: `${12 + i * 34}px` }}
            >
              {b.text}
            </div>
          ))}
          <div className="wall-pulse absolute top-0 bottom-0 right-[54px] w-px border-l border-dashed border-warn-500" />
          <div className="absolute top-1/2 right-2.5 -translate-y-1/2 text-caption leading-tight text-fg-3">
            过
            <br />
            不
            <br />
            去
          </div>
        </div>

        {/* 真实世界 */}
        <div className="flex w-[86px] shrink-0 flex-col justify-center gap-2 sm:w-[100px]">
          {["你的文件夹", "你的 Excel", "你的邮箱"].map((t) => (
            <div
              key={t}
              className="rounded-sm bg-surface px-2 py-1.5 text-center text-caption text-fg-2"
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      <figcaption className="mt-5 text-meta leading-relaxed text-fg-2">
        前两句它真能做到。第三句它也会一本正经地回答，但它其实从来没打开过你的硬盘
        ——它只是在“接着往下写”。这道墙，就是后面 21 节要一层层拆的东西。
      </figcaption>
    </figure>
  );
}
