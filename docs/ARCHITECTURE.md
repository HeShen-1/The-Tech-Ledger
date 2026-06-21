# The Signal — Architecture Document

> **Version:** 1.0.0 | **Date:** 2026-06-21

---

## 1. System Overview

The Signal is a single-page Next.js application deployed on Vercel. It aggregates trending technology content from four external data sources, caches results in Vercel KV, and renders them with a Newsprint editorial design system.

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
│   └── api/
│       ├── trending/
│       │   └── route.ts        # GET /api/trending — cached signal aggregation
│       └── sources/
│           └── route.ts        # GET /api/sources — source health status
├── components/
│   ├── nav.tsx                 # Sticky header, nav links, LiveIndicator
│   ├── hero.tsx                # Hero masthead with staggered title animation
│   ├── live-indicator.tsx      # Green dot pulse status
│   ├── signal-card.tsx         # Individual trending item card
│   ├── signal-list.tsx         # Staggered list container for signal cards
│   ├── source-breakdown.tsx    # Source status grid with mini bar charts
│   ├── scroll-progress.tsx     # Animated scroll progress bar
│   ├── refresh-toast.tsx       # Slide-down notification on data refresh
│   └── footer.tsx              # Inverted (black) footer with links
├── lib/
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── cache.ts                # Vercel KV read/write wrappers
│   ├── dedup.ts                # URL normalization + title similarity dedup
│   ├── sources.ts              # Firecrawl, Tavily, Exa API clients
│   └── aggregator.ts           # Orchestrator: fetch → dedup → rank → cache
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
3. page.tsx fetches /api/trending and /api/sources in parallel
4. /api/trending checks Vercel KV for cached TrendingResponse
   ├── HIT  → return cached data (fast path, ~50ms)
   └── MISS → Promise.allSettled([Firecrawl, Tavily, Exa, Tavily-blogs])
              → deduplicateSignals() via URL + title similarity
              → rankSignals() via score × time decay
              → setCachedTrending(response, TTL=300)
              → return response
5. page.tsx receives JSON, passes to client components
6. Client hydrates with Framer Motion entry animations
```

### 4.2 Cache Strategy

- **Key:** `trending:latest`, `sources:latest`
- **TTL:** 300 seconds (5 minutes)
- **Pattern:** Cache-aside (read-through)
- **Fallback:** On KV failure, fetch sources directly (no caching)
- **Manual Refresh:** `/api/trending?refresh={REFRESH_TOKEN}` bypasses cache

### 4.3 Data Aggregation

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
├── Nav                     (sticky, z-40)
│   └── LiveIndicator
├── HomePage (SSR)
│   ├── Hero                (with signalCount prop)
│   ├── SignalList          (with signals[] prop)
│   │   └── SignalCard[]    (with signal + index props)
│   ├── SourceBreakdown     (with sources[] prop)
│   └── Footer
├── Loading (suspense fallback)
├── Error (error boundary)
└── NotFound (404)
```

### 5.2 Component Responsibilities

| Component | Type | Data Source | Key Behavior |
|-----------|------|-------------|--------------|
| `Nav` | Client | None | Scroll-driven bottom border, sticky |
| `Hero` | Client | `signalCount` prop | Staggered word animation, decorative accent line |
| `LiveIndicator` | Client | None | CSS pulse animation, 2s loop |
| `SignalCard` | Client | `signal` prop | Hover: accent line + warm bg; click: micro-scale |
| `SignalList` | Client | `signals[]` prop | Staggered children entry (100ms delay between) |
| `SourceBreakdown` | Client | `sources[]` prop | In-view animation trigger, status-colored bars |
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
  count: number                    // Number of signals from this source
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

## 7. Design System: Newsprint

### 7.1 Design Tokens

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

### 7.2 Key Design Rules

1. **Zero radius.** Every element — buttons, cards, inputs, containers — has `border-radius: 0`.
2. **No soft shadows.** Flat design. Hover uses hard offset shadow.
3. **Visible grid lines.** Borders between columns are explicit structural elements.
4. **Typography hierarchy.** Headlines 5xl→9xl (Playfair), body text-sm→text-lg (Lora).
5. **Paper texture.** Dot grid pattern on background, line grid overlay on sections.
6. **Uppercase labels.** Navigation, metadata, badges use `uppercase tracking-widest text-xs`.
7. **Grayscale images.** All images `grayscale` by default, `sepia` on hover.

---

## 8. Security

### 8.1 Secret Management

All API keys stored as environment variables, accessed via `process.env` on the server only:
- `FIRECRAWL_API_KEY`
- `TAVILY_API_KEY`
- `EXA_API_KEY`
- `REFRESH_TOKEN`
- KV credentials (auto-injected by Vercel)

### 8.2 HTTP Security Headers

Configured in `vercel.json`:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 8.3 Refresh Protection

The `/api/trending?refresh=` endpoint requires a `REFRESH_TOKEN` query parameter that matches the server-side environment variable. Without it, the cache is served normally.

---

## 9. Deployment

### 9.1 Platform

- **Hosting:** Vercel (Hobby plan)
- **KV Store:** Vercel KV (included in Hobby)
- **CI/CD:** Automatic deploys from `main` branch via Vercel Git integration

### 9.2 Environment Variables (set in Vercel Dashboard)

```
FIRECRAWL_API_KEY
TAVILY_API_KEY
EXA_API_KEY
REFRESH_TOKEN
KV_URL            (auto-configured)
KV_REST_API_URL   (auto-configured)
KV_REST_API_TOKEN (auto-configured)
```

### 9.3 Build & Deploy

```bash
npm run build    # Next.js production build
# Vercel auto-deploys on git push to main
```

---

## 10. Performance Budget

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
