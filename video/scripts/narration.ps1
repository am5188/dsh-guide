# 用 Windows 自带的中文语音离线生成旁白（不需要联网、不需要装任何包）。
# 用法：pwsh -File video/scripts/narration.ps1
# 输出：video/public/audio/*.wav，并打印每个片段的时长（秒）。

Add-Type -AssemblyName System.Speech

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$audioDir = Join-Path $root 'public\audio'
New-Item -ItemType Directory -Path $audioDir -Force | Out-Null

# 语速：-10 到 10。教学旁白稍慢一点更好跟。
$rate = 1
$voice = 'Microsoft Huihui Desktop'

$lines = [ordered]@{
  'model'   = '这是一台大模型。你给它文字，它接着往下写，写得又快又好。'
  'cannot'  = '但你说，帮我把 D 盘里的发票重命名。它只能给你一段说明，因为它碰不到你的电脑。'
  'wall'    = '模型和你的电脑之间，隔着一道它自己过不去的墙。'
  'harness' = 'DeepSeek Harness 就站在墙外面。它替模型记住，替它动手，替它把关。模型负责想，它负责让想真的发生。'
}

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$installed = $synth.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }
if ($installed -notcontains $voice) {
  throw "找不到语音 $voice。已安装：$($installed -join ', ')"
}
$synth.SelectVoice($voice)
$synth.Rate = $rate

$result = [ordered]@{}
foreach ($k in $lines.Keys) {
  $path = Join-Path $audioDir "$k.wav"
  if (Test-Path $path) { Remove-Item $path -Force }
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($lines[$k])
  $bytes = (Get-Item $path).Length
  # System.Speech 输出 16kHz / 16bit / 单声道 = 每秒 32000 字节（去掉 44 字节头）
  $seconds = [math]::Round(($bytes - 44) / 32000, 2)
  $result[$k] = $seconds
  "{0,-9} {1,6} 字节  {2,5} 秒" -f $k, $bytes, $seconds
}
$synth.Dispose()

$json = $result | ConvertTo-Json -Compress
"`n时长汇总（JSON）："
$json
