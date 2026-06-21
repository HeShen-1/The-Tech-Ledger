<div align="center">

# The Tech Ledger

[![Vercel Deploy](https://img.shields.io/github/deployments/HeShen-1/The-Tech-Ledger/production?label=Vercel&logo=vercel&logoColor=white&style=flat-square)](https://the-tech-ledger.vercel.app)
[![License](https://img.shields.io/badge/license-Apache%202.0-%23D2211D?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&style=flat-square)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![CI](https://img.shields.io/github/actions/workflow/status/HeShen-1/The-Tech-Ledger/ci.yml?label=CI&logo=githubactions&logoColor=white&style=flat-square)](https://github.com/HeShen-1/The-Tech-Ledger/actions)

> Real-time technology trending aggregator. Newsprint editorial design. Vercel deployment.

**"All the Tech That's Fit to Print."** — A digital newspaper tracking what's trending in software engineering and AI research, styled with the authority and clarity of a print broadsheet.

🔗 **Live:** [the-tech-ledger.vercel.app](https://the-tech-ledger.vercel.app)

[English](README.md) · [简体中文](README_ZH.md)

</div>

---

## Features

- **Trending Feed** — Real-time signals from GitHub, Hacker News, arXiv, and engineering blogs, with per-source time decay
- **Source Filtering** — Tab-based navigation across data sources with medal-ranking (gold/silver/bronze)
- **AI Editorial Reports** — DeepSeek v4-flash generates daily newspaper-style editorial summaries; weekly and monthly digests synthesize via summary-of-summaries pipeline
- **Reports Archive** — Calendar-based navigation with daily/weekly/monthly report pages
- **Newsprint Design** — Zero border radius, Playfair Display + Lora + Inter + JetBrains Mono typography, Beige Paper texture, dot-grid overlay, visible grid lines, hard-shadow hover

---

## Screenshots

| Trending Feed | Reports | About |
|:---:|:---:|:---:|
| ![Trending](public/screenshot-hero.png) | ![Reports](public/screenshot-reports.png) | ![About](public/screenshot-about.png) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript 5.x (strict) |
| Styling | Tailwind CSS 3.4+, custom CSS utilities |
| Animation | Framer Motion 11+ |
| Caching | Vercel KV (daily TTL) |
| Data: Scraping | [Firecrawl](https://firecrawl.dev) |
| Data: Search | [Tavily](https://tavily.com) |
| Data: Semantic | [Exa](https://exa.ai) |
| AI: Summaries | [DeepSeek v4-flash](https://api-docs.deepseek.com) |
| Icons | [Lucide](https://lucide.dev) |

---

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in API keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required API Keys

| Key | Service | Get it at |
|-----|---------|-----------|
| `FIRECRAWL_API_KEY` | Web scraping | [firecrawl.dev](https://firecrawl.dev) |
| `TAVILY_API_KEY` | AI search | [tavily.com](https://tavily.com) |
| `EXA_API_KEY` | Semantic search | [exa.ai](https://exa.ai) |
| `DEEPSEEK_API_KEY` | AI summaries | [platform.deepseek.com](https://platform.deepseek.com) |
| `REFRESH_TOKEN` | Cache refresh | Any random string |

Without API keys, the site renders with zero signals — all sections still load correctly.

---

## CI/CD

Every push to `main` triggers:

- **TypeCheck + Lint + Build** — `tsc --noEmit` → `next lint` → `npm run build`
- **Security Audit** — `npm audit`
- **Secret Scan** — Gitleaks detects hardcoded keys
- **Vercel Auto-Deploy** — production deploy on build success

---

## Project Structure

```
├── app/
│   ├── layout.tsx           # Root layout + fonts + textures
│   ├── page.tsx             # SSR homepage
│   ├── loading/error/404    # State pages
│   ├── reports/             # Reports pages (daily/weekly/monthly)
│   ├── about/               # About page
│   └── api/
│       ├── trending/        # GET /api/trending
│       ├── sources/         # GET /api/sources
│       └── reports/         # Report snapshot + dates API
├── components/
│   ├── nav.tsx              # Sticky nav + edition metadata
│   ├── hero.tsx             # Masthead with staggered animation
│   ├── signal-card.tsx      # Individual trending item
│   ├── signal-list.tsx      # Source-filtered signal list
│   ├── source-breakdown.tsx # Source desk with stats
│   ├── ai-report.tsx        # Editorial AI report display
│   ├── report-calendar.tsx  # Month calendar grid
│   ├── week-calendar.tsx    # Week calendar grid
│   └── ...
├── lib/
│   ├── types.ts             # Shared TypeScript interfaces
│   ├── cache.ts             # Vercel KV wrappers
│   ├── aggregator.ts        # fetch → dedup → rank → cache
│   ├── sources.ts           # Firecrawl/Tavily/Exa clients
│   ├── dedup.ts             # URL + title deduplication
│   ├── ai-summary.ts        # DeepSeek AI summary generation
│   └── reports.ts           # Report snapshot + retrieval
├── .github/workflows/       # CI/CD (TypeCheck, Lint, Build, Audit, Secret Scan)
├── docs/                    # PRD, Architecture, Specs, Plans
├── CLAUDE.md                # AI agent instructions + design system
├── CHANGELOG.md             # All notable changes
├── README_ZH.md             # Chinese README
└── .env.example             # Environment variable template
```

---

## Design System

The Tech Ledger follows a strict **Newsprint** design language:

- **Zero radius** — every element sharp-edged
- **No soft shadows** — hover uses hard offset `box-shadow: 4px 4px 0 #111`
- **No dark mode** — light only (`#F9F9F7` background)
- **Visible grid** — borders are celebrated, not hidden
- **Typography hierarchy** — Playfair Display (headlines), Lora (body), Inter (UI), JetBrains Mono (data)

See [CLAUDE.md](CLAUDE.md) for the full design system specification.

---

## Deployment

```bash
npm run build
# Deploy to Vercel — auto-detects Next.js framework
# Connect Vercel KV in Dashboard → Storage → KV
# Set environment variables in Vercel Dashboard
```

---

## License

Apache License 2.0 — 参见 [LICENSE](LICENSE)。
