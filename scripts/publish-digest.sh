#!/usr/bin/env bash
# 把一期日报 markdown 发布进仓库并推送到 origin/main（触发 CI + Vercel 自动部署）。
#
# 用法: bash scripts/publish-digest.sh <digest.md>
# 成功 exit 0；任何失败 exit 1 —— 调用方（每日10点自动化任务）应降级发布到本机
# 备用站点（bash /home/river/ai-news-digest/publish.sh）并在 issue 评论中告警。
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
MD="${1:?用法: publish-digest.sh <digest.md>}"

[ -f "$REPO/.ai-news-github-token" ] || { echo "错误：缺少 $REPO/.ai-news-github-token" >&2; exit 1; }
git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "错误：$REPO 不是 git 仓库" >&2; exit 1; }
[ -f "$MD" ] || { echo "错误：找不到 $MD" >&2; exit 1; }

python3 "$REPO/scripts/md2digest.py" "$MD" "$REPO"

DAY=$(grep -m1 -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' "$MD" | head -1)
[ -n "$DAY" ] || { echo "错误：无法从 $MD 识别日期" >&2; exit 1; }

git -C "$REPO" add "content/digest/$DAY.json"
if git -C "$REPO" diff --cached --quiet -- "content/digest/$DAY.json"; then
  echo "内容无变化，跳过提交与推送"
  exit 0
fi

git -C "$REPO" -c user.name="ai-news-agent" -c user.email="raugust910@gmail.com" \
  commit -m "news: digest $DAY"

export GIT_ASKPASS="$REPO/scripts/git-askpass.sh"
export GIT_TERMINAL_PROMPT=0
git -C "$REPO" push origin main

echo "已推送 $DAY → origin/main，CI 与 Vercel 将自动部署"
