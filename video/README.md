# 短片制作说明

站点的科普层以**网页内交互动画**为主体（`src/components/anim/`）；
这里放的是关键节点的**带旁白短片**，用 Remotion 渲染成 mp4。

本目录与站点**分开管理**：有自己的 `package.json`，
不会增加站点 `npm install` 的体积。

---

## 一、这套管线解决什么问题

| 问题 | 做法 |
|---|---|
| 旁白太机械 | 用 Edge 的**在线神经语音**（`msedge-tts`），不是 Windows 自带的拼接式语音 |
| 镜头边界要手改 | 旁白时长自动生成 `src/narration.json`，合成读它算镜头，**改台词不用改代码** |
| 音效要下载素材 | 一部分用 Remotion 官方音效（已下载到 `public/sfx/` 离线保存），一部分用 numpy 合成 |
| 渲染要装 ffmpeg | 不需要。Remotion 自带合成器 |
| 画面「像 PPT」 | 见下面第三节的运动与质感规则 |

## 二、目录

```
video/
├── scripts/
│   ├── tts.mjs        生成旁白 mp3 + src/narration.json（在线神经语音）
│   ├── sfx.py         用 numpy 合成 hit / riser / tick / pad（离线）
│   └── narration.ps1  旧版：Windows 自带语音（音质差，保留作为无网兜底）
├── public/
│   ├── audio/         旁白（tts.mjs 产出，入库）
│   └── sfx/           音效（Remotion 官方素材 + sfx.py 产出，入库）
├── src/
│   ├── narration.json 时长表（tts.mjs 产出）
│   ├── timing.ts      由时长表算镜头边界
│   ├── motion.tsx     （已并入 TheWall.tsx）
│   ├── TheWall.tsx    主合成
│   ├── Root.tsx       注册 Composition
│   └── index.ts       Remotion 入口
└── out/               渲染产物（gitignore）
```

## 三、画面规则（照着这些改，才不像 PPT）

这些规则来自对优秀解释视频的调研，**是本项目刻意遵守的**：

1. **镜头 2.5–5 秒一个**。11 个镜头 / 41 秒。静态画面不超过 1.5 秒。
2. **缓动用 Material 3 的真实 token 值**，不用默认 ease：
   - 入场 `cubic-bezier(.05,.7,.1,1)`
   - 出场 `cubic-bezier(.3,0,.8,.15)`
   - 通用移动 `cubic-bezier(.2,0,0,1)`
   - **linear 只用于匀速过程**（粒子漂移、扫光），动作绝不用 linear
3. **元素出场错开 30–80ms**（约 2 帧），不要全部同时动。
4. **同一物体全程连续运动**：模型光点和那道墙渲染在所有 `Sequence` 之外，
   用关键帧轨道插值 x/y/scale，**永不重新挂载**。消失再出现是最伤的一处。
5. **每个镜头至少有一个匀速变化量**（背景粒子漂移、扫光）。
6. **三层纵深**：背景（渐变 + 粒子）/ 中景（主体）/ 前景（暗角 + 颗粒 + 扫光）。
7. **质感层参数**：暗角 0.28–0.5、颗粒不透明度 0.07、扫光 0.05、辉光两层（亮核 + 宽晕）。
8. **配色只用 5 个**：石墨黑底 / 中性面 / DeepSeek 蓝（模型与 Harness）/ 琥珀（只给那道墙）/ 绿（只在“通了”那一刻）。
9. **转场只两种**，各自绑定一个含义：镜头内的连续位移（默认）、撞击时的闪光扩张（强调）。
10. **声音**：垫乐 0.16、旁白 1.0、音效 0.28–0.62。位移配 whoosh、撞击配 hit、文字配 tick、升级配 riser。

## 四、改旁白 / 加镜头

```bash
# 1. 改 scripts/tts.mjs 里的 LINES（一「句」= 一「镜头」）
node scripts/tts.mjs          # 重新生成 mp3 与 narration.json
# 2. 合成会自动按新时长重排镜头，不需要改任何数字
npx remotion still the-wall out/check.png --frame=300   # 先看一帧
npx remotion render the-wall out/the-wall.mp4           # 渲染全片
npx remotion studio                                     # 可视化调试
```

## 五、环境准备

```bash
npm install
npx remotion browser ensure    # 下载 Chrome Headless Shell（约 120 MB，只需一次）
```

**注意**：`public/sfx/` 里的 Remotion 官方音效（whoosh / whip / switch /
mouse-click / ding / shutter-modern）原本是远程 URL，这里已下载到本地，
所以渲染**完全离线**。要新增官方音效时，从 `@remotion/sfx` 导出里取 URL 再下载。

