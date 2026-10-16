# 构建与发布

本文档里的每条命令都在本机实际跑过。**未验证的步骤会明确标注。**

## 1. 环境要求

| 项 | 要求 | 本机实测版本 |
|---|---|---|
| Node.js | ≥ 20.9（`package.json` 的 `engines`） | v26.8.1 |
| 包管理器 | npm（仓库带 `package-lock.json`） | 11.x |
| 操作系统 | Windows（本指南只讲 Windows） | Windows x64 |
| 部署脚本 | 需要 bash（Windows 上用 Git Bash） | `C:\Program Files\Git\bin\bash.exe` |

> 如果你用 DSH 自带的运行时，Node 与 pnpm 路径由 `load_workspace_dependencies` 提供；
> 但本仓库用 npm 即可，不需要 pnpm。

## 2. 安装与本地开发

```bash
npm install
npm run dev            # http://localhost:3000/dsh-guide/
```

本地想在根路径开发（不要 `/dsh-guide` 前缀）：

```bash
NEXT_PUBLIC_BASE_PATH= npm run dev
```

> Windows cmd/PowerShell 里设置空环境变量的写法不同，直接用上面的 bash 形式最省事。

## 3. 构建

```bash
npm run build
```

产物是**纯静态文件**，在 `out/` 目录。构建同时会跑 TypeScript 检查，
类型错误会让构建失败。

验证构建结果：

```bash
ls out/index.html          # 首页
ls out/u/1/index.html      # 第 1 节
ls out/u/22/index.html     # 第 22 节
```

`out/` 里应当有 **25 个页面**（首页 + 404 + 22 节）。

本地预览构建产物（因为用的是 `basePath`，要模拟子路径）：

```bash
mkdir -p /tmp/preview/dsh-guide
cp -r out/* /tmp/preview/dsh-guide/
cd /tmp/preview && python -m http.server 8970
# 打开 http://127.0.0.1:8970/dsh-guide/
```

## 4. 发布到 GitHub Pages

```bash
npm run deploy         # = bash scripts/deploy.sh
```

脚本做四件事：构建 → 写 `.nojekyll` → 在 `out/` 里初始化 gh-pages 分支并提交 →
强制推送到 `origin` 的 `gh-pages` 分支。

推送完成后，仓库的 Pages 需要指向 `gh-pages` 分支（只需设置一次）：

```bash
gh api -X POST repos/am5188/dsh-guide/pages \
  -f source.branch=gh-pages -f source.path=/
```

之后每次 `npm run deploy` 都会自动更新：

**https://am5188.github.io/dsh-guide/**

## 5. 主题与调试参数

| 参数 | 作用 |
|---|---|
| （默认） | 跟随操作系统深浅色 |
| `?theme=dark` | 强制深色 |
| `?theme=light` | 强制浅色 |

读者的选择会存在浏览器 `localStorage` 的 `dsh-guide:theme` 键里。

## 6. 可试运行代码是怎么工作的

两套，都不需要后端：

**JavaScript 版**（`src/components/Playground.tsx`）
读者在自己浏览器里 `fetch` 到 `https://api.deepseek.com/chat/completions`。
DeepSeek 的 CORS 允许浏览器直连（开发时用预检请求实测过：
返回 `access-control-allow-origin: <你的站点>`、`allow-methods: POST`、
`allow-headers: authorization,content-type`）。

**Python 版**（`src/components/PythonPlayground.tsx`）
用 CDN 上的 Pyodide 在浏览器里跑真 Python，再装 `requests` 与 `pyodide-http`
把 `requests` 接到浏览器的 `fetch` 上。首次约需下载 10MB，
用「加载 Python 环境」按钮显式触发，不会拖慢首屏。

API Key 只存在读者自己的 `localStorage`（键 `dsh-guide:api-key`），
不经过任何中间服务器，也不进构建产物。

> **排查**：如果接不上，先确认两件事——
> ① `https://cdn.jsdelivr.net` 与 `https://api.deepseek.com` 能访问；
> ② Key 是否有效（无效会返回 HTTP 401，界面会显示服务器原话）。

## 7. 内容怎么加

每节一个文件：`src/content/units/NN.tsx`，默认导出 `UnitContent`。
写完在 `src/content/index.ts` 里登记一行即可。

类型定义在 `src/content/types.ts`：

| 字段 | 对应界面上的哪一段 |
|---|---|
| `anim` / `animTitle` | 🎬 先看一眼 |
| `theory` | 📐 到底怎么回事 |
| `demos` | ⌨️ 浏览器里真实调用（JS） |
| `python` | ⌨️ 浏览器里真跑 Python |
| `commands` | ⌨️ 本地 DSH 命令 |

**没登记的节会自动显示占位说明**，不会报错。

