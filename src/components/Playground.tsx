"use client";

import { useEffect, useState } from "react";

export type PlaygroundDemo = {
  id: string;
  /** 标签：这一跑在验证什么 */
  label: string;
  /** 展示给读者的“你会问它什么” */
  ask: string;
  /** 实际发出去的 prompt */
  prompt: string;
  maxTokens: number;
  /** 你应该看到什么 */
  expect: string;
};

const KEY_STORAGE = "dsh-guide:api-key";
const ENDPOINT = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-flash";

type ApiResponse = {
  choices?: {
    message?: { content?: unknown; reasoning_content?: unknown };
    finish_reason?: unknown;
  }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    completion_tokens_details?: { reasoning_tokens?: number };
  };
  error?: { message?: string };
};

type Run = {
  content: string;
  reasoning: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  finishReason?: string;
  ms: number;
};

const asString = (v: unknown): string => (typeof v === "string" ? v : "");

export function Playground({ demos }: { demos: PlaygroundDemo[] }) {
  const [apiKey, setApiKey] = useState("");
  const [stored, setStored] = useState(false);
  const [activeId, setActiveId] = useState(demos[0]?.id ?? "");
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY_STORAGE);
      if (saved) {
        setApiKey(saved);
        setStored(true);
      }
    } catch {
      /* 隐私模式忽略 */
    }
  }, []);

  const active = demos.find((d) => d.id === activeId) ?? demos[0];

  function saveKey(value: string) {
    setApiKey(value);
    try {
      if (value.trim()) {
        window.localStorage.setItem(KEY_STORAGE, value.trim());
        setStored(true);
      } else {
        window.localStorage.removeItem(KEY_STORAGE);
        setStored(false);
      }
    } catch {
      setStored(false);
    }
  }

  function clearKey() {
    setApiKey("");
    setRun(null);
    setError(null);
    try {
      window.localStorage.removeItem(KEY_STORAGE);
    } catch {
      /* ignore */
    }
    setStored(false);
  }

  async function runDemo() {
    if (!active) return;
    setError(null);
    setRun(null);

    const key = apiKey.trim();
    if (!key) {
      setError("先填入你的 DeepSeek API Key。");
      return;
    }

    setRunning(true);
    const started = performance.now();
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: active.prompt }],
          max_tokens: active.maxTokens,
        }),
      });

      const text = await res.text();
      let json: ApiResponse | null = null;
      try {
        json = JSON.parse(text) as ApiResponse;
      } catch {
        json = null;
      }

      if (!res.ok) {
        const detail = json?.error?.message ?? text.slice(0, 240);
        setError(
          res.status === 401
            ? `Key 没通过验证（HTTP 401）。请检查是否复制完整。服务器原话：${detail}`
            : `请求失败（HTTP ${res.status}）。服务器原话：${detail}`,
        );
        return;
      }

      const choice = json?.choices?.[0];
      setRun({
        content: asString(choice?.message?.content),
        reasoning: asString(choice?.message?.reasoning_content),
        promptTokens: json?.usage?.prompt_tokens,
        completionTokens: json?.usage?.completion_tokens,
        totalTokens: json?.usage?.total_tokens,
        reasoningTokens:
          json?.usage?.completion_tokens_details?.reasoning_tokens,
        finishReason: asString(choice?.finish_reason),
        ms: Math.round(performance.now() - started),
      });
    } catch (e) {
      setError(
        `请求没能发出去：${e instanceof Error ? e.message : String(e)}。检查网络，或浏览器插件是否拦了请求。`,
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="elev-soft overflow-hidden rounded-lg bg-raised">
      {/* ── Key ─────────────────────────────────────────── */}
      <div className="border-b border-hair p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label
            htmlFor="dsh-guide-key"
            className="text-meta font-medium text-fg"
          >
            你的 DeepSeek API Key
          </label>
          <span className="text-caption text-fg-3">
            {stored ? "已保存在本机浏览器" : "只存本地，不上传"}
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            id="dsh-guide-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={apiKey}
            onChange={(e) => saveKey(e.target.value)}
            placeholder="sk-..."
            className="h-10 min-w-0 flex-1 rounded-sm border border-line bg-canvas px-3 font-mono text-meta text-fg outline-none transition-colors duration-200 placeholder:text-fg-3 focus:border-accent"
          />
          {apiKey && (
            <button
              type="button"
              onClick={clearKey}
              className="h-10 shrink-0 rounded-sm px-4 text-meta text-fg-2 transition-colors duration-200 hover:bg-hover hover:text-fg"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* ── 演示切换 ────────────────────────────────────── */}
      <div className="border-b border-hair p-5 sm:p-6">
        <div className="inline-flex flex-wrap gap-1 rounded-sm bg-sunken p-1">
          {demos.map((d) => {
            const on = d.id === activeId;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setActiveId(d.id);
                  setRun(null);
                  setError(null);
                }}
                className={
                  on
                    ? "elev-panel rounded-xs bg-raised px-3 py-1.5 text-meta font-medium text-fg"
                    : "rounded-xs px-3 py-1.5 text-meta text-fg-2 transition-colors duration-200 hover:text-fg"
                }
              >
                {d.label}
              </button>
            );
          })}
        </div>

        {active && (
          <div className="mt-5">
            <div className="text-caption text-fg-3">你会问它</div>
            <p className="mt-2 border-l-2 border-accent pl-4 text-body-sm text-fg">
              {active.ask}
            </p>
            <p className="mt-3 text-meta text-fg-2">
              <span className="text-fg-3">预期 · </span>
              {active.expect}
            </p>
          </div>
        )}
      </div>

      {/* ── 运行 ────────────────────────────────────────── */}
      <div className="p-5 sm:p-6">
        <button
          type="button"
          onClick={runDemo}
          disabled={running || !active}
          className="h-11 w-full rounded-sm bg-brand text-body-sm font-medium text-on-brand transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? "正在真实调用 DeepSeek…" : "跑一次（真实调用）"}
        </button>

        <p className="mt-3 text-caption text-fg-3">
          模型 <span className="font-mono">{MODEL}</span>
          ，请求直接从你的浏览器发往 api.deepseek.com，不经过任何中间服务器。
          {active ? ` 本次 max_tokens = ${active.maxTokens}。` : ""}
        </p>

        {error && (
          <div className="mt-5 rounded-sm bg-danger-100 p-4 text-meta text-danger-600 dark:bg-danger-900 dark:text-danger-400">
            {error}
          </div>
        )}

        {run && (
          <div className="mt-5 space-y-3">
            <div className="rounded-sm bg-sunken p-4">
              <div className="flex items-baseline justify-between text-caption text-fg-3">
                <span>它回答的</span>
                <span className="font-mono">
                  {run.ms} ms · {run.totalTokens ?? "?"} tokens
                </span>
              </div>
              {run.content ? (
                <p className="mt-3 text-body-sm whitespace-pre-wrap">
                  {run.content}
                </p>
              ) : (
                <p className="mt-3 text-meta text-warn-600 dark:text-warn-400">
                  回答是空的。最常见的原因是 max_tokens 给小了——模型的“思考”先把额度用完了（本次思考用了{" "}
                  {run.reasoningTokens ?? "?"} tokens，结束原因 finish_reason ={" "}
                  {run.finishReason || "未知"}）。
                </p>
              )}
            </div>

            {run.reasoning && (
              <details className="group rounded-sm bg-sunken px-4 py-3">
                <summary className="cursor-pointer list-none text-caption text-fg-3 transition-colors hover:text-fg-2">
                  <span className="group-open:hidden">
                    它在你看到回答之前，先想了这些 ▸
                  </span>
                  <span className="hidden group-open:inline">
                    收起思考过程 ▾
                  </span>
                </summary>
                <p className="mt-3 text-caption leading-relaxed whitespace-pre-wrap text-fg-2">
                  {run.reasoning}
                </p>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
