#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把标准日报 markdown 转成 content/digest/YYYY-MM-DD.json。

输入格式（新闻摘要智能体的固定输出）：

    # AI行业资讯摘要（YYYY-MM-DD）
    > 汇总AI领域近期行业动态、技术进展与产业新闻

    ## 资讯1
    **标题**：xxx
    **发布时间**：YYYY-MM-DD
    **摘要**：xxx
    **来源**：[来源名称](https://xxx)

用法: python3 scripts/md2digest.py <digest.md> [repo_root]
"""
import json
import re
import sys
from pathlib import Path

RE_DAY = re.compile(r"^#\s*AI行业资讯摘要[（(](\d{4}-\d{2}-\d{2})[)）]")
RE_TITLE = re.compile(r"^\*\*标题\*\*[：:]\s*(.+)$")
RE_DATE = re.compile(r"^\*\*发布时间\*\*[：:]\s*(.+)$")
RE_SUMMARY = re.compile(r"^\*\*摘要\*\*[：:]\s*(.+)$")
RE_SOURCE = re.compile(r"^\*\*来源\*\*[：:]\s*\[([^\]]+)\]\((https?://[^)\s]+)\)")


def convert(md_text: str) -> dict:
    day = None
    items = []
    cur = None

    def flush():
        nonlocal cur
        if cur is not None:
            items.append(cur)
            cur = None

    for line in md_text.splitlines():
        s = line.strip()
        if not s:
            continue
        m = RE_DAY.match(s)
        if m:
            day = m.group(1)
            continue
        if s.startswith("## "):
            flush()
            cur = {"n": 0, "title": "", "date": "", "summary": "", "sourceName": "", "sourceUrl": ""}
            continue
        if cur is None:
            continue
        for key, rx in (("title", RE_TITLE), ("date", RE_DATE), ("summary", RE_SUMMARY)):
            m = rx.match(s)
            if m and not cur[key]:
                cur[key] = m.group(1).strip()
        m = RE_SOURCE.match(s)
        if m:
            cur["sourceName"] = m.group(1).strip()
            cur["sourceUrl"] = m.group(2).strip()
    flush()

    for i, it in enumerate(items, 1):
        it["n"] = i

    if day is None:
        day = max((it["date"] for it in items), default=None)

    return {"date": day, "items": items}


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        return 1
    md_path = Path(sys.argv[1])
    repo_root = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent

    data = convert(md_path.read_text(encoding="utf-8"))

    problems = []
    if not data["date"] or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", data["date"] or ""):
        problems.append("无法识别期数日期（首行应为 # AI行业资讯摘要（YYYY-MM-DD））")
    if not data["items"]:
        problems.append("未解析到任何资讯条目")
    for it in data["items"]:
        if not it["title"]:
            problems.append(f"条目{it['n']}缺少标题")
        if not it["date"]:
            problems.append(f"条目{it['n']}缺少发布时间")
        if not it["summary"]:
            problems.append(f"条目{it['n']}缺少摘要")
        if not it["sourceUrl"]:
            problems.append(f"条目{it['n']}缺少来源URL")
    if problems:
        for p in problems:
            print(f"错误：{p}", file=sys.stderr)
        return 1

    out_dir = repo_root / "content" / "digest"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{data['date']}.json"
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"已生成 {out}（{len(data['items'])} 条）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
