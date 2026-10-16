"""程序化合成短片要用的音效与背景垫乐（离线、可复现、无需下载素材）。

用到的库只有 numpy 与标准库 wave。
用法：python scripts/sfx.py
产出：public/sfx/{hit,riser,tick,pad}.wav

参数参考自调研结论（whoosh 用 Remotion 官方素材，这里补它没有的几种）：
- hit   : 正弦做指数下滑 180Hz→40Hz，包络 exp(-t/0.09)，前面叠 2ms 噪声瞬态
- riser : 噪声的高通部分，截止频率 200→6000Hz 指数上升，幅度 t^2
- tick  : 极短（12ms）的窄带噪声，衰减 8ms
- pad   : 背景垫乐，A 小调 i–VI–III–VII 四和弦循环，低通 + 缓慢起伏
"""

import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sfx")


def write_wav(name: str, data: np.ndarray, sr: int = SR) -> None:
    os.makedirs(OUT, exist_ok=True)
    data = np.clip(data, -1.0, 1.0)
    pcm = (data * 32767.0).astype(np.int16)
    path = os.path.join(OUT, name)
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
    print(f"  {name:12} {os.path.getsize(path):>7} 字节  {len(data)/sr:.2f} 秒")


def one_pole_lp(x: np.ndarray, cutoff: np.ndarray) -> np.ndarray:
    """时变一阶低通。cutoff 是每个采样点的截止频率（Hz）。"""
    a = np.exp(-2.0 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    prev = 0.0
    for i in range(x.size):
        prev = (1.0 - a[i]) * x[i] + a[i] * prev
        y[i] = prev
    return y


def env_ad(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-6), 0.0, 1.0)
    return a * np.exp(-t / max(decay, 1e-6))


def make_hit() -> None:
    dur = 0.24
    n = int(SR * dur)
    t = np.arange(n) / SR
    freq = 40.0 + 140.0 * np.exp(-t / 0.05)
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.exp(-t / 0.09)
    rng = np.random.default_rng(1)
    click = rng.normal(0.0, 1.0, n) * np.exp(-t / 0.002) * 0.35
    write_wav("hit.wav", body * 0.85 + click)


def make_riser() -> None:
    dur = 2.2
    n = int(SR * dur)
    t = np.arange(n) / SR
    rng = np.random.default_rng(2)
    noise = rng.normal(0.0, 1.0, n)
    cutoff = 200.0 * (6000.0 / 200.0) ** (t / dur)
    low = one_pole_lp(noise, cutoff)
    high = noise - low
    amp = (t / dur) ** 2
    # 轻微颤音，避免过于机械
    tremolo = 1.0 + 0.08 * np.sin(2.0 * np.pi * 9.0 * t)
    write_wav("riser.wav", high * amp * tremolo * 0.5)


def make_tick() -> None:
    dur = 0.03
    n = int(SR * dur)
    t = np.arange(n) / SR
    rng = np.random.default_rng(3)
    tone = np.sin(2.0 * np.pi * 2600.0 * t) * 0.6 + rng.normal(0.0, 1.0, n) * 0.4
    write_wav("tick.wav", tone * np.exp(-t / 0.008))


NOTES = {
    "A2": 110.00, "C3": 130.81, "E3": 164.81,
    "F2": 87.31, "F3": 174.61, "A3": 220.00,
    "C4": 261.63, "G2": 98.00, "B2": 123.47, "D3": 146.83,
    "E4": 329.63,
}

# A 小调：i – VI – III – VII
PROGRESSION = [
    ["A2", "C3", "E3", "A3"],
    ["F2", "F3", "A3", "C4"],
    ["C3", "E3", "C4", "E4"],
    ["G2", "B2", "D3", "G2"],
]


def voice(freq: float, n: int, detune_cents: float = 6.0) -> np.ndarray:
    """一路略失谐的谐波叠加，做成柔和的 pad 音色。"""
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k, gain in ((1, 1.0), (2, 0.32), (3, 0.14), (4, 0.07)):
        for cents in (-detune_cents, detune_cents):
            f = freq * k * (2.0 ** (cents / 1200.0))
            out += gain * np.sin(2.0 * np.pi * f * t + (k + cents) * 0.7)
    return out / 6.0


def make_pad(total_seconds: float = 46.0) -> None:
    n = int(SR * total_seconds)
    out = np.zeros(n)
    bar = total_seconds / 8.0  # 每个和弦两小节
    for i in range(8):
        chord = PROGRESSION[i % len(PROGRESSION)]
        start = int(i * bar * SR)
        end = min(n, int((i + 1) * bar * SR))
        seg = end - start
        if seg <= 0:
            continue
        t = np.arange(seg) / SR
        # 缓慢进出的包络，让和弦之间自然交叠
        fade = np.minimum(1.0, np.minimum(t / (bar * 0.35), (bar - t) / (bar * 0.35)))
        fade = np.clip(fade, 0.0, 1.0)
        chord_audio = np.zeros(seg)
        for name in chord:
            chord_audio += voice(NOTES[name], seg)
        chord_audio /= len(chord)
        out[start:end] += chord_audio * fade

    # 很轻的低频衬底
    t_all = np.arange(n) / SR
    out += 0.10 * np.sin(2.0 * np.pi * 55.0 * t_all)
    # 低通去掉刺耳高频
    out = one_pole_lp(out, np.full(n, 1400.0))
    # 整体起伏
    out *= 0.55 + 0.45 * (0.5 + 0.5 * np.sin(2.0 * np.pi * t_all / 17.0))
    write_wav("pad.wav", out * 0.30)


def make_roomtone(total_seconds: float = 46.0) -> None:
    """极低电平的底噪（room tone）。

    句与句之间原本是数字静音，听感很“干”、很合成；铺一层几乎听不见的底噪，
    整条声轨会立刻自然很多。它不该被“听到”，只该被“感觉不到”。
    """
    n = int(SR * total_seconds)
    rng = np.random.default_rng(7)
    noise = rng.normal(0.0, 1.0, n)
    low = one_pole_lp(noise, np.full(n, 320.0))
    t = np.arange(n) / SR
    swell = 0.8 + 0.2 * np.sin(2.0 * np.pi * t / 23.0)
    write_wav("roomtone.wav", low * swell * 0.12)


if __name__ == "__main__":
    print("合成音效与垫乐：")
    make_hit()
    make_riser()
    make_tick()
    make_pad()
    make_roomtone()
    print("完成。")
