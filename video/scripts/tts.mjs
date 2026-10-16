// 用 Edge 的在线神经语音生成旁白（比 Windows 自带的拼接式语音自然得多）。
// 用法：node scripts/tts.mjs
// 产出：public/audio/<id>.mp3 + src/narration.json（含每句时长，供合成读取）

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import fs from "node:fs";
import path from "node:path";

const VOICE = process.env.DSH_TTS_VOICE ?? "zh-CN-XiaoxiaoNeural";
const RATE = process.env.DSH_TTS_RATE ?? "-6%";
const PITCH = process.env.DSH_TTS_PITCH ?? "-1Hz";

/** 一「句」= 一「镜头」。顺序就是成片顺序。 */
const LINES = [
  { id: "s01", text: "这是一台大模型。" },
  { id: "s02", text: "你给它文字，它接着往下写，写得又快又好。" },
  { id: "s03", text: "但你说：帮我把 D 盘里的发票重命名。" },
  { id: "s04", text: "它只能给你一段说明。" },
  { id: "s05", text: "因为它碰不到你的电脑。" },
  { id: "s06", text: "模型和你的电脑之间，隔着一道墙。" },
  { id: "s07", text: "这道墙，它自己过不去。" },
  { id: "s08", text: "墙外面，站着另一样东西。" },
  { id: "s09", text: "它替模型记住，替它动手，替它把关。" },
  { id: "s10", text: "它叫 DeepSeek Harness。" },
  { id: "s11", text: "模型负责想，它负责让想，真的发生。" },
];

const root = path.resolve(process.cwd());
const audioDir = path.join(root, "public", "audio");
fs.mkdirSync(audioDir, { recursive: true });

const out = [];

for (const line of LINES) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(line.text, {
    rate: RATE,
    pitch: PITCH,
  });

  const chunks = [];
  for await (const c of audioStream) chunks.push(c);
  const buf = Buffer.concat(chunks);

  const file = `${line.id}.mp3`;
  fs.writeFileSync(path.join(audioDir, file), buf);

  // 48kbps CBR 单声道：字节数 × 8 / 48000 ≈ 秒数（留出容差，合成时会再加尾部停顿）
  const seconds = Number(((buf.length * 8) / 48000).toFixed(2));
  out.push({ id: line.id, text: line.text, file, seconds, bytes: buf.length });
  console.log(
    `${line.id}  ${String(seconds).padStart(5)}s  ${String(buf.length).padStart(6)}B  ${line.text}`,
  );
}

fs.writeFileSync(
  path.join(root, "src", "narration.json"),
  JSON.stringify({ voice: VOICE, rate: RATE, pitch: PITCH, lines: out }, null, 2),
);

const total = out.reduce((a, b) => a + b.seconds, 0);
console.log(`\n共 ${out.length} 句，旁白总长 ${total.toFixed(1)} 秒`);
console.log(`时长表已写入 src/narration.json`);
