"use client";

import { useEffect, useState } from "react";

export type ToolDef = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type AgentDemo = {
  id: string;
  label: string;
  /** 系统提示词 */
  system: string;
  /** 用户那句话 */
  user: string;
  /** 给模型看的工具清单 */
  tools: ToolDef[];
  /**
   * 本地模拟执行工具的结果：工具名 → 返回给模型的字符串。
   * 这里必须是纯数据——服务端组件不能把函数传给客户端组件。
   * 这些工具是**假的**，只为了让读者看清回路，不会碰任何真实文件。
   */
  outputs: Record<string, string>;
  explain: string;
};

const KEY_STORAGE = "dsh-guide:api-key";
const ENDPOINT = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-flash";

type ToolCall = {
  id: string;
  name: string;
  args: unknown;
  rawArguments: string;
};

type Step =
  | { kind: "request"; title: string; body: unknown }
  | { kind: "model-tool"; title: string; text: string; calls: ToolCall[] }
  | {
      kind: "tool-exec";
      title: string;
      results: { name: string; args: unknown; output: string }[];
    }
  | { kind: "answer"; title: string; text: string; usage?: string }
  | { kind: "error"; title: string; text: string };

const STEP_ICON: Record<Step["kind"], string> = {
  request: "📤",
  "model-tool": "🤖",
  "tool-exec": "⚙️",
  answer: "💬",
  error: "⚠️",
};