## 8. 线上验收：跑真实浏览器验证

`curl` 只能证明文件能下载，证明不了"动画在动""点了按钮有反应"。
`scripts/verify-live.mjs` 用 Edge 的远程调试接口（CDP）打开线上页面，
在页面里执行真实 JS 取值，**不需要任何额外依赖**（Node 22+ 自带 fetch 与 WebSocket）。

```bash
node scripts/verify-live.mjs                        # 验线上
node scripts/verify-live.mjs http://127.0.0.1:8980  # 验本地静态产物
```

它检查 12 项：

| 检查 | 手段 |
|---|---|
| canvas 存在 | 读元素的显示尺寸与数量 |
| **动画确实在动** | 间隔 1.2 秒取两次 `toDataURL()`，比对是否变化 |
| **离屏动画要滚进视口再取样** | 动画在视口外会主动暂停（省电），不滚动会被误判成"没动" |
| 有无障碍描述 | 读 `aria-label` |
| 短片确实已下线 | 检查页面上没有 `video` 元素 |
| 实践面板已渲染 | 读面板文案 |
| **点「看原始 JSON」有反应** | 真的 `click()`，再检查 `model` / `messages` / `role` / `max_tokens` 是否出现 |
| 工具调用回路已渲染 | 读第 4 节文案 |
| 第 23 节可访问 | 读 `h1` 文本 |
| 第 23 节有动画 | 检查 `figure`（动画有两种实现：Canvas 2D 与 DOM 编排） |
| 目录列出 23 节 | 统计 `a[href*="/u/"]` 去重后的数量 |
| **逐节扫描：每节动画都在动** | 逐节导航、把每个 canvas 滚进视口、多次重试取样 |

**踩过的坑**：最初把检查写成"页面上有没有某个字符串"，结果三次误报——
一次是文案记错了（实际是"这次真正发出去的请求体（原文）"），
一次是把 DOM 编排动画误判成"没有动画"，一次是没滚动就取样、
把"离屏暂停"误判成"动画坏了"。
**结论：验收要检查行为，不要检查字符串；要模拟真实动作，不要假设元素一直在跑。**

### 逐节扫描必须小批量跑

同一个 headless 浏览器**连续导航几节之后就会退化**：后面的小节会出现
"canvas 在动 0" 的假阴性。实测**每批 3–4 节最稳**；一批 8 节必然会有一两节假阴性。

所以逐节扫描要分区间跑，每批重启浏览器：

```bash
for r in 1-4 5-8 9-12 13-16 17-20 21-23; do
  node scripts/verify-live.mjs https://am5188.github.io/dsh-guide $r
done
```

第三个参数支持单节（`15`）或区间（`1-4`）。

**怎么区分「站点真有问题」和「浏览器累了」**：把可疑的那一节单独跑一遍。
本项目实测第 6、7、8、12、14、15、16、23 节都曾在批量扫描里报失败、
单独跑或小批量跑全部通过 —— 是假阴性，不是缺陷。

## 9. 写内容时的两条纪律

1. **演示输出必须真跑过**。`demos` 里的 `prompt` 与 `python` 里的 `code`，
   都要真的执行一遍再放进去。推理模型的思考也占额度，
   `maxTokens` 给小了会得到空回答（实测：同一道题 1200 时正文为空、3000 才有内容）。
2. **不确定的一律用 `<Unverified>` 标注**，写清哪一部分没核实、为什么。
   全书已经用这个组件标了多处。

### `max_tokens` 怎么定（这条曾经踩过大坑）

`max_tokens` 是**上限不是预留**——答案短就只按实际输出计费，调高不花钱。
所以它的作用只有一个：**给思考留够余量，别让思考把额度吃光、正文变空**。

**踩过的坑**：全书 37 条演示一度都用 2500–4000。
用 `scripts/check-demos.mjs` 真跑一遍才发现，**其中 12 条返回的是空正文**
（`finish_reason=length`，思考 token 把额度吃满，一个字都没留给正文）。
读者点下去只会看到一片空白——这是最伤信任的一种错。

修法：把 37 条**统一提到 16000**（再跑一遍，0 条为空）。

实测的思考 token 跨度（同一批 37 条提示词）：

| | 思考 token |
|---|---|
| 最少 | 38 |
| 中位 | ~2,900 |
| 最多 | **11,366** |

也就是说，**最重的提示词需要 1 万以上**，4000 根本不够。

### 三个检查脚本

```bash
$env:DSH_KEY = (Get-Content D:\Work\.secrets\dsh-guide-test-key.txt -Raw).Trim()

node scripts/check-demos.mjs                 # 37 条 JS 演示真跑一遍
node scripts/check-demos.mjs --dry           # 只抽取不发请求，确认提示词抠对了
node scripts/check-demos.mjs 1 23 --override=16000 --only=4,6,21   # 指定额度/章节压测

node scripts/check-python-demos.mjs          # 3 条 Python 演示（从代码里抠请求体）
node scripts/check-python-demos.mjs --dry

node scripts/check-agent-demo.mjs 16000      # 工具调用回路：两轮都要跑通
```

