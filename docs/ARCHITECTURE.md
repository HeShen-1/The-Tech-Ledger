# The Tech Ledger — Architecture Document

> **Version:** 1.1.0 | **Date:** 2026-06-22

---

## 1. System Overview

The Tech Ledger is a single-page Next.js application deployed on Vercel. It aggregates trending technology content from four external data sources, caches results in Vercel KV using a **daily cache strategy** (first request of the day fetches all sources, subsequent requests serve from cache until midnight), and renders them with a Newsprint editorial design system. A cron job captures hourly report snapshots for historical browsing.

**Daily Cache Key Format:** `trending:daily:YYYY-MM-DD` — TTL is seconds until midnight UTC.

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser    │────▶│  Next.js (Vercel) │────▶│  Vercel KV      │
│   (Client)   │◀────│  App Router + SSR │◀────│  (Redis Edge)   │
└──────────────┘     └────────┬─────────┘     └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         ▼         ▼
              ┌─────────┐ ┌───────┐ ┌───────┐
              │Firecrawl│ │Tavily │ │ Exa   │
              │(Scrape) │ │(Search│ │(Semantic)
              └─────────┘ └───────┘ └───────┘
```

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Runtime | Node.js | 20+ | Server execution |
| Framework | Next.js | 14+ (App Router) | SSR, API Routes, routing |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS |
| Animation | Framer Motion | 11+ | Declarative animations |
| Caching | Vercel KV | 1.x | Redis-compatible edge cache |
| Data: Scraping | Firecrawl API | v1 | GitHub Trending extraction |
| Data: Search | Tavily API | - | HN + blog search |
| Data: Semantic | Exa API | - | arXiv paper discovery |
| Icons | Lucide React | latest | Sharp, minimal icons |
| Deployment | Vercel | Hobby plan | Hosting + serverless |

---

## 3. Directory Structure

```
the-signal/
├── app/
│   ├── layout.tsx              # Root layout, metadata, fonts, global providers
│   ├── page.tsx                # SSR homepage — data fetching + composition
│   ├── loading.tsx             # Skeleton loading state
│   ├── error.tsx               # Error boundary (client component)
│   ├── not-found.tsx           # 404 page
│   ├── globals.css             # Tailwind directives + custom utilities
│   ├── reports/
│   │   └── page.tsx            # Reports page with calendar date picker
│   └── api/
│       ├── trending/
│       │   └── route.ts        # GET /api/trending — cached signal aggregation
│       ├── sources/
│       │   └── route.ts        # GET /api/sources — source health status
│       └── reports/
│           ├── snapshot/
│           │   └── route.ts    # POST /api/reports/snapshot — hourly snapshot capture
│           ├── dates/
│           │   └── route.ts    # GET /api/reports/dates — list available report dates
│           └── [date]/
│               └── route.ts    # GET /api/reports/[date] — historical report by date
├── components/
│   ├── nav.tsx                 # Sticky header, nav links, LiveIndicator, edition metadata
│   ├── hero.tsx                # Hero masthead with staggered title animation
│   ├── live-indicator.tsx      # Green dot pulse status
│   ├── signal-card.tsx         # Individual trending item card
│   ├── signal-list.tsx         # Staggered list container with inline source breakdown
│   ├── scroll-progress.tsx     # Animated scroll progress bar
│   ├── refresh-toast.tsx       # Slide-down notification on data refresh
│   ├── report-calendar.tsx     # Calendar date picker for historical reports
│   └── footer.tsx              # Inverted (black) footer with links
├── lib/
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── cache.ts                # Vercel KV read/write wrappers
│   ├── dedup.ts                # URL normalization + title similarity dedup
│   ├── sources.ts              # Firecrawl, Tavily, Exa API clients
│   ├── aggregator.ts           # Orchestrator: fetch → dedup → rank → cache
│   └── reports.ts              # Report snapshot capture + retrieval
├── docs/
│   ├── PRD.md                  # Product requirements
│   ├── ARCHITECTURE.md         # This document
│   └── superpowers/
│       ├── specs/              # Design specifications
│       └── plans/              # Implementation plans
├── CLAUDE.md                   # AI agent instructions
├── .env.example                # Environment variable template
├── vercel.json                 # Vercel deployment config
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind theme extensions
├── postcss.config.mjs          # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── .gitignore                  # Git ignore rules
```

---

## 4. Data Flow

### 4.1 Request Lifecycle

```
1. Browser requests /
2. Next.js SSR calls page.tsx
3. page.tsx fetches /api/trending in parallel
4. /api/trending checks Vercel KV for cached TrendingResponse (key: trending:daily:YYYY-MM-DD)
   ├── HIT  → return cached data (fast path, ~50ms)
   └── MISS → Promise.allSettled([Firecrawl, Tavily-HN, Exa, Tavily-blogs])
              → deduplicateSignals() via URL + title similarity
              → rankSignals() via score × per-source time decay
              → setCachedTrending(response, TTL=seconds-until-midnight)
              → return response
5. page.tsx receives JSON, passes to client components
6. Client hydrates with Framer Motion entry animations
```

### 4.2 Cache Strategy

- **Key:** `trending:daily:YYYY-MM-DD`
- **TTL:** Seconds until midnight UTC (first request each day triggers a fresh fetch)
- **Pattern:** Cache-aside (read-through), search-once-per-day
- **Fallback:** On KV failure, fetch sources directly (no caching)
- **Manual Refresh:** `/api/trending?refresh={REFRESH_TOKEN}` bypasses cache

### 4.3 Cron Job: Hourly Report Snapshots

A scheduled cron job (Vercel Cron or external) calls `POST /api/reports/snapshot` hourly. Each snapshot captures the current aggregate signal state (top signals, source counts, edition metadata) and persists it to Vercel KV under a date-indexed key. Users can browse historical snapshots via the Reports calendar UI at `/reports`.

### 4.4 Per-Source Time Decay

Each source has its own half-life, reflecting the pace of each community:

| Source | Half-Life | Rationale |
|--------|-----------|-----------|
| GitHub Trending | 6 hours | Repos trend rapidly, then drop off |
| Hacker News | 12 hours | Front-page lifetime ~12-18h |
| Tech Blogs | 48 hours | Engineering blog posts have longer shelf life |
| arXiv Papers | 168 hours (7 days) | Research papers stay relevant weeks |

Decay formula: `score × exp(-ageHours / halfLifeHours)` → sort descending.

### 4.5 Data Aggregation

```
Raw signals (from 4 sources)
  │
  ├── deduplicateSignals()
  │   ├── normalizeUrl() — strip protocol, trailing slash, lowercase
  │   └── titleSimilarity() — Levenshtein distance > 0.85 → duplicate
  │
  ├── transformToSignals()
  │   └── RawSignal → Signal (add id, labels, readTime)
  │
  └── rankSignals()
      └── score × exp(-ageHours / 24) → sort descending
```

---

## 5. Component Architecture

### 5.1 Component Tree

```
RootLayout
├── ScrollProgress          (fixed, z-60)
├── RefreshToast            (fixed, z-70)
├── Nav                     (sticky, z-40, edition metadata)
│   └── LiveIndicator
├── HomePage (SSR)
│   ├── Hero                (with signalCount prop)
│   ├── SignalList          (with signals[] prop, inline source breakdown)
│   │   └── SignalCard[]    (with signal + index props)
│   └── Footer
├── ReportsPage
│   ├── ReportCalendar      (date picker for historical snapshots)
│   └── SignalList          (displays snapshot data for selected date)
├── Loading (suspense fallback)
├── Error (error boundary)
└── NotFound (404)
```

### 5.2 Component Responsibilities

| Component | Type | Data Source | Key Behavior |
|-----------|------|-------------|--------------|
| `Nav` | Client | Edition metadata | Scroll-driven bottom border; displays city edition |
| `Hero` | Client | `signalCount` prop | Staggered word animation, decorative accent line |
| `LiveIndicator` | Client | None | CSS pulse animation, 2s loop |
| `SignalCard` | Client | `signal` prop | Hover: accent line + warm bg; click: micro-scale; medal badge |
| `SignalList` | Client | `signals[]` prop | Staggered children entry (100ms delay); inline source breakdown and medal ranking |
| `ReportCalendar` | Client | `/api/reports/dates` | Calendar grid with date picker; highlights dates with snapshots |
| `ScrollProgress` | Client | `useScroll()` | Spring physics, 3px accent→ink gradient bar |
| `RefreshToast` | Client | Internal polling | 5-min interval check, AnimatePresence slide-down |
| `Footer` | Server | None | Inverted (black bg), static content |

### 5.3 State Management

No global state store needed. Data flows unidirectionally:
- **Server → Client:** Props passed from SSR `page.tsx` to components
- **Client-only state:** `useScroll()`, `useInView()`, `useState` for toast visibility
- **No client-side data fetching:** All data comes from SSR (avoids hydration mismatch)

---

## 6. API Design

### 6.1 Endpoints

#### `GET /api/trending`

**Response:** `TrendingResponse`
```ts
{
  signals: Signal[],       // Top 20 ranked signals
  total: number,           // Total signal count
  cached: boolean,         // Whether served from cache
  cachedAt: string | null, // ISO timestamp of cache write
  stale: boolean           // Whether cache is older than TTL
}
```

**Query Parameters:**
- `refresh={REFRESH_TOKEN}` — Force cache bypass and re-fetch

**Cache Headers:** `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

**Error Responses:**
- `503` — All sources failed, no cache available
- `500` — Refresh attempt failed

#### `GET /api/sources`

**Response:** `SourcesResponse`
```ts
{
  sources: SourceStatus[],  // One entry per data source
  updatedAt: string         // ISO timestamp
}
```

**SourceStatus:**
```ts
{
  name: string,                    // "GitHub Trending" | "Hacker News" | "arXiv Papers" | "Tech Blogs"
  status: "ok" | "timeout" | "error",
  latency: number,                 // Response time in ms
  count: number                    // Number of deduped signals from Trending feed
}
```

**Note:** Source Desk now reads deduped signal counts directly from the Trending feed rather than maintaining a separate data path. Each Signal carries a `source` field; counts are derived by grouping.

#### `POST /api/reports/snapshot`

Called hourly by a cron job. Captures the current trending state and persists to KV.
```ts
// Response
{
  success: boolean,
  date: string,          // ISO date key, e.g. "2026-06-21"
  signalCount: number
}
```

#### `GET /api/reports/dates`

Returns the list of dates that have report snapshots available.

**Response:**
```ts
{
  dates: string[]        // e.g. ["2026-06-19", "2026-06-20", "2026-06-21"]
}
```

#### `GET /api/reports/[date]`

Retrieves the historical snapshot for a given date.

**Response:**
```ts
{
  date: string,
  signals: Signal[],
  sourceCounts: Record<string, number>,
  generatedAt: string    // ISO timestamp of snapshot creation
}
```

### 6.2 Error Handling Strategy

| Scenario | Behavior |
|----------|----------|
| Single source fails | `Promise.allSettled` ignores, aggregates remaining |
| All sources fail, cache exists | Return stale cache with `stale: true` |
| All sources fail, no cache | Return 503 with error message |
| KV read fails | Log warning, proceed to fetch without cache |
| KV write fails | Log warning, return fresh data (next request will re-fetch) |
| API route timeout | `AbortController` at 8s per source |

---

## 7. AI Summary Pipeline

### 7.1 Overview

The Tech Ledger generates AI-powered editorial reports that summarize trending signals. Reports are generated at three cadences:

| Cadence | Trigger | Summary Type |
|---------|---------|--------------|
| Daily | Every day at ~23:59 UTC | AI summary from current trending signals |
| Weekly | Sundays only | Digest synthesized from the week's daily AI summaries |
| Monthly | Month-end only | Digest synthesized from the month's weekly AI summaries |

### 7.2 Summary-of-Summaries Architecture

```
Daily signals → lib/ai-summary.ts (DeepSeek v4-flash) → daily AI report → KV snapshot
                                                                    ↓
Weekly digest ← synthesis of 7 daily AI summaries ← DeepSeek v4-flash
                                                                    ↓
Monthly digest ← synthesis of 4-5 weekly AI summaries ← DeepSeek v4-flash
```

This hierarchical approach means weekly and monthly reports never re-process raw signals — they synthesize the AI-generated summaries from the tier below, producing richer, more coherent digests.

### 7.3 DeepSeek API Integration

- **Model:** `deepseek-v4-flash` via OpenAI-compatible endpoint `/chat/completions`
- **Client:** `lib/ai-summary.ts` — prompt templates for daily/weekly/monthly editorial tone
- **Throttling:** AI summaries only regenerate when the top 3 signals change AND at least 6 hours have elapsed since the last generation
- **Fallback:** If DeepSeek API is unavailable, reports display the raw trending feed without AI commentary
- **Week labels:** Human-readable format ("June 22–28, 2026") instead of ISO week numbers

### 7.4 Report Components

| Component | Purpose |
|-----------|---------|
| `ai-report.tsx` | Full AI-generated editorial report display |
| `report-preview.tsx` | Summary preview card on the reports index |
| `week-calendar.tsx` | Calendar navigation for weekly digest page |
| `report-calendar.tsx` | Calendar date picker for daily reports |

---
## 8. API Call Optimization

### 8.1 In-Flight Request Deduplication

`dedupedFetchAllSources()` wraps the source fetch pipeline. When multiple concurrent requests arrive during a cold-cache window, only one actually calls the external APIs — all others wait for and share the single in-flight promise. This prevents request multiplication that would otherwise trigger rate limits from Firecrawl, Tavily, and Exa simultaneously.

### 8.2 Source Status from Cache

Source Desk status counts are now derived directly from the cached trending response rather than making separate `/api/sources` calls. Each `Signal` carries a `source` field; counts are computed by grouping — eliminating a redundant API round-trip.

### 8.3 AI Summary Throttling

AI summaries are expensive (LLM API call). Regeneration is gated on two conditions:
1. The top 3 ranked signals have changed since the last summary was generated
2. At least 6 hours have elapsed since the last generation

This prevents unnecessary LLM calls when the trending feed is stable.

### 8.4 KV Availability Guard

`kvAvailable()` checks whether `KV_URL` contains the placeholder string `xxx` (indicating Vercel KV is not provisioned). All KV read/write functions in `cache.ts` and `reports.ts` are guarded with this check, preventing SSR hangs when KV is unavailable.

---
## 11. Design System: Newsprint

### 9.1 Design Tokens

```
Background:  #F9F9F7  (Newsprint Off-White)
Foreground:  #111111  (Ink Black)
Muted:       #E5E5E0  (Divider Grey)
Accent:      #CC0000  (Editorial Red — used sparingly)

Fonts:
  Headlines: Playfair Display (serif, 400-900)
  Body:      Lora (serif, 400, 600)
  UI:        Inter (sans-serif, 400-700)
  Data:      JetBrains Mono (monospace, 400, 500)

Border:     1px solid #111111, radius 0px everywhere
Shadows:    None (flat). Hover: box-shadow 4px 4px 0 #111111
```

### 9.2 Key Design Rules

1. **Zero radius.** Every element — buttons, cards, inputs, containers — has `border-radius: 0`.
2. **No soft shadows.** Flat design. Hover uses hard offset shadow.
3. **Visible grid lines.** Borders between columns are explicit structural elements.
4. **Typography hierarchy.** Headlines 5xl→9xl (Playfair), body text-sm→text-lg (Lora).
5. **Paper texture.** Dot grid pattern on background, line grid overlay on sections.
6. **Uppercase labels.** Navigation, metadata, badges use `uppercase tracking-widest text-xs`.
7. **Grayscale images.** All images `grayscale` by default, `sepia` on hover.

---

## 10. Security

### 10.1 Secret Management

All API keys stored as environment variables, accessed via `process.env` on the server only:
- `FIRECRAWL_API_KEY`
- `TAVILY_API_KEY`
- `EXA_API_KEY`
- `REFRESH_TOKEN`
- KV credentials (auto-injected by Vercel)

### 10.2 HTTP Security Headers

Configured in `vercel.json`:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 10.3 Refresh Protection

The `/api/trending?refresh=` endpoint requires a `REFRESH_TOKEN` query parameter that matches the server-side environment variable. Without it, the cache is served normally.

---

## 11. Deployment

### 11.1 Platform

- **Hosting:** Vercel (Hobby plan)
- **KV Store:** Vercel KV (included in Hobby)
- **CI/CD:** Automatic deploys from `main` branch via Vercel Git integration

### 11.2 Environment Variables (set in Vercel Dashboard)

```
FIRECRAWL_API_KEY
TAVILY_API_KEY
EXA_API_KEY
REFRESH_TOKEN
KV_URL            (auto-configured)
KV_REST_API_URL   (auto-configured)
KV_REST_API_TOKEN (auto-configured)
```

### 11.3 Build & Deploy

```bash
npm run build    # Next.js production build
# Vercel auto-deploys on git push to main
```

---

## 12. Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| FCP | < 1.5s | Lighthouse |
| LCP | < 2.5s | Lighthouse |
| TBT | < 200ms | Lighthouse |
| CLS | 0 | Lighthouse |
| JS Bundle (gzip) | < 150KB | `next build` output |
| Animation FPS | 60 | Chrome DevTools |

### Optimization Strategies

- SSR with `next: { revalidate: 60 }` for stale-while-revalidate
- KV cache at edge (sub-50ms reads)
- `transform` and `opacity` only for animations (GPU composited)
- Font `display: block` to prevent layout shift
- No client-side data fetching (avoids waterfall)
- Images lazy-loaded below fold
