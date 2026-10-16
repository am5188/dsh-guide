# 关键节点短片

站点的科普层以**网页内交互动画**为主体（`src/components/anim/`）；
这里放的是少数关键节点的**带旁白短片**，用 Remotion 渲染成 mp4，
方便转发到群里或贴进 PPT。

本目录与站点**分开管理**：它有自己的 `package.json`，
不会增加站点 `npm install` 的体积。

## 依赖

- Node.js ≥ 20
- 首次需要下载两样东西（都需要联网）：
  - `npm install` → Remotion 相关包（约 255 个）
  - `npx remotion browser ensure` → Chrome Headless Shell（约 120 MB）

渲染由 Remotion 自带的合成器完成，**不需要系统安装 ffmpeg**。

## 旁白

旁白用 **Windows 自带的中文语音离线合成**（`Microsoft Huihui Desktop`，zh-CN），
不联网、不装任何 Python 包。

```powershell
# 注意：PowerShell 默认禁止运行脚本，需要加 -ExecutionPolicy Bypass
pwsh -ExecutionPolicy Bypass -File scripts/narration.ps1
```

脚本会把四段旁白写到 `public/audio/*.wav`，并打印每段时长。
**时长变了就要同步改 `src/TheWall.tsx` 里的场景边界常量**（`S1`–`S4`）。

如果这台机器没有这个语音，先查：

```powershell
Add-Type -AssemblyName System.Speech
(New-Object System.Speech.Synthesis.SpeechSynthesizer).GetInstalledVoices() |
  ForEach-Object { $_.VoiceInfo.Name + ' | ' + $_.VoiceInfo.Culture }
```

## 渲染

```bash
npx remotion still the-wall out/frame-100.png --frame=100   # 先出一帧看效果
npx remotion render the-wall out/the-wall.mp4               # 渲染全片
npx remotion studio                                         # 打开可视化编辑器调画面
```

## 现有片子

### `the-wall`（约 48.5 秒）

第 1 节的核心隐喻：模型只会说，中间隔着一道它自己过不去的墙，
墙外面站着 Harness。

| 场景 | 帧区间（30fps） | 旁白 |
|---|---|---|
| 1 它只会说 | 0–319 | `model.wav` |
| 2 它碰不到你的电脑 | 319–705 | `cannot.wav` |
| 3 中间那道墙 | 705–939 | `wall.wav` |
| 4 墙外有人 | 939–1455 | `harness.wav` |

画面尺寸 1920×1080、30fps。配色沿用站点的 DSH 深色令牌
（`#151517` / `#232324` / 强调色 `#7aaaff`）。

## 加新片子

1. 在 `src/` 下新建合成组件
2. 在 `src/Root.tsx` 里注册 `<Composition />`（要有唯一的 `id`）
3. 用 `scripts/narration.ps1` 的同样方式生成旁白，把时长换算成帧数写进场景边界
4. `npx remotion render <id> out/<name>.mp4`

## 成品放哪

渲染产物默认在 `out/`（已在 `.gitignore` 里，不入库）。
要嵌进站点的话，把它复制到站点的 `public/videos/`，
再用 `<video controls src="/dsh-guide/videos/xxx.mp4" />` 引用。
