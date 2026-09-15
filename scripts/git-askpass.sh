#!/usr/bin/env bash
# GIT_ASKPASS 助手：git 需要凭据时从这里取，token 不进入 remote URL / 进程参数 / git config。
TOKEN_FILE="$(cd "$(dirname "$0")/.." && pwd)/.ai-news-github-token"

case "$1" in
  *sername*)
    echo "HeShen-1"
    ;;
  *)
    cat "$TOKEN_FILE"
    ;;
esac