- `check-demos.mjs` / `check-python-demos.mjs` 打印 `finish_reason`、思考 token、
  正文长度——**正文 0 字就是踩雷了**
- `check-agent-demo.mjs` 更严：它要求**第一轮真的返回 `tool_calls`**、
  第二轮给出最终答案，而且答案里的数量要对得上（否则演示本身就是错的）

**抽取提示词时的坑（踩过两次）**：
1. TSX 里 `prompt` 有双引号和单引号两种写法，正则只认双引号会「张冠李戴」——
   把上一条的 id 和下一条的 prompt 配成一对，用错提示词去测，等于白测
2. Python 里 `"content"` 可能是字符串，也可能是**括号里若干相邻字面量拼接**，
   两种都要认

### 演示额度的最终取值

| 位置 | 值 | 为什么 |
|---|---|---|
| JS 演示（37 条） | 16000 | 实测思考量最高 11366，4000 会返回空正文 |
| Python 演示（3 条） | 4000 | 实测思考量 ≤298，但代码对读者可见，取一个读起来合理的值 |
| AgentLoop（工具调用） | 16000 | 实测思考量只有 24–88，但组件内不可见，给足余量 |

**实测思考量跨度：最少 38，最多 11366。** 所以「按感觉给个 2000」一定会出问题。


## 10. 量「读者要读多少字」

改造目标是「动画为主、文字为辅」，所以需要一个**能变好也能变坏**的硬指标，
而不是数动画个数。用 `scripts/prose-stats.mjs`：

```bash
node scripts/prose-stats.mjs          # 量当前工作区
node scripts/prose-stats.mjs 8406ffa^ # 量某个 git 版本，用于前后对比
```

它数两样东西：**`<p>` 正文** + **动画 caption**。两个都算，因为
第一轮改造的教训正是——加了 24 个动画，读者要读的字反而多了 11%，
解释只是从正文搬到了 caption 里。

**踩过的坑**：段落正则是 `<p(?:\s[^>]*)?>`，不能写成 `<p[^>]*>` ——
后者会把 `<pre>` 代码块也匹配进来，把代码字数算成正文（一度让统计虚高）。

### 已经做过的三次减法（实测数字）

| | `<p>` 正文 | caption | 读者要读 |
|---|---|---|---|
| 动画改造前 | 7,739 | 1,299 | **9,038** |
| 加完 24 个动画（但没删文字） | 7,622 | 2,619 | 10,241 ← 变差了 |
| 去掉图解 caption + 逐节删冗余段落 | 6,812 | 478 | 7,290 |
| 压短各节「实践引子」 | 5,717 | 478 | **6,195（−31.5%）** |

**结论：加图不等于减字。** 每加一张图，都要问一句「这张图替掉了哪段文字」，
答不上来就是净增负担。

`practiceIntro` 是隐藏的大块头：23 节合计 1,998 字，压成一句话后只剩 518 字。

## 11. 布局检查：不要相信 `--window-size` 截出来的移动端

**踩过的坑**：用 `msedge --headless --window-size=390,1500` 截移动端，
截出来的图看起来「内容横向溢出、文字被截断」，我一度以为移动端坏了。

实际上**站点没问题**。`--window-size` 只是改窗口大小，
**不会应用 `width=device-width`**——页面仍按桌面宽度排版，截图只截到左侧一条。

正确做法：用 CDP 先设设备度量，再截图。`scripts/find-overflow.mjs` 已经做了这件事：

```bash
node scripts/find-overflow.mjs <url> 390 1600 out.png
```

它会：
1. `Emulation.setDeviceMetricsOverride({ mobile: true })` 正确模拟移动端
2. 列出所有**右边缘超出视口**的元素（横向溢出的真正判据）
3. `Page.captureScreenshot` 存一张可信的移动端截图

**判据用 `document.documentElement.scrollWidth` 有没有超出视口，
不要用截图肉眼看。** 截图会骗你，scrollWidth 不会。

### 全站布局体检

`scripts/check-layout.mjs` 把这条判据铺到全站：

```bash
npm run check:layout                      # 默认验本地 9020 端口
node scripts/check-layout.mjs <baseUrl>
```

它跑 **24 个页面（首页 + 23 节）× 4 个视口宽度（360 / 390 / 768 / 1280）= 96 次检查**，
每次读 `scrollWidth` 并列出所有右边缘超出视口的元素。
每 8 次导航换一个浏览器进程，避免长时间运行退化。

