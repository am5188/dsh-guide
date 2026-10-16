/**
 * 站点的部署子路径。与 next.config.ts 里用的是同一个环境变量，
 * 这样本地用 NEXT_PUBLIC_BASE_PATH= 开发时，静态资源路径也跟着对。
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/dsh-guide";