export function AgentLoop({ demos }: { demos: AgentDemo[] }) {
  const [apiKey, setApiKey] = useState("");
  const [activeId, setActiveId] = useState(demos[0]?.id ?? "");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [round, setRound] = useState(0);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY_STORAGE);
      if (saved) setApiKey(saved);
    } catch {
      /* 忽略 */
    }
  }, []);

  const active = demos.find((d) => d.id === activeId) ?? demos[0];

  async function run() {
    if (!active) return;
    const key = apiKey.trim();
    if (!key) {
      setSteps([{ kind: "error", title: "缺 API Key", text: "先在上面填入你的 DeepSeek API Key。" }]);
      return;
    }

    setSteps([]);
    setRunning(true);
    const messages: Record<string, unknown>[] = [
      { role: "system", content: active.system },
      { role: "user", content: active.user },
    ];
    const body: Record<string, unknown> = {
      model: MODEL,
      messages,
      tools: active.tools,
      max_tokens: 16000,
    };
    const acc: Step[] = [];

    const push = (s: Step) => {
      acc.push(s);
      setSteps([...acc]);
    };

    push({
      kind: "request",
      title: "第 1 次请求：系统提示词 + 用户那句话 + 工具清单",
      body,
    });

    try {
      for (let r = 1; r <= 4; r++) {
        setRound(r);
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) {
          push({
            kind: "error",
            title: `HTTP ${res.status}`,
            text: json?.error?.message ?? "请求失败",
          });
          return;
        }

        const choice = json.choices?.[0];
        const msg = choice?.message ?? {};
        const rawCalls = (msg.tool_calls ?? []) as {
          id: string;
          function: { name: string; arguments: string };
        }[];

        if (rawCalls.length === 0) {
          push({
            kind: "answer",
            title: "模型给出最终回答",
            text: msg.content ?? "（没有内容）",
            usage: json.usage
              ? `finish_reason=${choice?.finish_reason} · 累计 ${json.usage.total_tokens} tokens`
              : undefined,
          });
          return;
        }

        const calls: ToolCall[] = rawCalls.map((c) => {
          let parsed: unknown = null;
          try {
            parsed = JSON.parse(c.function.arguments);
          } catch {
            parsed = c.function.arguments;
          }
          return {
            id: c.id,
            name: c.function.name,
            args: parsed,
            rawArguments: c.function.arguments,
          };
        });

        push({
          kind: "model-tool",
          title: `模型说：我要调用工具（finish_reason = ${choice?.finish_reason}）`,
          text:
            typeof msg.content === "string" && msg.content.trim()
              ? msg.content
              : "（它没有输出给用户看的文字，只发起了工具调用）",
          calls,
        });

        // 本地模拟执行：按工具名取出预先写好的返回内容
        const results = calls.map((c) => ({
          name: c.name,
          args: c.args,
          output:
            active.outputs[c.name] ?? `（这个演示没有为工具 ${c.name} 准备返回内容）`,
        }));

        push({
          kind: "tool-exec",
          title: "在本地执行这些工具（模拟，不会碰你的真实文件）",
          results,
        });

        messages.push(msg as Record<string, unknown>);
        for (let i = 0; i < calls.length; i += 1) {
          messages.push({
            role: "tool",
            tool_call_id: calls[i].id,
            content: results[i].output,
          });
        }

        const nextBody: Record<string, unknown> = {
          model: MODEL,
          messages,
          tools: active.tools,
          max_tokens: 16000,
        };
        Object.assign(body, nextBody);

        push({
          kind: "request",
          title: `第 ${r + 1} 次请求：把工具的执行结果发回去`,
          body: JSON.parse(JSON.stringify(body)),
        });
      }
    } catch (e) {
      push({
        kind: "error",
        title: "请求没能发出去",
        text: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setRunning(false);
      setRound(0);
    }
  }

  return (
    <div className="elev-soft overflow-hidden rounded-lg bg-raised">
      <div className="border-b border-hair p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-meta font-medium text-fg">
            完整工具调用回路 · 真调用
          </span>
          <span className="text-caption text-fg-3">
            工具本身是本地模拟的
          </span>
        </div>
        <p className="mt-2 text-meta leading-relaxed text-fg-2">
          和上面的面板不同，这里会连续发<strong>两次</strong>请求：
          第一次模型要工具，本地执行后，第二次把结果发回去。
          这一来一回，就是「智能体」这个词的全部含义。
        </p>

        <div className="mt-4 inline-flex flex-wrap gap-1 rounded-sm bg-sunken p-1">
          {demos.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setActiveId(d.id);
                setSteps([]);
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
      </div>

      <div className="p-5 sm:p-6">
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            try {
              if (e.target.value.trim())
                window.localStorage.setItem(KEY_STORAGE, e.target.value.trim());
            } catch {
              /* 忽略 */
            }
          }}
          placeholder="sk-...（若上面已填过，这里会自动带出来）"
          aria-label="DeepSeek API Key"
          className="h-10 w-full rounded-sm border border-line bg-canvas px-3 font-mono text-meta text-fg outline-none transition-colors duration-200 placeholder:text-fg-3 focus:border-accent"
        />

        <button
          type="button"
          onClick={run}
          disabled={running}
          className="mt-3 h-11 w-full rounded-sm bg-brand text-body-sm font-medium text-on-brand transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running
            ? `正在跑第 ${round} 轮…`
            : "跑完整回路（本人亲眼看着它调工具）"}
        </button>

        {steps.length > 0 && (
          <ol className="mt-6 space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="relative pl-9">
                <span
                  className="absolute top-0 left-0 grid size-7 place-items-center rounded-sm bg-surface text-[14px]"
                  aria-hidden="true"
                >
                  {STEP_ICON[s.kind]}
                </span>
                <div
                  className={
                    s.kind === "error"
                      ? "rounded-md bg-danger-100 p-4 dark:bg-danger-900"
                      : s.kind === "answer"
                        ? "rounded-md bg-accent-soft p-4"
                        : "rounded-md bg-surface p-4"
                  }
                >
                  <div className="text-meta font-semibold text-fg">
                    {s.title}
                  </div>

                  {s.kind === "request" && (
                    <details className="mt-2">
                      <summary className="cursor-pointer list-none text-caption text-fg-3 transition-colors hover:text-fg-2">
                        展开这次发出去的完整 JSON ▸
                      </summary>
                      <pre className="mt-2 max-h-[300px] overflow-auto rounded-sm bg-canvas p-3 font-mono text-micro leading-relaxed text-fg-2">
                        {JSON.stringify(s.body, null, 2)}
                      </pre>
                    </details>
                  )}

                  {s.kind === "model-tool" && (
                    <>
                      <p className="mt-1.5 text-meta text-fg-2">{s.text}</p>
                      <ul className="mt-3 space-y-2">
                        {s.calls.map((c) => (
                          <li
                            key={c.id}
                            className="rounded-sm bg-canvas p-3 font-mono text-caption"
                          >
                            <div className="text-accent">
                              {c.name}()
                            </div>
                            <div className="mt-1 text-fg-2">
                              参数：{c.rawArguments}
                            </div>
                            <div className="mt-1 text-fg-3">
                              id：{c.id}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {s.kind === "tool-exec" && (
                    <ul className="mt-3 space-y-2">
                      {s.results.map((r, ri) => (
                        <li key={ri} className="rounded-sm bg-canvas p-3">
                          <div className="font-mono text-caption text-fg-3">
                            {r.name} 返回
                          </div>
                          <pre className="mt-1.5 font-mono text-caption leading-relaxed whitespace-pre-wrap text-fg-2">
                            {r.output}
                          </pre>
                        </li>
                      ))}
                    </ul>
                  )}

                  {s.kind === "answer" && (
                    <>
                      <p className="mt-2 text-body-sm whitespace-pre-wrap text-fg">
                        {s.text}
                      </p>
                      {s.usage && (
                        <div className="mt-3 font-mono text-micro text-fg-3">
                          {s.usage}
                        </div>
                      )}
                    </>
                  )}

                  {s.kind === "error" && (
                    <p className="mt-1.5 text-meta text-danger-600 dark:text-danger-400">
                      {s.text}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
