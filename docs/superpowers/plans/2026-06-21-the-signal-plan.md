# The Signal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "The Signal" — a real-time tech trending aggregator with Newsprint editorial design system, deployed on Vercel.

**Architecture:** Next.js 14+ App Router SSR page fetches from `/api/trending` which reads Vercel KV cache. On cache miss, `Promise.allSettled` fires Firecrawl (GitHub trending), Tavily (HN/search), and Exa (arXiv) in parallel. Results are deduplicated, scored, cached, and returned as JSON. Components use Framer Motion for staggered entry animations and CSS for micro-interactions.

**Design System:** Newsprint — zero border radius, hard shadows, Playfair Display + Lora + Inter + JetBrains Mono, `#F9F9F7` / `#111111` / `#CC0000` palette, dot grid texture, visible grid lines, flat design with no soft shadows.

**Tech Stack:** Next.js 14+ App Router, TypeScript, Tailwind CSS 3.4+, Framer Motion 11+, Vercel KV, Lucide React, Firecrawl API, Tavily API, Exa API

---

## Design Token Reference

All components use these tokens. No one-off colors, no rounded corners, no soft shadows.

| Token | Value | Tailwind Class / Usage |
|-------|-------|----------------------|
| Background | `#F9F9F7` | `bg-[#F9F9F7]` |
| Foreground | `#111111` | `text-[#111111]`, `border-[#111111]` |
| Muted | `#E5E5E0` | `bg-[#E5E5E0]`, `border-[#E5E5E0]` |
| Accent | `#CC0000` | `text-[#CC0000]` — use <1% of surface area |
| Neutral-100 | `#F5F5F5` | hover backgrounds |
| Neutral-500 | `#737373` | metadata, captions |
| Neutral-600 | `#525252` | body text variations |
| Headline font | Playfair Display | `font-serif` (configured in tailwind) |
| Body font | Lora | `font-body` (custom utility) |
| UI font | Inter | `font-sans` (default) |
| Data font | JetBrains Mono | `font-mono` |
| Border radius | `0px` | No rounded corners anywhere |
| Hover shadow | `4px 4px 0 #111` | `hover:shadow-[4px_4px_0px_0px_#111111]` |
| Focus ring | `ring-2 ring-[#111111] ring-offset-2` | `focus-visible:` only |

---

## File Structure

```
the-signal/
├── app/
│   ├── layout.tsx              # Root layout, metadata, fonts, texture, providers
│   ├── page.tsx                # SSR homepage
│   ├── loading.tsx             # Skeleton loading
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404
│   ├── globals.css             # Tailwind directives + .sharp-corners + .newsprint-texture
│   └── api/
│       ├── trending/route.ts   # GET /api/trending
│       └── sources/route.ts    # GET /api/sources
├── components/
│   ├── nav.tsx
│   ├── hero.tsx
│   ├── live-indicator.tsx
│   ├── signal-card.tsx
│   ├── signal-list.tsx
│   ├── source-breakdown.tsx
│   ├── scroll-progress.tsx
│   ├── refresh-toast.tsx
│   └── footer.tsx
├── lib/
│   ├── types.ts
│   ├── cache.ts
│   ├── dedup.ts
│   ├── sources.ts
│   └── aggregator.ts
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md
├── CLAUDE.md
├── .env.example
├── vercel.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── .gitignore
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`, `app/globals.css`

- [ ] **Step 1: Initialize Next.js**

Run:
```bash
npx create-next-app@latest the-signal --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack
```
Wait for completion, then `cd the-signal`.

- [ ] **Step 2: Replace `package.json`**

```json
{
  "name": "the-signal",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@vercel/kv": "^1.0.1",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Write `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;
```

- [ ] **Step 6: Write `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        newsprint: {
          bg: "#F9F9F7",
          fg: "#111111",
          muted: "#E5E5E0",
          accent: "#CC0000",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "'Times New Roman'", "serif"],
        sans: ["'Inter'", "'Helvetica Neue'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Courier New'", "monospace"],
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "slide-down": "slide-down 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 7: Write `postcss.config.mjs`**

```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
export default config;
```

- [ ] **Step 8: Write `.gitignore`**

```
node_modules/
.next/
out/
.env.local
.env*.local
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 9: Write `.env.example`**

```env
# Firecrawl API key (https://firecrawl.dev)
FIRECRAWL_API_KEY=fc-xxx

# Tavily API key (https://tavily.com)
TAVILY_API_KEY=tvly-xxx

# Exa API key (https://exa.ai)
EXA_API_KEY=xxx

# Vercel KV (auto-configured on Vercel, set manually for local dev)
KV_URL=redis://xxx
KV_REST_API_URL=https://xxx
KV_REST_API_TOKEN=xxx

