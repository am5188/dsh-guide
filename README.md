# DeepSeek Harness 使用指南

面向**零基础普通人**的中文教学站点：22 节，讲清楚怎么用 DeepSeek Harness（DSH）把活真的干完。

> 这份指南只讲「怎么用」，不讲「怎么实现」。想做工程原理，看 [harness-guide](https://github.com/am5188/harness-guide)；想看 LLM 发展史，看 [llm-harness](https://github.com/am5188/llm-harness)。

## 每一节都是同一个结构

| 段 | 作用 | 形式 |
|---|---|---|
| 🎬 先看一眼 | 先说清痛在哪，建立直觉 | 网页内交互动画（CSS/SVG，无依赖） |
| 📐 到底怎么回事 | 图解与边界，换成能复述的说法 | 手写 SVG + 排版 |
| ⌨️ 你自己跑一遍 | 读者填自己的 API Key，当场跑 | 浏览器直连 DeepSeek，真实输出 |

第三段不需要任何后端：DeepSeek API 的 CORS 已实测放行，请求从读者浏览器直接发往
`api.deepseek.com`。开发与构建**零 API 成本**。

## 结构（四部 22 节）

| 部 | 节数 | 内容 |
|---|---|---|
| 一、为什么需要它 | 1–4 | 模型的边界 → 能力演进时间线 → Harness 是什么 → 装上 DSH |
| 二、用起来 | 5–9 | 第一次对话 → 文件与授权 → 日常场景 → Word/Excel/PPT → 出错怎么办 |
| 三、能力是怎么长出来的 | 10–19 | 单次调用 → 多轮对话 → 压缩 → RAG → function calling → 技能插件 → 长任务 → 多智能体 → 权限沙箱 → DSH |
| 四、进阶与边界 | 20–22 | 工作流与定时 → 成本风险回滚 → 术语表与速查表 |

第三部每节点亮能力仪表盘上的一格：记忆 / 知识 / 工具 / 长任务 / 协作 / 安全。

## 开发

```sh
npm install
npm run dev            # http://localhost:3000/dsh-guide/
npm run build          # 静态导出到 out/
npm run deploy         # 构建并推送 gh-pages（需要 Git Bash）
```

本地想在根路径开发：`NEXT_PUBLIC_BASE_PATH= npm run dev`

主题默认跟随系统；也可用 `?theme=light` / `?theme=dark` 强制指定。

## 设计系统

视觉令牌**不是自创的**，全部对齐 DSH 自身的实现
（`.dsh-src/deepseek-ai/dsh-client-ui-theme/lib/client.js`）：

- 中性偏蓝灰阶 `#ffffff → #0f1115`、品牌蓝 `#4176e6`
- 圆角 4/8/12/16/20/28 + `corner-shape: superellipse(1.5)`
- 浮层用 `0 0 0 0.5px` 发丝描边 + 极淡阴影，而非 1px 实线
- 动效 `cubic-bezier(.4,0,.2,1)`，时长 100/200/300ms
- 字体栈与 DSH 完全一致

在 DSH 之外补充的部分，均为有据可查的中文长文阅读参数：正文 17px / 行高 1.75、
正文列宽上限 704px、`font-synthesis-weight: none`（避免中文伪粗体发糊）。

## 状态

- [x] 站点骨架、设计系统、浅色/深色主题
- [x] 第 1–4 节：动画 + 图文 + 可现场运行的实践面板（第一部完成）
- [x] 22 节路由；内容拆成 `src/content/units/NN.tsx`，可并行写稿
- [x] 浏览器端真实调用 DeepSeek 已端到端验证（CDP，HTTP 200）
- [ ] 第 5–22 节内容
- [ ] Pyodide 版 Python 原理演示
- [ ] Remotion 带旁白短片（关键节点 3–5 个）

### 演示参数的实测依据

`deepseek-flash` 是推理模型，会先产出思考 token 再给正文。
实测「要让我电脑里的文件真的被改掉，你需要什么」这道题：
`max_tokens=1200` 时思考把额度吃光，**正文完全为空**（`finish_reason=length`）；
`max_tokens=3000` 才拿到正文。所以各演示的 `max_tokens` 都按实测放宽，
而不是随手写个小值。

## 许可

代码 MIT；文字与图解 CC BY 4.0。
正文引用的第三方资料版权归原作者，本站只做摘要与链接。