`numpy` 用于 `scripts/sfx.py`。DSH 自带的 Python 里有：
`C:\Users\<你>\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe`。

## 六、现有片子

### `the-wall`（约 48.6 秒，11 个镜头 + 2 个插入镜头）

第 1 节的核心隐喻：模型只会说，中间隔着一道它自己过不去的墙，
墙外面站着 Harness。

| 镜头 | 旁白 | 画面在动什么 |
|---|---|---|
| 1 | 这是一台大模型。 | 光点出现，镜头缓推 |
| 2 | 你给它文字，它接着往下写…… | 文字流进、文字流出，逐字错开 |
| 3 | 但你说：帮我把 D 盘里的发票重命名。 | 对话气泡升起落位 |
| 4 | 它只能给你一段说明。 | 说明卡片逐行落位 |
| 5 | 因为它碰不到你的电脑。 | 右侧文件出现，镜头右移 |
| 6 | 模型和你的电脑之间，隔着一道墙。 | 琥珀色的墙从中心生长 |
| 7 | 这道墙，它自己过不去。 | 光点冲向墙、被弹回、撞击环扩散 |
| 8 | 墙外面，站着另一样东西。 | 蓝带出现，墙淡到 20% |
| 9 | 它替模型记住，替它动手，替它把关。 | 三块能力标签依次落位 |
| 10 | 它叫 DeepSeek Harness。 | 名字牌放大落位 |
| 11 | 模型负责想，它负责让想，真的发生。 | 墙裂开，光点穿过去，文件变绿 |

### 节奏设计：为什么不是「11 个一样长的镜头」

调研指出，**镜头长度完全均匀会产生"等间隔软切"的节奏疲劳**——
每个镜头都是"新元素缓入 + 缓出"，看久了就麻木。
所以时间轴刻意做了三种变化，全部在 `src/timing.ts` 里声明：

| 手法 | 位置 | 参数 |
|---|---|---|
| **长镜头**（让观众喘气） | 第 5 句「因为它碰不到你的电脑」 | `EXTRA_HOLD = { 4: 100 }`，加长到约 6.2 秒 |
| **插入镜头 ×2**（真正的硬切） | 第 6 句之后、第 10 句之后 | `INSERTS`，各约 1.1 / 1.0 秒 |
| **结尾静默停留** | 全片最后 | `END_HOLD_FRAMES = 75`（2.5 秒） |

**插入镜头怎么实现的**：`timing.ts` 把时间轴建模成 `segments`（段），
一段要么是 `shot`（带旁白），要么是 `insert`（不带旁白）。
插入镜头是**全屏特写**——画面整个换掉、贯穿物体也不出场，
所以它就是一刀硬切，而且不占旁白时间。

> 注意：引用插入镜头要**按 id 查**（`insertAt("wall-detail")`），
> 不要写数组下标。加一段就会错位，这个坑已经踩过一次。

### 事件表：画面与音效共用帧号

`EVENTS` 把关键帧集中定义，**画面关键帧和音效都读它**：

```ts
const EVENTS = {
  travel:   at(6, 0.3),    // 光点冲到墙前
  impact:   at(6, 0.34),   // 撞击：挤压峰值与 hit 音效必须同一帧
  wallRise: at(5, 0.02),
  bandIn:   at(7, 0.62),
  nameIn:   at(9, 0.3),
  doorOpen: at(10, 0.16),
  filesLit: at(10, 0.52),
};
```

以前画面写 `at(6,0.32)`、音效写 `at(6,0.36)`，是两套手写数字，改一个必漏另一个。

### 声音层次

| 层 | 音量 | 作用 |
|---|---|---|
| 旁白 | 1.0 | 主线 |
| 垫乐 `pad.wav` | 0.17 → **0.055**（旁白期间） | `duckPad()` 做避让，前后各留渐变 |
| 底噪 `roomtone.wav` | 0.05 | 句与句之间不再是数字静音，听感不"干" |
| 音效 | 0.28–0.62 | whoosh 配位移、hit 配撞击、tick 配文字、whip 配硬切、riser 配升级 |

垫乐与底噪都用 numpy 合成（`scripts/sfx.py`），不依赖任何下载素材。

## 七、已知未做

- 没有用 three.js。调研结论是：这个题材里只有「上下文窗口溢出」那类
  **海量粒子 + 真纵深**的画面才值得引入（约 150–200 KB gzip），其余 Canvas/CSS 更划算。
- 没有做多语言版本。
