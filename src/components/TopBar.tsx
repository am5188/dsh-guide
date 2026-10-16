import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-hair bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center gap-5 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-body-sm font-semibold tracking-tight text-fg transition-colors hover:text-accent"
        >
          <span className="grid size-6 place-items-center rounded-xs bg-brand text-[11px] font-bold text-on-brand">
            D
          </span>
          <span>DeepSeek Harness 使用指南</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          <Link
            href="/"
            className="hidden rounded-sm px-2.5 py-1.5 text-meta text-fg-2 transition-colors hover:bg-hover hover:text-fg sm:block"
          >
            目录
          </Link>
          <Link
            href="/#roadmap"
            className="hidden rounded-sm px-2.5 py-1.5 text-meta text-fg-2 transition-colors hover:bg-hover hover:text-fg sm:block"
          >
            22 节
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