# Secret token for manual cache refresh
REFRESH_TOKEN=change-me-to-random-string
```

- [ ] **Step 10: Write `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  .font-body {
    font-family: 'Lora', Georgia, serif;
  }
}

@layer utilities {
  .sharp-corners {
    border-radius: 0px !important;
  }
  .newsprint-texture {
    position: relative;
  }
  .newsprint-texture::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(0deg, transparent 98%, rgba(0,0,0,0.02) 100%),
      linear-gradient(90deg, transparent 98%, rgba(0,0,0,0.02) 100%);
    background-size: 3px 3px;
    pointer-events: none;
    opacity: 0.5;
  }
}
```

- [ ] **Step 11: Build verification**

```bash
npm run build
```
Expected: Successful build.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js with Newsprint design tokens"
```

---

### Task 2: Shared Types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write `lib/types.ts`**

```ts
export interface Signal {
  id: string;
  title: string;
  url: string;
  source: "github" | "hackernews" | "blog" | "arxiv";
  sourceLabel: string;
  score: number;
  scoreLabel: string;
  timestamp: string;
  summary: string | null;
  readTime: number | null;
  category: string;
}

export interface SourceStatus {
  name: string;
  status: "ok" | "timeout" | "error";
  latency: number;
  count: number;
}

export interface TrendingResponse {
  signals: Signal[];
  total: number;
  cached: boolean;
  cachedAt: string | null;
  stale: boolean;
}

export interface SourcesResponse {
  sources: SourceStatus[];
  updatedAt: string;
}

export interface RawSignal {
  title: string;
  url: string;
  source: Signal["source"];
  score: number;
  summary?: string;
  timestamp?: string;
  category?: string;
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

### Task 3: Cache Module

**Files:**
- Create: `lib/cache.ts`

- [ ] **Step 1: Write `lib/cache.ts`**

```ts
import { kv } from "@vercel/kv";
import type { TrendingResponse, SourcesResponse } from "./types";

const TRENDING_KEY = "trending:latest";
const SOURCES_KEY = "sources:latest";
const DEFAULT_TTL = 300;

export async function getCachedTrending(): Promise<TrendingResponse | null> {
  try {
    return await kv.get<TrendingResponse>(TRENDING_KEY);
  } catch (error) {
    console.error("[cache] KV read failed:", error);
    return null;
  }
}

export async function setCachedTrending(data: TrendingResponse, ttl = DEFAULT_TTL): Promise<void> {
  try {
    await kv.set(TRENDING_KEY, data, { ex: ttl });
  } catch (error) {
    console.error("[cache] KV write failed:", error);
  }
}

export async function getCachedSources(): Promise<SourcesResponse | null> {
  try {
    return await kv.get<SourcesResponse>(SOURCES_KEY);
  } catch (error) {
    console.error("[cache] KV sources read failed:", error);
    return null;
  }
}

export async function setCachedSources(data: SourcesResponse, ttl = DEFAULT_TTL): Promise<void> {
  try {
    await kv.set(SOURCES_KEY, data, { ex: ttl });
  } catch (error) {
    console.error("[cache] KV sources write failed:", error);
  }
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 4: Dedup Module

**Files:**
- Create: `lib/dedup.ts`

- [ ] **Step 1: Write `lib/dedup.ts`**

```ts
import type { RawSignal } from "./types";

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function titleSimilarity(a: string, b: string): number {
  const la = a.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const lb = b.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const maxLen = Math.max(la.length, lb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(la, lb) / maxLen;
}

export function deduplicateSignals(signals: RawSignal[]): RawSignal[] {
  const seen = new Set<string>();
  const result: RawSignal[] = [];
  for (const signal of signals) {
    const normUrl = normalizeUrl(signal.url);
    if (seen.has(normUrl)) continue;
    const isDup = result.some(
      (e) => titleSimilarity(signal.title, e.title) > 0.85,
    );
    if (!isDup) { seen.add(normUrl); result.push(signal); }
  }
  return result;
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 5: Data Source Clients

**Files:**
- Create: `lib/sources.ts`

- [ ] **Step 1: Write `lib/sources.ts`**

```ts
import type { RawSignal } from "./types";

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;
const TAVILY_KEY = process.env.TAVILY_API_KEY;
const EXA_KEY = process.env.EXA_API_KEY;
const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

async function fetchGitHubTrending(): Promise<RawSignal[]> {
  if (!FIRECRAWL_KEY) { console.warn("[sources] FIRECRAWL_API_KEY not set"); return []; }
  const res = await fetchWithTimeout("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${FIRECRAWL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://github.com/trending?since=daily",
      formats: ["extract"],
      extract: {
        schema: {
          type: "object",
          properties: {
            repositories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  url: { type: "string" },
                  description: { type: "string" },
                  stars: { type: "string" },
                  language: { type: "string" },
                },
              },
            },
          },
        },
      },
    }),
  }, TIMEOUT_MS);
  if (!res.ok) { console.error("[sources] Firecrawl failed:", res.status); return []; }
  const data = await res.json();
  const repos = data?.data?.extract?.repositories ?? [];
  return repos.slice(0, 10).map((repo: any) => ({
    title: repo.name ?? "Unknown",
    url: repo.url ?? `https://github.com/${repo.name}`,
    source: "github" as const,
    score: parseStars(repo.stars),
    summary: repo.description ?? null,
    category: repo.language ?? "Unknown",
    timestamp: new Date().toISOString(),
  }));
}

