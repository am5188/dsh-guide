"use client";

import { useEffect, useState } from "react";

export type PythonDemo = {
  id: string;
  label: string;
  /** 这段代码在演示什么 */
  explain: string;
  /** Python 源码。里面可以直接用 DSH_API_KEY 这个变量。 */
  code: string;
};

const KEY_STORAGE = "dsh-guide:api-key";
const PYODIDE_VERSION = "v0.28.0";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

/* ── Pyodide 的最小类型 ─────────────────────────────────── */
type PyodideApi = {
  loadPackage: (name: string) => Promise<void>;
  pyimport: (name: string) => { install: (pkg: string) => Promise<void> };
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: { set: (k: string, v: unknown) => void };
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideApi>;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`加载失败：${src}`));
    document.head.appendChild(s);
  });
}

/** 整个页面只加载一次 Python 运行环境 */
let pyodidePromise: Promise<PyodideApi> | null = null;

function loadPyodideOnce(): Promise<PyodideApi> {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    if (!window.loadPyodide) {
      await loadScript(`${PYODIDE_BASE}pyodide.js`);
    }
    const load = window.loadPyodide;
    if (!load) throw new Error("Python 运行环境没有加载成功");
    const py = await load({ indexURL: PYODIDE_BASE });
    await py.loadPackage("micropip");
    const micropip = py.pyimport("micropip");
    await micropip.install("requests");
    await micropip.install("pyodide-http");
    // 让 requests 走浏览器的 fetch，从而能直接调 API
    await py.runPythonAsync("import pyodide_http; pyodide_http.patch_all()");
    return py;
  })();
  return pyodidePromise;
}

type Stage = "idle" | "loading" | "ready" | "running";

export function PythonPlayground({ demos }: { demos: PythonDemo[] }) {
  const [apiKey, setApiKey] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [activeId, setActiveId] = useState(demos[0]?.id ?? "");
  const [lines, setLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY_STORAGE);
      if (saved) setApiKey(saved);
    } catch {
      /* 忽略 */
    }
  }, []);

  const active = demos.find((d) => d.id === activeId) ?? demos[0];

  function saveKey(v: string) {
    setApiKey(v);
    try {
      if (v.trim()) window.localStorage.setItem(KEY_STORAGE, v.trim());
      else window.localStorage.removeItem(KEY_STORAGE);
    } catch {
      /* 忽略 */
    }
  }

  async function boot() {
    setError(null);
    setStage("loading");
    const t0 = performance.now();
    try {
      await loadPyodideOnce();
      setElapsed(Math.round(performance.now() - t0));
      setStage("ready");
    } catch (e) {
      setStage("idle");
      setError(
        `Python 运行环境没加载起来：${e instanceof Error ? e.message : String(e)}。检查一下网络。`,
      );
    }
  }

  async function run() {
    if (!active) return;
    const key = apiKey.trim();
    if (!key) {
      setError("先填入你的 DeepSeek API Key。");
      return;
    }
    setError(null);
    setLines([]);
    setStage("running");
    try {
      const py = await loadPyodideOnce();
      const out: string[] = [];
      py.setStdout({ batched: (s) => out.push(s) });
      py.setStderr({ batched: (s) => out.push(s) });
      py.globals.set("DSH_API_KEY", key);
      await py.runPythonAsync(active.code);
      setLines(out.length > 0 ? out : ["（这段代码没有输出任何内容）"]);
    } catch (e) {
      setLines([e instanceof Error ? e.message : String(e)]);
    } finally {
      setStage("ready");
    }
  }

  return (
    <div className="elev-soft overflow-hidden rounded-lg bg-raised">
      <div className="border-b border-hair p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-meta font-medium text-fg">
            真 Python · 在你的浏览器里跑
          </span>
          <span className="text-caption text-fg-3">
            首次约需下载 10MB 运行环境
          </span>
        </div>
        <p className="mt-2 text-caption leading-relaxed text-fg-3">
          下面这段是<strong className="font-medium text-fg-2">真正的 Python 代码</strong>
          ，不是伪代码。它在你的浏览器里用 Pyodide 执行，`requests` 请求直接从浏览器发往
          DeepSeek，不经过任何中间服务器。
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={apiKey}
            onChange={(e) => saveKey(e.target.value)}
            placeholder="sk-..."
            aria-label="DeepSeek API Key"
            className="h-9 min-w-0 flex-1 rounded-sm border border-line bg-canvas px-3 font-mono text-meta text-fg outline-none transition-colors duration-200 placeholder:text-fg-3 focus:border-accent"
          />
          {stage === "idle" ? (
            <button
              type="button"
              onClick={boot}
              className="h-9 shrink-0 rounded-sm bg-brand px-4 text-meta font-medium text-on-brand transition-opacity duration-200 hover:opacity-90"
            >
              加载 Python 环境
            </button>
          ) : (
            <span className="grid h-9 shrink-0 place-items-center rounded-sm bg-sunken px-4 text-caption text-fg-3">
              {stage === "loading"
                ? "正在加载…"
                : stage === "running"
                  ? "正在运行…"
                  : `环境就绪 · ${elapsed} ms`}
            </span>
          )}
        </div>
      </div>

      <div className="border-b border-hair p-5 sm:p-6">
        <div className="inline-flex flex-wrap gap-1 rounded-sm bg-sunken p-1">
          {demos.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setActiveId(d.id);
                setLines([]);
                setError(null);
              }}
              className={
                d.id === activeId
                  ? "elev-panel rounded-xs bg-raised px-3 py-1.5 text-meta font-medium text-fg"
                  : "rounded-xs px-3 py-1.5 text-meta text-fg-2 transition-colors duration-150 hover:text-fg"
              }
            >
              {d.label}
            </button>
          ))}
        </div>

        {active && (
          <p className="mt-4 text-meta leading-relaxed text-fg-2">
            {active.explain}
          </p>
        )}

        {active && (
          <pre className="mt-4 overflow-x-auto rounded-sm bg-sunken p-4 font-mono text-caption leading-relaxed text-fg-2">
            {active.code}
          </pre>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <button
          type="button"
          onClick={run}
          disabled={stage === "loading" || stage === "running"}
          className="h-10 w-full rounded-sm bg-brand text-body-sm font-medium text-on-brand transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {stage === "running" ? "正在运行 Python…" : "运行这段 Python"}
        </button>

        {error && (
          <div className="mt-4 rounded-sm bg-danger-100 p-4 text-meta text-danger-600 dark:bg-danger-900 dark:text-danger-400">
            {error}
          </div>
        )}

        {lines.length > 0 && (
          <div className="mt-4 rounded-sm bg-sunken p-4">
            <div className="text-caption text-fg-3">运行结果</div>
            <pre className="mt-2 overflow-x-auto font-mono text-caption leading-relaxed whitespace-pre-wrap text-fg">
              {lines.join("\n")}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
