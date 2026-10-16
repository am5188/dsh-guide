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

## 8. 写内容时的两条纪律

1. **演示输出必须真跑过**。`demos` 里的 `prompt` 与 `python` 里的 `code`，
   都要真的执行一遍再放进去。推理模型的思考也占额度，
   `maxTokens` 给小了会得到空回答（实测：同一道题 1200 时正文为空、3000 才有内容）。
2. **不确定的一律用 `<Unverified>` 标注**，写清哪一部分没核实、为什么。
   全书已经用这个组件标了多处。

## 9. 循环动画怎么验证无缝

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