function parseStars(s: string | undefined): number {
  if (!s) return 0;
  return parseInt(s.replace(/,/g, "").replace(" stars today", "").trim(), 10) || 0;
}

async function fetchHackerNews(): Promise<RawSignal[]> {
  if (!TAVILY_KEY) { console.warn("[sources] TAVILY_API_KEY not set"); return []; }
  const res = await fetchWithTimeout("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_KEY,
      query: "site:news.ycombinator.com trending technology today",
      search_depth: "advanced",
      max_results: 10,
      include_answer: false,
    }),
  }, TIMEOUT_MS);
  if (!res.ok) { console.error("[sources] Tavily HN failed:", res.status); return []; }
  const data = await res.json();
  return (data?.results ?? []).map((r: any) => ({
    title: r.title ?? "Untitled",
    url: r.url ?? "",
    source: "hackernews" as const,
    score: r.score ?? 0,
    summary: r.content?.slice(0, 300) ?? null,
    category: inferCategory(r.title ?? ""),
    timestamp: new Date().toISOString(),
  }));
}

async function fetchArxiv(): Promise<RawSignal[]> {
  if (!EXA_KEY) { console.warn("[sources] EXA_API_KEY not set"); return []; }
  const res = await fetchWithTimeout("https://api.exa.ai/search", {
    method: "POST",
    headers: { "x-api-key": EXA_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: "latest AI machine learning paper cs.AI cs.CL cs.LG",
      type: "auto",
      numResults: 10,
      contents: { text: { maxCharacters: 200 } },
    }),
  }, TIMEOUT_MS);
  if (!res.ok) { console.error("[sources] Exa failed:", res.status); return []; }
  const data = await res.json();
  return (data?.results ?? []).map((r: any) => ({
    title: r.title ?? "Untitled",
    url: r.url ?? "",
    source: "arxiv" as const,
    score: r.score ?? 0,
    summary: r.text?.slice(0, 300) ?? null,
    category: "AI Research",
    timestamp: new Date(r.publishedDate ?? Date.now()).toISOString(),
  }));
}

async function fetchBlogs(): Promise<RawSignal[]> {
  if (!TAVILY_KEY) { console.warn("[sources] TAVILY_API_KEY not set, skipping blogs"); return []; }
  const res = await fetchWithTimeout("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_KEY,
      query: "latest software engineering technology blog post",
      search_depth: "advanced",
      max_results: 5,
      include_answer: false,
      include_domains: ["engineering.fb.com", "blog.rust-lang.org"],
    }),
  }, TIMEOUT_MS);
  if (!res.ok) { console.error("[sources] Tavily blogs failed:", res.status); return []; }
  const data = await res.json();
  return (data?.results ?? []).map((r: any) => ({
    title: r.title ?? "Untitled",
    url: r.url ?? "",
    source: "blog" as const,
    score: r.score ?? 0,
    summary: r.content?.slice(0, 300) ?? null,
    category: "Engineering",
    timestamp: new Date().toISOString(),
  }));
}

function inferCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("ai") || t.includes("llm") || t.includes("gpt")) return "AI/ML";
  if (t.includes("rust") || t.includes("go") || t.includes("python")) return "Languages";
  if (t.includes("react") || t.includes("js") || t.includes("css")) return "Web Dev";
  if (t.includes("security") || t.includes("vuln")) return "Security";
  if (t.includes("open source") || t.includes("oss")) return "Open Source";
  return "Tech";
}

export async function fetchAllSources(): Promise<RawSignal[]> {
  const results = await Promise.allSettled([
    fetchGitHubTrending(), fetchHackerNews(), fetchArxiv(), fetchBlogs(),
  ]);
  const all: RawSignal[] = [];
  for (const r of results) if (r.status === "fulfilled") all.push(...r.value);
  return all;
}

