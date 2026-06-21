# The Tech Ledger — CLAUDE.md

> Real-time tech trending aggregator · Newsprint editorial aesthetic · Vercel deployment

---

## Project Overview

The Tech Ledger is a single-page Next.js application that aggregates trending technology content from GitHub, Hacker News, tech blogs, and arXiv, presenting it with a distinctive Newsprint design system — sharp geometry, serif typography, high information density, zero-radius design. Built to showcase full-stack capability for technical recruiting.

**Target:** HR recruiters & technical interviewers evaluating full-stack ability.
**Live at:** Vercel deployment (URL configured post-deploy).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript 5.x (strict) |
| Styling | Tailwind CSS 3.4+ |
| Animation | Framer Motion 11+ |
| Caching | Vercel KV (Redis edge) |
| Data APIs | Firecrawl (scraping), Tavily (search), Exa (semantic) |
| Icons | Lucide React (stroke-width 1.5) |
| Deployment | Vercel (Hobby) |

**Key dependencies:** `next`, `react`, `react-dom`, `framer-motion`, `@vercel/kv`, `lucide-react`

---

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm start        # Start prod server
npm run lint     # ESLint check
npx tsc --noEmit # Type check
```

---

## File Structure

```
the-signal/
├── app/
│   ├── layout.tsx              # Root layout, metadata, fonts (Playfair/Lora/Inter/JetBrains Mono)
│   ├── page.tsx                # SSR homepage — fetches /api/trending
│   ├── loading.tsx             # Skeleton loading
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404
│   ├── globals.css             # Tailwind directives + custom utilities
│   ├── reports/
│   │   └── page.tsx            # Reports page with calendar date picker
│   └── api/
│       ├── trending/route.ts   # GET /api/trending (cached aggregation)
│       ├── sources/route.ts    # GET /api/sources (health status)
│       └── reports/
│           ├── snapshot/route.ts   # POST /api/reports/snapshot (cron)
│           ├── dates/route.ts      # GET /api/reports/dates
│           └── [date]/route.ts     # GET /api/reports/[date]
├── components/
│   ├── nav.tsx                 # Sticky header + LiveIndicator + edition metadata
│   ├── hero.tsx                # Masthead with staggered word animation
│   ├── live-indicator.tsx      # Green dot pulse
│   ├── signal-card.tsx         # Individual trending item (medal badge support)
│   ├── signal-list.tsx         # Staggered list container with inline source breakdown
│   ├── scroll-progress.tsx     # Top progress bar
│   ├── refresh-toast.tsx       # Slide-down data notification
│   ├── report-calendar.tsx     # Calendar date picker for reports
│   ├── week-calendar.tsx       # Weekly digest calendar component
│   ├── report-preview.tsx      # Report summary preview card
│   ├── ai-report.tsx           # Full AI-generated editorial report display
│   └── footer.tsx              # Inverted (black) footer
├── lib/
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── cache.ts                # Vercel KV wrappers
│   ├── dedup.ts                # URL norm + Levenshtein title dedup
│   ├── sources.ts              # Firecrawl/Tavily/Exa API clients
│   ├── aggregator.ts           # fetch → dedup → rank → cache orchestrator
│   ├── ai-summary.ts           # DeepSeek API client for AI-generated editorial reports
│   ├── reports.ts              # Report snapshot capture + retrieval
│   └── startup.ts              # Startup validation (warns on placeholder tokens)
├── docs/
│   ├── PRD.md                  # Product requirements
│   └── ARCHITECTURE.md         # Architecture details
├── .env.example
├── vercel.json
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

Full implementation plan: `docs/superpowers/plans/2026-06-21-the-signal-plan.md`

---

## Design System: Newsprint

This project follows a strict, opinionated design language. Every visual decision traces back to these rules.

### Core Philosophy
**"All the News That's Fit to Print."** — digital ode to print journalism. Authoritative, intellectual, urgent, timeless. Rejects soft shadows, rounded corners, blurred backgrounds. Embraces sharp geometry, visible grid lines, typographic drama.

### Design Tokens

```
Background:  #F9F9F7  (Newsprint Off-White)
Foreground:  #111111  (Ink Black)
Muted:       #E5E5E0  (Divider Grey)
Accent:      #CC0000  (Editorial Red — use EXTREMELY sparingly, <1% of surface area)

Fonts:
  Headlines: Playfair Display (serif, weights 400/600/700/900)
  Body:      Lora (serif, weights 400/600, italic 400)
  UI:        Inter (sans-serif, weights 400/500/600/700)
  Data:      JetBrains Mono (monospace, weights 400/500)

Font import (in layout.tsx <style> tag):
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Lora:ital,wght@0,400;0,600;1,400&display=block');
```

