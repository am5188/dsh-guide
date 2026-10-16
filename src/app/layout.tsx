import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepSeek Harness 使用指南 · 从零开始",
  description:
    "面向零基础普通人的 DeepSeek Harness 中文指南：23 节，把「让 AI 真的把活干完」这件事讲清楚。每一节都有动画、图文和可以当场跑通的代码。",
  applicationName: "DeepSeek Harness 使用指南",
  keywords: ["DeepSeek Harness", "DSH", "AI 智能体", "新手教程", "使用指南"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#151517" },
  ],
};

/**
 * 在首帧之前定好主题，避免闪白/闪黑。
 * 与 DSH 一致：浅色为基准，深色用 data-theme="dark" 覆盖。
 */
const THEME_INIT = `(function(){try{
var k='dsh-guide:theme';
var t=null;
try{var q=new URLSearchParams(location.search).get('theme');
if(q==='light'||q==='dark'){t=q;}}catch(e){}
if(t!=='light'&&t!=='dark'){t=localStorage.getItem(k);}
if(t!=='light'&&t!=='dark'){
  t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
}
if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
