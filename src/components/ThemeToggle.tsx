"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "./icons";

type Theme = "light" | "dark";
const STORAGE_KEY = "dsh-guide:theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light",
    );
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* 隐私模式忽略 */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "切换到浅色" : "切换到深色"}
      title={theme === "dark" ? "切换到浅色" : "切换到深色"}
      className="grid size-8 place-items-center rounded-sm text-fg-2 transition-colors duration-200 hover:bg-hover hover:text-fg"
    >
      {mounted ? theme === "dark" ? <IconSun /> : <IconMoon /> : null}
    </button>
  );
}
