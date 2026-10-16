import type { NextConfig } from "next";

/**
 * 纯静态导出，托在 GitHub Pages 子路径上：
 *   https://am5188.github.io/dsh-guide/
 *
 * 本地想在根路径开发：NEXT_PUBLIC_BASE_PATH= npm run dev
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/dsh-guide";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
