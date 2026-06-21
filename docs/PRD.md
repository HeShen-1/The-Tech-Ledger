# The Tech Ledger — Product Requirements Document

> **Version:** 1.0.0 | **Date:** 2026-06-21 | **Status:** Design Approved

---

## 1. Executive Summary

**The Tech Ledger** is a real-time technology trending aggregator styled as a digital newspaper. It fetches hot topics from GitHub Trending, Hacker News, tech blogs, and AI research papers, then presents them with a Newsprint editorial aesthetic — sharp geometry, serif typography, high information density, and zero-radius design.

**Target Audience:** HR recruiters and technical interviewers evaluating full-stack capability.
**Core Value Proposition:** A single URL that demonstrates frontend design taste, backend data engineering, API integration, and production deployment — all in one project.

---

## 2. Problem Statement

Tech recruiters increasingly value candidates who can point to live, deployed projects. However, most portfolio pieces fall into two traps: (1) static, template-looking landing pages that show no engineering depth, or (2) functional but visually generic tools that show no design sensibility. The Tech Ledger solves both — it's a real data pipeline with a distinctive, memorable visual identity.

---

## 3. Product Goals

| Goal | Measure |
|------|---------|
| Showcase full-stack ability | Live site with SSR, API routes, third-party integrations, caching |
| Demonstrate design taste | Newsprint aesthetic — instantly recognizable, non-generic |
| Prove production readiness | Deployed on Vercel, security headers, error handling, accessibility |
| Be interview-ready | Loads fast, looks intentional, tells a clear story in 10 seconds |

---

## 4. User Stories

- **As a recruiter**, I want to see a live, working website that looks professional, so I know the candidate can build and ship.
- **As a technical interviewer**, I want to see API integration, caching strategy, and clean code architecture, so I can assess engineering maturity.
- **As a curious visitor**, I want to see what's trending in tech right now, presented in a way that's enjoyable to browse.

---

## 5. Features

### 5.1 Core Features (MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Real-time Trending Feed** | Aggregated hot topics from GitHub, HN, arXiv, tech blogs | P0 |
| **Newsprint Hero** | Newspaper-style masthead with date stamp, live indicator, signal count | P0 |
| **Signal Cards** | Individual trending items with category, source, score, read time | P0 |
| **Source Desk** | Deduped signal counts per source, rendered inline within the trending feed | P0 |
| **Source Tabs** | Filter trending feed by source: All, GitHub, HN, arXiv, Blogs | P0 |
| **Medal Ranking** | Gold/silver/bronze tier badges based on signal score thresholds | P1 |
| **Live Status** | Green dot indicator showing data freshness | P0 |
| **Scroll Progress** | Thin progress bar at page top | P1 |
| **Data Refresh** | Toast notification when new signals arrive | P1 |
| **Reports** | Daily/weekly/monthly report snapshots with a calendar date picker | P2 |
| **IP-based City Edition** | Detect visitor city from IP and display as a newspaper edition header | P2 |
| **Per-Source Time Decay** | GitHub 6h, HN 12h, Blogs 48h, arXiv 168h half-life decay curves | P0 |

### 5.2 Out of Scope (MVP)

- User accounts / authentication
- Dark mode (Newsprint is light-only by design)
- RSS / email subscriptions
- Admin dashboard

---

## 6. Design System: Newsprint

The entire UI follows a single, opinionated design language: **Newsprint**.

### Core Principles
- **Stark Geometry:** Zero border radius everywhere. Sharp 90° corners only.
- **High Information Density:** Tight padding, collapsed grid borders, newspaper column layouts.
- **Typographic Drama:** Playfair Display serif for headlines (up to 9xl), Lora for body, Inter for UI, JetBrains Mono for data.
- **Visible Structure:** Grid lines are celebrated, not hidden. Borders are explicit structural elements.
- **No Soft Shadows:** Flat design. Hover effects use hard offset shadows (`box-shadow: 4px 4px 0 #111`).
- **Paper Texture:** Subtle dot grid pattern on background, line grid overlay on sections.

### Color Palette (Light Only)
| Token | Value | Usage |
|-------|-------|-------|
| Background | `#F9F9F7` | Page background |
| Foreground | `#111111` | All text and primary borders |
| Muted | `#E5E5E0` | Secondary borders, subtle backgrounds |
| Accent | `#CC0000` | Breaking news badges, CTAs, hover states (use extremely sparingly) |

### Typography
| Role | Font | Weight |
|------|------|--------|
| Headlines (H1-H3) | Playfair Display | 400-900 |
| Body text | Lora | 400, 600 |
| UI (buttons, nav, labels) | Inter | 400-700 |
| Data (stats, dates, code) | JetBrains Mono | 400, 500 |

---

## 7. Data Sources

| Source | Tool | Content | Refresh |
|--------|------|---------|---------|
| GitHub Trending | Firecrawl (scrape) | Daily/weekly trending repos | Daily cache (TTL until midnight) |
| Hacker News | Tavily (search) | Front page, high-point articles | Daily cache (TTL until midnight) |
| AI Papers | Exa (semantic) | arXiv CS.AI / CS.CL / CS.LG | Daily cache (TTL until midnight) |
| Tech Blogs | Tavily (search) | 9 domains: github.blog, stackoverflow.blog, netflixtechblog.com, cloudflare.com, linkedin engineering, slack engineering, stripe engineering, fb engineering, rust blog | Daily cache (TTL until midnight) |

**Cron Job:** Hourly report snapshots capture aggregate signal state for historical reporting.

---

## 8. Non-Functional Requirements

### Performance
- FCP < 1.5s
- LCP < 2.5s
- CLS = 0
- Animations at 60fps (transform/opacity only)
- **Daily Cache:** Search each source once per day. Key format: `trending:daily:YYYY-MM-DD`, TTL until midnight. Subsequent requests within the same day serve from cache, avoiding redundant API calls to external sources.

### Accessibility
- WCAG 2.1 AA compliant
- All interactive elements keyboard accessible
- Visible focus indicators (`focus-visible:ring-2`)
- Semantic HTML throughout
- `prefers-reduced-motion` respected

### Security
- API keys server-side only (never exposed to client)
- Refresh endpoint token-protected
- Security headers: STS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- `.env.local` in `.gitignore`

### Browser Support
- Chrome, Firefox, Safari (latest 2 versions)
- Mobile Safari, Chrome for Android

---

## 9. Success Criteria

- [ ] Site deploys successfully on Vercel
- [ ] All 4 data sources contribute signals (when API keys configured)
- [ ] Page loads with cached data in under 1.5s
- [ ] Newsprint design system consistently applied (zero radius violations)
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Ready to include as portfolio link within one session