### Non-Negotiable Rules

1. **ZERO border radius.** Every element. No exceptions. Enforce with `.sharp-corners { border-radius: 0px !important; }`.
2. **NO soft shadows.** Flat design. Hover uses hard offset shadow: `box-shadow: 4px 4px 0px 0px #111111; transform: translate(-2px, -2px)`.
3. **NO dark mode.** Light only.
4. **Visible grid lines.** Celebrate borders — `border border-[#111111]` is the primary structural element.
5. **NO gradients.** Solid colors only. No blur, no inner shadows.
6. **Typography hierarchy:**
   - H1 (hero): `text-5xl sm:text-6xl lg:text-9xl font-serif font-black leading-[0.9] tracking-tighter`
   - H2 (sections): `text-4xl lg:text-5xl font-serif font-black`
   - H3 (cards): `text-2xl lg:text-3xl font-serif font-bold`
   - Body: `font-body text-sm lg:text-lg leading-relaxed`
   - Labels/metadata: `font-mono text-xs uppercase tracking-widest`
7. **Uppercase for:** navigation, labels, metadata, badges. Sentence case for headlines and body.
8. **Accent color (#CC0000) only for:** breaking news badges, hover underlines, primary CTAs. Never use as text on black backgrounds.

### Textures & Patterns

**Dot grid background (body):**
```css
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23111111' fill-opacity='0.04' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E");
```

**Line grid overlay (sections):**
```css
.newsprint-texture::before {
  background-image:
    linear-gradient(0deg, transparent 98%, rgba(0,0,0,0.02) 100%),
    linear-gradient(90deg, transparent 98%, rgba(0,0,0,0.02) 100%);
  background-size: 3px 3px;
}
```

### Component Patterns

**Primary Button:**
```tsx
className="bg-[#111111] text-[#F9F9F7] border border-transparent hover:bg-white hover:text-[#111111] hover:border-[#111111] font-mono text-xs uppercase tracking-widest transition-all duration-200 min-h-[44px] min-w-[44px]"
```

**Secondary (Outline) Button:**
```tsx
className="border border-[#111111] bg-transparent hover:bg-[#111111] hover:text-[#F9F9F7] font-mono text-xs uppercase tracking-widest transition-all duration-200 min-h-[44px] min-w-[44px]"
```

**Standard Card:**
```tsx
<div className="border border-[#111111] bg-[#F9F9F7] p-6 transition-colors duration-200 hover:bg-neutral-100">
```

**Card with Hard Shadow Hover:**
```tsx
className="border border-[#111111] transition-all duration-200 hover:shadow-[4px_4px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5"
```

**Input:**
```tsx
className="border-b-2 border-[#111111] bg-transparent px-3 py-2 font-mono text-sm focus:bg-[#F0F0F0] focus:outline-none"
```

**Focus ring:**
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
```

### Animation Philosophy

Fast, snappy, mechanical. No bouncy/spring easing.
- Default transition: `transition-all duration-200 ease-out`
- Hover: color inversion, hard shadow, underline, scale
- Page entry: Framer Motion `staggerChildren: 0.1`, `ease: [0.16, 1, 0.3, 1]`
- Scroll-driven: `useScroll()` + `useSpring()` for progress bar
- Only animate `transform` and `opacity` (GPU composited)
- Respect `prefers-reduced-motion` — disable all motion when set

### Responsive Strategy

- Mobile-first: single column, reduced padding, hamburger nav
- Tablet (`md:`): 768px+
- Desktop (`lg:`): 1024px+
- Grid collapses: multi-column → single column on mobile
- Typography scales: `text-5xl` → `text-6xl` → `text-9xl`
- Touch targets: minimum 44×44px
- CTA buttons: `w-full` on mobile, `md:w-auto`

### Accessibility

- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Proper heading hierarchy (h1 → h2 → h3)
- Visible focus indicators on all interactive elements
- `aria-label` on icon-only buttons
- `alt` text on all images
- WCAG 2.1 AA contrast: `#111111` on `#F9F9F7` = >17:1 (AAA)

---

## Architecture Notes

### Data Flow
```
Browser → Next.js SSR (page.tsx) → /api/trending (KV check) → Firecrawl/Tavily/Exa → aggregate → KV write → JSON → render
```
For historical reports: `Browser → /reports → /api/reports/dates → pick date → /api/reports/[date] → render snapshot`

### Daily Cache (Primary Strategy)
- **Key format:** `trending:daily:YYYY-MM-DD`
- **TTL:** Seconds until midnight UTC (not a fixed 300s)
- **Behavior:** First request each day fetches all sources fresh, subsequent requests serve from cache until midnight
- **Pattern:** Cache-aside (read-through)
- **Manual refresh:** `/api/trending?refresh={REFRESH_TOKEN}`
- **Hourly snapshots:** Cron job calls `POST /api/reports/snapshot` to capture aggregate state for the Reports page

### Per-Source Time Decay
| Source | Half-Life |
|--------|-----------|
| GitHub Trending | 6 hours |
| Hacker News | 12 hours |
| Tech Blogs | 48 hours |
| arXiv Papers | 168 hours (7 days) |

Decay formula: `score × exp(-ageHours / halfLifeHours)` → sort descending.

### API Call Optimization
- **In-flight request dedup:** `dedupedFetchAllSources()` prevents concurrent cold-cache requests from multiplying external API calls
- **Source status from cache:** Source Desk counts derived from cached trending data (no redundant API calls to `/api/sources`)
- **AI summary throttling:** Only regenerates AI summaries when top 3 signals change + 6-hour cooldown
- **kvAvailable() guard:** All KV operations in cache.ts and reports.ts guarded against placeholder `KV_URL` (prevents SSR hangs)

### Error Resilience
- `Promise.allSettled` for parallel source fetching (single failure doesn't block)
- Stale cache served when all sources fail
- 503 only when all sources fail AND no cache exists
- `AbortController` with 8s timeout per source

### Component State
- No global state store — data flows unidirectionally: SSR props → components
- Client-only state: `useScroll()`, `useInView()`, toast visibility
- No client-side data fetching (avoids hydration mismatch)

---

## Coding Conventions

- TypeScript strict mode
- All files use `type` imports for type-only imports
- Components: PascalCase files, default exports
- Lib utilities: camelCase files, named exports
- No `any` types
- No `console.log` in production paths (use `console.error` for errors)
- Environment variables accessed only in server code (`process.env.XXX`)
- Route handlers export `runtime = "nodejs"` and `dynamic = "force-dynamic"`

---

## CodeGraph

This project has an initialized CodeGraph index (`.codegraph/`) — a tree-sitter-parsed knowledge graph of every symbol, edge, and file. Reads are sub-millisecond.

### After Every File Change

After writing or editing any `.ts`/`.tsx` file, update the index:

```bash
npx codegraph update
```

This keeps the graph in sync. The file watcher auto-detects changes with ~500ms debounce, but explicit update guarantees freshness for the next query.

### When to Use CodeGraph vs Grep/Read

| Question | Tool |
|---|---|
| "Where is X defined?" / "Find symbol named X" | `codegraph_search` |
| "What calls function Y?" | `codegraph_callers` |
| "What does Y call?" | `codegraph_callees` |
| "What would break if I changed Z?" | `codegraph_impact` |
| "Show me Y's signature / source" | `codegraph_node` |
| "Give me context for a task/area" | `codegraph_context` |
| "See several related symbols' source" | `codegraph_explore` |
| "What files exist under path/" | `codegraph_files` |
| "Is the index healthy?" | `codegraph_status` |

**Answer directly with CodeGraph — don't delegate exploration to sub-agents.** CodeGraph IS the pre-built index. For "how does X work" questions, use `codegraph_context` first, then ONE `codegraph_explore` for the symbols it surfaces.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill:
```
FIRECRAWL_API_KEY=    # https://firecrawl.dev
TAVILY_API_KEY=       # https://tavily.com
EXA_API_KEY=          # https://exa.ai
REFRESH_TOKEN=        # Random secret for cache refresh
# KV_* variables auto-configured by Vercel
```

---

## Key Documents

- **PRD:** `docs/PRD.md` — Product requirements, user stories, features, success criteria
- **Architecture:** `docs/ARCHITECTURE.md` — Full system design, daily cache, per-source decay, data flow, API design, security
- **Design Spec:** `docs/superpowers/specs/2026-06-21-the-signal-design.md` — Historical design specification (evolved; see PRD for current feature set)
- **Implementation Plan:** `docs/superpowers/plans/2026-06-21-the-signal-plan.md`
