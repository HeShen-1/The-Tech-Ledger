# Changelog

All notable changes to The Tech Ledger.

---

## 2026-06-22

### Added
- **DeepSeek v4-flash AI summaries** — daily/weekly/monthly editorial reports via `lib/ai-summary.ts`
- **Summary-of-summaries** pipeline — weekly digests synthesize daily AI summaries; monthly digests synthesize weekly AI summaries
- **kvAvailable() guard** — skips all KV operations when KV_URL contains placeholder `xxx`, prevents SSR hangs
- **In-flight request dedup** — `dedupedFetchAllSources()` prevents concurrent cold-cache requests from multiplying API calls
- **Startup validation** — `lib/startup.ts` warns on placeholder tokens
- **Beige Paper** background texture overlaid on body
- **Cardboard Flat** texture on sticky navigation bar
- **DeepSeek AI summaries** — `lib/ai-summary.ts` calls DeepSeek API to generate editorial reports from trending signals
- **Weekly Calendar** component for weekly digest page
- **Clickable calendar dates** — all dates in ReportCalendar now link to daily report pages
- **Today highlight** — current date shown in red (`#CC0000`) in calendar
- **CHANGELOG.md** — this file

### Changed
- **DeepSeek model** — `deepseek-chat` → `deepseek-v4-flash` per official docs
- **API endpoint** — `/v1/chat/completions` → `/chat/completions`
- **Source status** — now derived from cached trending data (no redundant API calls)
- **AI summary throttling** — only regenerates when top 3 signals change + 6h cooldown
- **Weekly/monthly triggers** — Sunday-only for weeklies, month-end-only for monthlies
- **Week labels** — human-readable "June 22–28, 2026" instead of "2026-W26"
- **Nav TRENDING** — links to `/` instead of `#trending`
- **Star emoji** — `★` → `⭐`
- **Env files** — added provider URLs and model documentation
- **Daily cache** — trending data now cached until midnight (was 5-min TTL)
- **Per-source time decay** — GitHub 6h, HN 12h, Blogs 48h, arXiv 168h half-life
- **Reports page** — calendar below shows Today's AI Report (live data fallback when no KV snapshot)
- **Daily report page** — now gracefully handles missing snapshots with live data fallback
- **Weekly/Monthly pages** — show calendar + AI Report; handle missing data gracefully
- **AiReport width** — spans full page width (removed max-w-3xl constraint)
- **About page** — added Nav and Footer
- **API page** — added Nav and Footer
- **Ranking numbers** — medal colors: gold (#D4AF37), silver (#A8A8A8), bronze (#CD7F32)
- **Nav background** — white → Cardboard Flat texture
- **Edition metadata** — moved from Hero to Nav: `Vol. 1 | Date | City Edition`
- **IP-based city** — edition shows detected city via ipapi.co

### Fixed
- **Weekly/monthly page hangs** — removed live data fetching from fallback path
- **KV call hangs** — all KV functions in cache.ts and reports.ts now guarded by kvAvailable()
- **Calendar dates not clickable** — all dates now link to daily report pages
- **Report pages missing Nav/Footer** — added to About and API pages
- **GitHub Trending** — Firecrawl extract schema replaced with markdown parsing (4ms vs 15s timeout)
- **Source Desk counts** — now match Trending tab counts (deduped signals)
- **Trending tabs** — all tabs show count badges; ALL tab removed (count-only above tabs)
- **Plural forms** — "repository" → "repositories", "story" → "stories"
- **Calendar visibility** — non-report dates now visible (darkened from #E5E5E0 to #737373)
- **Source Desk borders** — fixed missing right border on Tech Blogs column

### Data Sources
- **GitHub Trending** via Firecrawl (markdown format, 6h half-life)
- **Hacker News** via Tavily (12h half-life)
- **arXiv Papers** via Exa (168h half-life)
- **Tech Blogs** via Tavily (48h half-life) — 9 domains: github.blog, stackoverflow.blog, netflixtechblog.com, blog.cloudflare.com, engineering.linkedin.com, slack.engineering, stripe.com/blog/engineering, engineering.fb.com, blog.rust-lang.org
