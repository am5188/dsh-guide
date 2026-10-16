import type { UnitContent } from "../types";
import { CompareAnim } from "@/components/anim/CompareAnim";
import { CycleAnim } from "@/components/anim/diagrams";
import { Callout } from "@/components/Note";

const theory = (
  <div className="prose-cn">
    <p>前三节解决的是「它知道什么」。这一节开始处理「它能做什么」。</p>

    <h2>模型自己什么都没执行</h2>
    <CycleAnim
      steps={["模型说：要读文件", "系统真的去读", "结果发回模型", "模型说：要写文件", "系统真的去写"]}
      center="直到它说「我做完了」"
    />

    <Callout>
      这个循环叫<strong>工具调用</strong>。第 3 节那张「一句话变成一堆动作」的图，说的就是它。
    </Callout>

    <h2>为什么这是个突破</h2>
    <p>
      它把模型从「只会说」变成了「会指挥」。
      第 1 节那道过不去的墙就是这样绕过去的——
      <strong>不是模型越过了墙，是墙外有人替它递东西</strong>。
    </p>

    <h2>一个重要的推论</h2>
    <p>
      能执行什么、允许执行什么，<strong>完全由外面决定</strong>，不由模型决定。
      这就是权限和沙箱为什么重要：模型可以提任何请求，答不答应是系统和你说了算。
    </p>
  </div>
);

const content: UnitContent = {
  animTitle: "模型只负责“说要调什么”",
  anim: (
    <CompareAnim
      title="模型只负责“说要调什么”"
      left={{
        label: "没有工具时",
        lines: ["你：把那个文件读一下", "它：我做不到", "（真的做不到）", "对话到此为止"],
      }}
      right={{
        label: "有工具时",
        lines: ["你：把那个文件读一下", "它：请调用读文件工具", "外面的系统真的去读", "结果发回来，它继续"],
      }}
      caption="模型自己什么都没碰，它只是提出了一个请求。"
    />
  ),
  theory,
  practiceIntro: (
    <p className="text-body-sm text-fg-2">
      先看它怎么「请求调用工具」，再看真正的两次往返。
    </p>
  ),
  demos: [
    {
      id: "toolcall",
      label: "① 看它“请求调用工具”长什么样",
      ask: "模拟一次工具调用：读 D:\\发票\\三月.pdf 并提取金额。",
      prompt:
        "假设你有一个名为 read_file 的工具，它接受一个参数 path。\n\n现在请以 JSON 格式输出你这样一次工具调用的请求，格式为：\n{\"tool\": \"工具名\", \"arguments\": {参数}}\n\n任务：读取 D:\\发票\\三月.pdf 并提取其中的金额。\n\n输出 JSON 之后，用一句话说明：为什么你输出这段 JSON 之后，自己并不能真的读到那个文件。",
      maxTokens: 4000,
      expect:
        "它会输出一段 JSON，然后承认自己并没有真的读文件。这段 JSON 就是“工具调用”的真身——一串文字而已，执行者是别人。",
    },
  ],
  agent: {
    intro: (
      <p className="text-body-sm text-fg-2">
        上面那次只是<strong className="font-semibold text-fg">一次</strong>调用。
        真正的工具调用是<strong className="font-semibold text-fg">一来一回两次</strong>
        ：模型先说要调什么，外面执行完，再把结果发回去，模型才给最终答案。
        下面这个会把两次请求的完整 JSON 都摊开给你看。
      </p>
    ),
    demos: [
      {
        id: "list-files",
        label: "让它去查一个目录",
        system:
          "你是一个可以调用工具的助手。当你需要了解用户电脑上的情况时，必须先调用工具，不要凭空猜测。",
        user: "帮我看看 D:\\发票 目录里有多少个 PDF 文件。",
        tools: [
          {
            type: "function",
            function: {
              name: "list_files",
              description: "列出一个目录下的所有文件名",
              parameters: {
                type: "object",
                properties: {
                  path: {
                    type: "string",
                    description: "目录的完整路径，例如 D:\\发票",
                  },
                },
                required: ["path"],
              },
            },
          },
        ],
        outputs: {
          list_files: [
            "D:\\发票 目录共 5 个文件：",
            "- 2026-01_办公用品.pdf",
            "- 2026-01_差旅.pdf",
            "- 2026-02_办公用品.pdf",
            "- 2026-03_差旅.pdf",
            "- 说明.txt",
          ].join("\n"),
        },
        explain:
          "注意三件事：① 模型自己决定要调哪个工具、参数填什么；② 它输出的只是一段 JSON，真正读目录的是外面；③ 它拿到结果以后，还要再被调用一次才给出最终答案。这个「一来一回」，就是智能体循环的最小形态。",
      },
    ],
  },
  python: {
    intro: (
      <p className="text-body-sm text-fg-2">
        下面这段 Python 让模型把「请求调用工具」写出来，
        然后你亲眼看一遍：<strong className="font-semibold text-fg">响应里只有文字，没有任何东西被执行</strong>
        。这就是这一节最核心的一句话。
      </p>
    ),
    demos: [
      {
        id: "only-text",
        label: "① 响应里只有文字",
        explain:
          "这段代码把模型的输出打印出来。它看起来像一个“动作”，但本质只是一段字符串——浏览器里什么也没发生。",
        code: `import requests

resp = requests.post(
    "https://api.deepseek.com/chat/completions",
    headers={"Authorization": "Bearer " + DSH_API_KEY},
    json={
        "model": "deepseek-flash",
        "max_tokens": 900,
        "messages": [{
            "role": "user",
            "content": (
                "我想读一个文件。请用 JSON 说明你会怎样请求调用一个叫 "
                "read_file 的工具，只输出 JSON，不要其它文字。"
            ),
        }],
    },
)

data = resp.json()
print("HTTP 状态码：", resp.status_code)
print()
print("模型返回的全部内容：")
print(data["choices"][0]["message"]["content"])
print()
print("这段代码跑完了。你的文件系统没有任何变化——")
print("因为真正去读文件的，是模型外面那层系统，而不是模型自己。")`,
      },
    ],
  },
};

export default content;
