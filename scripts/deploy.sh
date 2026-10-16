#!/usr/bin/env bash
# 构建静态站点并推送到 gh-pages 分支。
# Windows 上用 Git Bash 运行；CI 里用 ubuntu 即可。
set -euo pipefail

cd "$(dirname "$0")/.."

REPO_URL=$(git remote get-url origin)
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "==> 构建"
npm run build

# GitHub Pages 会忽略下划线开头的目录，必须放 .nojekyll
touch out/.nojekyll

echo "==> 推送到 gh-pages"
cd out
rm -rf .git
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.name="deploy" -c user.email="deploy@local" commit -qm "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ) from ${BRANCH}"
git push -f "$REPO_URL" gh-pages
cd ..

echo "==> 完成：https://am5188.github.io/dsh-guide/"
