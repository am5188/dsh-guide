/**
 * 手写内联 SVG 图标。
 * 规格对齐 DSH：16px 盒、stroke 1.3、圆头圆角、currentColor。
 * （DSH 自身不依赖任何图标库，全部手写；这里同理。）
 */
export type IconProps = { className?: string; size?: number };

function Svg({
  className,
  size = 16,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 🎬 先看一眼 */
export function IconFilm(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="1.7" y="3.1" width="12.6" height="9.8" rx="2" />
      <path d="M6.6 6.1 10 8l-3.4 1.9z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** 📐 到底怎么回事 */
export function IconDiagram(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="1.5" y="2" width="5" height="4" rx="1.2" />
      <rect x="9.5" y="2" width="5" height="4" rx="1.2" />
      <rect x="5.5" y="10" width="5" height="4" rx="1.2" />
      <path d="M4 6v2.2h8V6M8 8.2V10" />
    </Svg>
  );
}

/** ⌨️ 你自己跑一遍 */
export function IconTerminal(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="1.6" y="2.6" width="12.8" height="10.8" rx="2" />
      <path d="M4.7 6.5 6.5 8.3 4.7 10.1M8.6 10.1h2.9" />
    </Svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.6v1.1M8 13.3v1.1M1.6 8h1.1M13.3 8h1.1M3.5 3.5l.8.8M11.7 11.7l.8.8M12.5 3.5l-.8.8M4.3 11.7l-.8.8" />
    </Svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.2 9.5A5.4 5.4 0 0 1 6.5 2.8a5.5 5.5 0 1 0 6.7 6.7Z" />
    </Svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.6 8h10.8M9.6 4.2 13.4 8l-3.8 3.8" />
    </Svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6.3 8 10.2l4-3.9" />
    </Svg>
  );
}
