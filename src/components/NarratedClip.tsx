import { BASE_PATH } from "@/lib/basePath";

/**
 * 关键节点的带旁白短片。
 * 片子由 video/ 目录里的 Remotion 工程渲染，产物复制到 public/videos/。
 */
export function NarratedClip({
  file,
  title,
  duration,
  caption,
}: {
  file: string;
  title: string;
  duration: string;
  caption: string;
}) {
  return (
    <figure className="rounded-lg bg-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-meta font-medium text-fg">{title}</span>
        <span className="text-caption text-fg-3">{duration}</span>
      </div>

      <video
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-md bg-canvas"
        src={`${BASE_PATH}/videos/${file}`}
      />

      <figcaption className="mt-4 text-caption leading-relaxed text-fg-3">
        {caption}
      </figcaption>
    </figure>
  );
}