export async function getSourceStatuses() {
  const sources = [
    { name: "GitHub Trending", fetcher: fetchGitHubTrending },
    { name: "Hacker News", fetcher: fetchHackerNews },
    { name: "arXiv Papers", fetcher: fetchArxiv },
    { name: "Tech Blogs", fetcher: fetchBlogs },
  ];
  return Promise.all(sources.map(async (s) => {
    const start = Date.now();
    try {
      const data = await s.fetcher();
      return { name: s.name, status: "ok" as const, latency: Date.now() - start, count: data.length };
    } catch (error: any) {
      return {
        name: s.name,
        status: error?.name === "AbortError" ? "timeout" as const : "error" as const,
        latency: Date.now() - start,
        count: 0,
      };
    }
  }));
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 6: Aggregator Module

**Files:**
- Create: `lib/aggregator.ts`

- [ ] **Step 1: Write `lib/aggregator.ts`**

```ts
import type { Signal, RawSignal, TrendingResponse } from "./types";
import { fetchAllSources } from "./sources";
import { deduplicateSignals } from "./dedup";
import { getCachedTrending, setCachedTrending } from "./cache";

function scoreLabel(source: Signal["source"], score: number): string {
  switch (source) {
    case "github": return `★ ${score.toLocaleString()}`;
    case "hackernews": return `▲ ${score}`;
    case "arxiv": return `📄 ${score}`;
    case "blog": return `↗ ${score}`;
  }
}

function sourceLabel(source: Signal["source"]): string {
  switch (source) {
    case "github": return "github.com";
    case "hackernews": return "news.ycombinator.com";
    case "arxiv": return "arxiv.org";
    case "blog": return "Engineering Blog";
  }
}

function estimateReadTime(summary: string | null): number | null {
  if (!summary) return null;
  return Math.max(1, Math.round(summary.split(/\s+/).length / 200));
}

function generateId(url: string): string {
  return Buffer.from(url).toString("base64url").slice(0, 16);
}

function timeDecay(timestamp: string): number {
  const ageHours = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
  return Math.exp(-ageHours / 24);
}

function transformToSignals(raw: RawSignal[]): Signal[] {
  return raw.map((r) => ({
    id: generateId(r.url),
    title: r.title,
    url: r.url,
    source: r.source,
    sourceLabel: sourceLabel(r.source),
    score: r.score,
    scoreLabel: scoreLabel(r.source, r.score),
    timestamp: r.timestamp ?? new Date().toISOString(),
    summary: r.summary ?? null,
    readTime: estimateReadTime(r.summary ?? null),
    category: r.category ?? "Tech",
  }));
}

function rankSignals(signals: Signal[]): Signal[] {
  return signals
    .map((s) => ({ ...s, score: s.score * timeDecay(s.timestamp) }))
    .sort((a, b) => b.score - a.score);
}

export async function getTrending(): Promise<TrendingResponse> {
  const cached = await getCachedTrending();
  if (cached) return { ...cached, cached: true };

  const raw = await fetchAllSources();
  const deduped = deduplicateSignals(raw);
  const signals = transformToSignals(deduped);
  const ranked = rankSignals(signals).slice(0, 20);

  const response: TrendingResponse = {
    signals: ranked, total: ranked.length,
    cached: false, cachedAt: new Date().toISOString(), stale: false,
  };
  await setCachedTrending(response);
  return response;
}

export async function refreshTrending(): Promise<TrendingResponse> {
  const raw = await fetchAllSources();
  const deduped = deduplicateSignals(raw);
  const signals = transformToSignals(deduped);
  const ranked = rankSignals(signals).slice(0, 20);

  const response: TrendingResponse = {
    signals: ranked, total: ranked.length,
    cached: false, cachedAt: new Date().toISOString(), stale: false,
  };
  await setCachedTrending(response);
  return response;
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 7: API Route — /api/trending

**Files:**
- Create: `app/api/trending/route.ts`

- [ ] **Step 1: Write `app/api/trending/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getTrending, refreshTrending } from "@/lib/aggregator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refreshToken = searchParams.get("refresh");

  if (refreshToken && refreshToken === process.env.REFRESH_TOKEN) {
    try {
      const data = await refreshTrending();
      return NextResponse.json(data, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    } catch (error) {
      console.error("[api/trending] Refresh failed:", error);
      return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
    }
  }

  try {
    const data = await getTrending();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("[api/trending] Failed:", error);
    return NextResponse.json({ error: "Failed to fetch trending signals" }, { status: 503 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 8: API Route — /api/sources

**Files:**
- Create: `app/api/sources/route.ts`

- [ ] **Step 1: Write `app/api/sources/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getSourceStatuses } from "@/lib/sources";
import { getCachedSources, setCachedSources } from "@/lib/cache";

export async function GET() {
  try {
    const cached = await getCachedSources();
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }
    const sources = await getSourceStatuses();
    const response = { sources, updatedAt: new Date().toISOString() };
    await setCachedSources(response);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("[api/sources] Failed:", error);
    return NextResponse.json({ error: "Failed to fetch source status" }, { status: 503 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 9: LiveIndicator Component

**Files:**
- Create: `components/live-indicator.tsx`

- [ ] **Step 1: Write `components/live-indicator.tsx`**

```tsx
"use client";

export function LiveIndicator() {
  return (
    <div className="flex items-center gap-2" aria-label="Live status">
      <span className="inline-block h-2.5 w-2.5 flex-shrink-0 animate-pulse-soft bg-[#22C55E]" aria-hidden="true" />
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#111111]">LIVE</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 10: Nav Component

**Files:**
- Create: `components/nav.tsx`

- [ ] **Step 1: Write `components/nav.tsx`**

```tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { LiveIndicator } from "./live-indicator";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "#trending", label: "Trending" },
  { href: "#sources", label: "Sources" },
  { href: "#about", label: "About" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-40 bg-[#F9F9F7]"
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-[#111111]"
        style={{ opacity: borderOpacity }}
      />

      <nav className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4" aria-label="Main navigation">
        <div className="flex items-center gap-8">
          <a href="/" className="font-serif text-lg font-black tracking-tight text-[#111111]">
            THE SIGNAL
          </a>
          <div className="hidden gap-6 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#737373] transition-colors duration-200 hover:text-[#CC0000]"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LiveIndicator />
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#111111] bg-transparent"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-[#111111] bg-[#F9F9F7] md:hidden"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-t border-[#E5E5E0] px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#737373] transition-colors hover:bg-[#F5F5F5] hover:text-[#CC0000]"
            >
              {l.label}
            </a>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 11: Hero Component

**Files:**
- Create: `components/hero.tsx`

- [ ] **Step 1: Write `components/hero.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";

const titleWords = ["What", "the", "Tech", "World", "is", "Reading"];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
};

const fadeInWord = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero({ signalCount }: { signalCount: number }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <section className="newsprint-texture relative mx-auto max-w-screen-xl px-4 pb-16 pt-28 sm:pt-36">
      {/* Decorative accent line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-0 top-28 h-20 w-[3px] origin-top bg-[#CC0000] sm:top-36"
        aria-hidden="true"
      />

      <div className="ml-4 sm:ml-8">
        {/* Edition metadata */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#737373]"
        >
          Vol. I &mdash; {today} &mdash; Digital Edition
        </motion.p>

        {/* Masthead */}
        <motion.h1
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-6 max-w-4xl font-serif text-5xl font-black leading-[0.9] tracking-tighter text-[#111111] sm:text-6xl lg:text-8xl"
        >
          {titleWords.map((word) => (
            <motion.span key={word} variants={fadeInWord} className="mr-[0.2em] inline-block">
              {word}
            </motion.span>
          ))}
          <motion.span
            variants={fadeInWord}
            className="inline-block italic"
            style={{ borderBottom: "4px solid #CC0000", paddingBottom: "0.02em" }}
          >
            Today
          </motion.span>
        </motion.h1>

        {/* Subtitle + Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="flex items-start gap-6 border-t border-[#111111] pt-6"
        >
          <p className="max-w-xs font-body text-sm leading-relaxed text-[#525252] sm:text-base">
            Curated from GitHub, Hacker News, and the most influential engineering blogs. Updated every 5 minutes.
          </p>
          <div className="hidden h-12 w-px bg-[#E5E5E0] sm:block" aria-hidden="true" />
          <div className="hidden sm:block">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">Tracking</p>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-4xl font-black text-[#111111]"
            >
              {signalCount.toLocaleString()}
            </motion.p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">active signals</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 12: SignalCard Component

**Files:**
- Create: `components/signal-card.tsx`

- [ ] **Step 1: Write `components/signal-card.tsx`**

```tsx
"use client";

import type { Signal } from "@/lib/types";
import { ExternalLink } from "lucide-react";

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const accentForCategory = (cat: string): string => {
  const c = cat.toLowerCase();
  if (c.includes("ai") || c.includes("ml")) return "#CC0000";
  if (c.includes("security")) return "#CC0000";
  if (c.includes("open source")) return "#111111";
  if (c.includes("web")) return "#111111";
  return "#111111";
};

export function SignalCard({ signal, index }: { signal: Signal; index: number }) {
  const isLead = index === 0;

  return (
    <article
      className="group relative cursor-pointer border-b border-[#E5E5E0] py-5 transition-all duration-200 hover:bg-[#F5F5F5] hover:shadow-[4px_4px_0px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5"
      aria-labelledby={`signal-${signal.id}`}
    >
      <div className="flex items-baseline gap-3 pl-2">
        <span
          className="min-w-[80px] font-mono text-[10px] font-bold uppercase tracking-widest"
          style={{ color: isLead ? "#CC0000" : "#737373" }}
        >
          {isLead ? "Lead Story" : signal.category}
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={`signal-${signal.id}`} className={`font-serif font-black leading-tight text-[#111111] ${isLead ? "text-xl lg:text-2xl" : "text-base lg:text-lg"}`}>
            <a
              href={signal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-start gap-1 transition-colors duration-200 hover:text-[#CC0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
            >
              {signal.title}
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
            </a>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] text-[#737373] underline-offset-2 group-hover:underline" style={{ textDecorationColor: "#CC0000" }}>
              {signal.sourceLabel}
            </span>
            <span className="font-mono text-[10px] font-medium text-[#525252]">{signal.scoreLabel}</span>
            <span className="font-mono text-[10px] text-[#737373]">&middot; {timeAgo(signal.timestamp)}</span>
            {signal.readTime && (
              <span className="font-mono text-[10px] text-[#737373]">&middot; {signal.readTime} min read</span>
            )}
            <span
              className="border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
              style={{ borderColor: accentForCategory(signal.category), color: accentForCategory(signal.category) }}
            >
              {signal.category}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 13: SignalList Component

**Files:**
- Create: `components/signal-list.tsx`

- [ ] **Step 1: Write `components/signal-list.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import type { Signal } from "@/lib/types";
import { SignalCard } from "./signal-card";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export function SignalList({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) {
    return (
      <section id="trending" className="mx-auto max-w-screen-xl px-4 py-16">
        <div className="border border-[#111111] py-16 text-center">
          <p className="font-serif text-lg italic text-[#737373]">
            No signals detected. The presses are quiet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="trending" className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="mb-6 border-b-4 border-[#111111] pb-3">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#737373]">
          Trending Signals
        </h2>
      </div>
      <motion.div variants={container} initial="hidden" animate="show">
        {signals.slice(0, 10).map((signal, i) => (
          <motion.div key={signal.id} variants={item}>
            <SignalCard signal={signal} index={i} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 14: SourceBreakdown Component

**Files:**
- Create: `components/source-breakdown.tsx`

- [ ] **Step 1: Write `components/source-breakdown.tsx`**

```tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { SourceStatus } from "@/lib/types";
import { Activity } from "lucide-react";

function StatusDot({ status }: { status: SourceStatus["status"] }) {
  const bg = status === "ok" ? "#22C55E" : status === "timeout" ? "#F59E0B" : "#EF4444";
  return <span className="inline-block h-2 w-2 flex-shrink-0" style={{ backgroundColor: bg }} aria-label={status} />;
}

export function SourceBreakdown({ sources }: { sources: SourceStatus[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const maxCount = Math.max(...sources.map((s) => s.count), 1);

  return (
    <section id="sources" className="mx-auto max-w-screen-xl px-4 py-16">
      <div className="mb-8 border-b-4 border-[#111111] pb-3">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#737373]">
          Signal Sources
        </h2>
      </div>

      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4" ref={ref}>
        {sources.map((source, i) => (
          <motion.div
            key={source.name}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`border-[#111111] bg-[#F9F9F7] p-5 transition-all duration-200 hover:bg-[#F5F5F5]
              ${i !== 3 ? "sm:border-r" : ""}
              border-b sm:border-b border-t border-l
              ${i === 0 ? "sm:border-l" : ""}
            `}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#111111]" strokeWidth={1.5} />
                <span className="font-serif text-sm font-bold text-[#111111]">{source.name}</span>
              </div>
              <span className="font-mono text-[10px] text-[#737373]">{source.latency}ms</span>
            </div>

            {/* Mini bar chart */}
            <div className="mb-2 h-8 w-full origin-bottom bg-[#E5E5E0]">
              <div
                className="h-full bg-[#111111] transition-transform duration-500"
                style={{ transform: `scaleX(${inView ? source.count / maxCount : 0})`, transformOrigin: "left" }}
              />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#525252]">
                {source.status === "ok" ? `${source.count} signals` : source.status === "timeout" ? "Timed out" : "Error"}
              </span>
              <span className="font-serif text-xl font-black text-[#111111]">{source.count}</span>
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <StatusDot status={source.status} />
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#737373]">
                {source.status === "ok" ? "Operational" : source.status === "timeout" ? "Slow" : "Down"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 15: ScrollProgress Component

**Files:**
- Create: `components/scroll-progress.tsx`

- [ ] **Step 1: Write `components/scroll-progress.tsx`**

```tsx
"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left"
      style={{ scaleX, background: "#CC0000" }}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 16: RefreshToast Component

**Files:**
- Create: `components/refresh-toast.tsx`

- [ ] **Step 1: Write `components/refresh-toast.tsx`**

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { Newspaper } from "lucide-react";

export function RefreshToast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const showRef = useRef<(msg: string) => void>();

  showRef.current = (msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 3500);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/trending");
        const data = await res.json();
        if (!data.cached && data.total > 0) {
          showRef.current?.(`${data.total} new signals detected`);
        }
      } catch { /* silent */ }
    }, 300_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-1/2 top-4 z-50 -translate-x-1/2 border border-[#111111] bg-[#F9F9F7] px-5 py-2.5"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-[#CC0000]" strokeWidth={1.5} />
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#111111]">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 17: Footer Component

**Files:**
- Create: `components/footer.tsx`

- [ ] **Step 1: Write `components/footer.tsx`**

```tsx
import { Newspaper } from "lucide-react";

const sourceList = ["GitHub Trending", "Hacker News", "arXiv", "Engineering Blogs"];
const infoLinks = [
  { label: "About", href: "#" },
  { label: "API", href: "/api/trending" },
  { label: "Privacy", href: "#" },
  { label: "Vercel ▲", href: "https://vercel.com" },
];

export function Footer() {
  return (
    <footer id="about" className="border-t-4 border-[#111111] bg-[#111111]">
      <div className="mx-auto max-w-screen-xl px-4 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="mb-4 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-[#F9F9F7]" strokeWidth={1.5} />
              <p className="font-serif text-lg font-black text-[#F9F9F7]">THE SIGNAL</p>
            </div>
            <p className="font-body text-sm leading-relaxed text-[#A3A3A3]">
              Real-time tech intelligence. No noise. Just signal.
              <br />
              Powered by Firecrawl, Tavily &amp; Exa.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CC0000]">
                Data Sources
              </p>
              <ul className="space-y-2">
                {sourceList.map((s) => (
                  <li key={s}>
                    <span className="font-mono text-[11px] text-[#A3A3A3]">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CC0000]">
                Info
              </p>
              <ul className="space-y-2">
                {infoLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="font-mono text-[11px] text-[#A3A3A3] transition-colors duration-200 hover:text-[#F9F9F7]"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#404040] pt-6 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
          &copy; {new Date().getFullYear()} The Signal &middot; Printed in Digital &middot; Edition Vol. I
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify** → `npx tsc --noEmit`
- [ ] **Step 3: Commit**

---

### Task 18: Root Layout

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (already written in Task 1)

- [ ] **Step 1: Write `app/layout.tsx`** (replace scaffold default)

```tsx
import type { Metadata } from "next";
import { ScrollProgress } from "@/components/scroll-progress";
import { RefreshToast } from "@/components/refresh-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Signal — Real-Time Tech Intelligence",
  description: "Real-time technology pulse from GitHub, Hacker News, and the open web. No noise. Just signal.",
  openGraph: {
    title: "The Signal — Real-Time Tech Intelligence",
    description: "Real-time technology pulse from GitHub, Hacker News, and the open web.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Signal",
    description: "Real-time tech intelligence. No noise. Just signal.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Lora:ital,wght@0,400;0,600;1,400&display=block');
        `}</style>
      </head>
      <body
        className="min-h-screen font-sans antialiased"
        style={{
          backgroundColor: "#F9F9F7",
          color: "#111111",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23111111' fill-opacity='0.04' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`,
        }}
      >
        <ScrollProgress />
        <RefreshToast />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify** → `npm run build`
- [ ] **Step 3: Commit**

---

### Task 19: Home Page (SSR)

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Write `app/page.tsx`**

```tsx
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { SignalList } from "@/components/signal-list";
import { SourceBreakdown } from "@/components/source-breakdown";
import { Footer } from "@/components/footer";
import type { TrendingResponse, SourcesResponse } from "@/lib/types";

const API_BASE = process.env.NODE_ENV === "production"
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

async function getTrendingData(): Promise<TrendingResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/trending`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("[page] Failed to fetch trending:", error);
    return { signals: [], total: 0, cached: false, cachedAt: null, stale: false };
  }
}

async function getSourcesData(): Promise<SourcesResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/sources`, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("[page] Failed to fetch sources:", error);
    return { sources: [], updatedAt: new Date().toISOString() };
  }
}

export default async function HomePage() {
  const [trending, sources] = await Promise.all([getTrendingData(), getSourcesData()]);

  return (
    <>
      <Nav />
      <main>
        <Hero signalCount={trending.total} />
        <SignalList signals={trending.signals} />
        <SourceBreakdown sources={sources.sources} />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify** → `npm run build`
- [ ] **Step 3: Commit**

---

### Task 20: Loading, Error, and 404 Pages

**Files:**
- Create: `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`

- [ ] **Step 1: Write `app/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-28">
      {/* Hero skeleton */}
      <div className="mb-16 ml-4 sm:ml-8">
        <div className="mb-6 h-3 w-48 bg-[#E5E5E0]" />
        <div className="mb-6 space-y-3">
          <div className="h-12 w-3/4 bg-[#E5E5E0]" />
          <div className="h-12 w-1/2 bg-[#E5E5E0]" />
        </div>
        <div className="h-4 w-64 bg-[#E5E5E0]" />
      </div>
      {/* Signal skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 border-b border-[#E5E5E0] py-5 pl-2">
          <div className="h-3 w-20 bg-[#E5E5E0]" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-[#E5E5E0]" />
            <div className="h-3 w-1/3 bg-[#E5E5E0]" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `app/error.tsx`**

```tsx
"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center px-4 py-28 text-center">
      <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
        Transmission Error
      </p>
      <h2 className="mb-4 font-serif text-4xl font-black text-[#111111]">Signal Interrupted</h2>
      <p className="mb-8 max-w-md font-body text-sm leading-relaxed text-[#525252]">
        We couldn&apos;t fetch the latest signals. This might be a temporary outage with our data sources.
      </p>
      <button
        onClick={reset}
        className="border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]"
      >
        Try Again
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Write `app/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center px-4 py-28 text-center">
      <p className="mb-4 font-serif text-8xl font-black leading-none text-[#E5E5E0]">404</p>
      <p className="mb-8 font-serif text-xl italic text-[#737373]">This page does not exist.</p>
      <Link
        href="/"
        className="border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]"
      >
        Return Home
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Verify** → `npm run build`
- [ ] **Step 5: Commit**

---

### Task 21: Vercel Deployment Config

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Write `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

- [ ] **Step 2: Commit**

---

### Task 22: Final Integration & Build

- [ ] **Step 1: Clean up boilerplate**

```bash
rm -f app/page.module.css 2>/dev/null || true
rm -f app/favicon.ico 2>/dev/null || true
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Production build**

```bash
npm run build
```
Expected: Successful build.

- [ ] **Step 4: Dev server smoke test**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- [ ] Page loads without errors
- [ ] Nav shows "THE SIGNAL" + LIVE indicator (pulsing green dot)
- [ ] Hero masthead animates in with staggered words
- [ ] Edition metadata: "Vol. I — [date] — Digital Edition"
- [ ] Signal cards section renders (empty state if no API keys)
- [ ] Source breakdown section with 4 source panels
- [ ] Footer with inverted black background
- [ ] Scroll progress bar (red, top of page)
- [ ] Zero rounded corners on all elements
- [ ] Sharp border design throughout

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final integration, cleanup, and build verification"
```

---

### Task 23: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/the-signal.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Import to Vercel**

1. Go to https://vercel.com/new
2. Import repo
3. Set environment variables:
   - `FIRECRAWL_API_KEY`
   - `TAVILY_API_KEY`
   - `EXA_API_KEY`
   - `REFRESH_TOKEN`
4. Deploy

- [ ] **Step 3: Connect Vercel KV**

1. Vercel Dashboard → Storage → KV → Create
2. Connect to project
3. Variables auto-injected

- [ ] **Step 4: Verify production**

Open production URL. All sections render. Live indicator active. Cached data showing.

---

## Implementation Order

```
Task 1   (scaffold)
  ↓
Task 2   (types)
  ↓
Task 3   (cache)     ←──┐
Task 4   (dedup)     ←──┤ parallel
  ↓                     │
Task 5   (sources)   ───┘
  ↓
Task 6   (aggregator)
  ↓
Task 7   (/api/trending)  ←──┐
Task 8   (/api/sources)   ←──┤
  ↓                          │
Task 9   (LiveIndicator) ────┤
Task 10  (Nav)         ──────┤
Task 11  (Hero)        ──────┤
Task 12  (SignalCard)  ──────┤ parallel
Task 13  (SignalList)  ──────┤
Task 14  (SourceBreakdown) ──┤
Task 15  (ScrollProgress) ───┤
Task 16  (RefreshToast) ─────┤
Task 17  (Footer)      ──────┘
  ↓
Task 18  (layout)
  ↓
Task 19  (page.tsx)
  ↓
Task 20  (loading/error/404)
  ↓
Task 21  (vercel.json)
  ↓
Task 22  (integration + build)
  ↓
Task 23  (deploy)
```