**当前结果：96 次检查，横向溢出 0 次。**

## 12. 循环动画怎么验证无缝

循环动画最容易出的问题是**循环点跳变**——尤其是粒子取模、扫光周期、拖尾相位
这几处不显眼的地方。要用可复现的方式验，而不是"看着像无缝"。

### 为什么不能用截图对比时间

用 headless 浏览器的 `--virtual-time-budget` 截两张相差一个周期的图**是不可靠的**：
虚拟时间预算与 `requestAnimationFrame` 实际帧数不是精确对应，
两帧的相位差本身就有随机偏移，差异百分比说明不了问题。

### 正确做法：把动画冻结在指定帧

`AnimStage` 支持一个测试钩子：

```
http://localhost:3000/dsh-guide/u/1/?animframe=0
http://localhost:3000/dsh-guide/u/1/?animframe=300
```

`?animframe=N` 会把动画冻结在第 N 帧（不带这个参数时没有任何影响）。
于是验证就变成了一个确定性命题：**渲染第 0 帧和第 300 帧，两图应逐像素相同**。

参考实现（Pillow）：

```python
from PIL import Image, ImageChops
a = Image.open("f000.png").convert("RGB").crop((0, 330, 1200, 640))
b = Image.open("f300.png").convert("RGB").crop((0, 330, 1200, 640))
d = ImageChops.difference(a, b)
h = d.histogram()
total = 1200 * 310 * 3
diff = sum(h[1:256]) + sum(h[257:512]) + sum(h[513:768])
print(f"{diff} / {total} = {diff/total*100:.4f}%")   # 期望 0.0%
```

**本项目的实测结果：`f000` vs `f300` = 0 个通道不同（0.0%）**，
而 `f000` vs `f150` = 10.4%（不同相位，本应有差异）。这证明循环是精确无缝的。

### 写循环动画时的三条约束

只要违反其中一条，上面那个测试就会失败：

1. **所有周期量必须由整数帧计数驱动**，不能用浮点秒数。
   `AnimStage` 传进来的 `t` 是 `frameCount / 60`，帧计数是整数累加，不漂移。
2. **周期内必须走整数个循环**。粒子位移要在一个周期内正好平移整数个屏高；
   扫光要在周期内走整数趟；呼吸频率要能整除周期。
3. **相位取模要环绕**。例如拖尾取 `p - delta`，必须先 `((p - delta) % 1 + 1) % 1`，
   否则循环点处变负会被跳过，拖尾突然消失——那就是一道可见的缝。

## 13. 发版前的检查清单

改完内容之后，按这个顺序跑。**前两条不需要网络，后三条需要 `DSH_KEY`。**

```bash
npm run build                 # 1. 必须过
npm run check:layout          # 2. 24 页 × 4 个宽度，横向溢出必须为 0
                              #    （需要本地静态服务，见下）

$env:DSH_KEY = (Get-Content D:\Work\.secrets\dsh-guide-test-key.txt -Raw).Trim()
npm run check:content         # 3. 41 条演示（37 JS + 3 Python + 1 工具调用）真跑一遍
                              #    任何一条正文为空就是踩雷
npm run check:prose           # 4. 读者要读多少字（改内容后看一眼有没有反弹）
npm run verify                # 5. 线上真实浏览器：动画在动、实践面板有反应

# 布局体检要有一个本地静态服务：
cd out && python -m http.server 9020    # 另开一个终端
node scripts/check-layout.mjs http://127.0.0.1:9020/dsh-guide
```

**为什么第 3 条不能省**：这一条曾经一次抓出 **12 条返回空正文的演示**——
`max_tokens` 给小了，思考 token 把额度吃光，读者点下去只能看到一片空白。
**光看代码是发现不了的。**

可用的脚本一览：

| 命令 | 查什么 |
|---|---|
| `npm run check:layout` | 全站横向溢出（96 次检查） |
| `npm run check:content` | 41 条演示能不能返回非空正文 |
| `npm run check:demos` | 只查 37 条 JS 演示 |
| `npm run check:python` | 只查 3 条 Python 演示 |
| `npm run check:agent` | 工具调用回路两轮都要跑通 |
| `npm run check:prose` | 读者要读多少字 |
| `npm run check:fat` | 列出所有 ≥N 字的段落，便于规划删减 |
| `npm run verify` | 线上真实浏览器验收 |
| `npm run check:token-ratio` | 实测中文 token 换算比例 |

### 一条教训

这一轮里有三次「改文档反而把文档改坏」：用 PowerShell 的字符串替换修改
Markdown 标题，把 `\n` 写成了字面量、把下一个标题吃掉。
**规则：源码与文档一律用编辑工具改，不要用 PowerShell 的字符串替换 + Set-Content。**


