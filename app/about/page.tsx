import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "About — The Tech Ledger",
  description: "About The Tech Ledger — a real-time technology news aggregator styled as a digital newspaper.",
};

const stackItems = [
  { name: "Next.js 14", role: "Framework — SSR, API Routes, App Router", url: "https://nextjs.org" },
  { name: "Tailwind CSS", role: "Styling — utility-first design tokens", url: "https://tailwindcss.com" },
  { name: "Framer Motion", role: "Animation — staggered entry, spring physics", url: "https://framer.com/motion" },
  { name: "Vercel KV", role: "Caching — Redis edge, 5-min TTL", url: "https://vercel.com/docs/storage/vercel-kv" },
  { name: "Firecrawl", role: "Scraping — GitHub Trending extraction", url: "https://firecrawl.dev" },
  { name: "Tavily", role: "Search — HN & engineering blogs", url: "https://tavily.com" },
  { name: "Exa", role: "Semantic — arXiv paper discovery", url: "https://exa.ai" },
  { name: "Lucide", role: "Icons — sharp, minimal, consistent", url: "https://lucide.dev" },
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-screen-xl px-4 py-28">
      {/* ===== Section 1: Masthead ===== */}
      <section className="mb-20">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
          The Masthead
        </p>
        <h1 className="mb-4 font-serif text-4xl font-black text-[#111111] sm:text-5xl lg:text-6xl">
          About The Tech Ledger
        </h1>
        <p className="max-w-xl font-body text-lg italic leading-relaxed text-[#525252]">
          &ldquo;All the Tech That&rsquo;s Fit to Print.&rdquo;
        </p>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px w-12 bg-[#CC0000]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#737373]">
            Est. June 2026 &middot; Digital Edition
          </span>
        </div>
      </section>

      {/* ===== Section 2: Mission ===== */}
      <section className="mb-20">
        <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
          The Mission
        </p>
        <div className="space-y-5 font-body text-base leading-relaxed text-[#525252]">
          <p>
            <span className="float-left mr-3 font-serif text-7xl font-black leading-[0.7] text-[#111111]">T</span>
            he technology landscape moves fast. Every day, thousands of repositories star on GitHub, hundreds of stories
            climb Hacker News, and breakthrough papers land on arXiv. But keeping up means checking a dozen tabs, filtering
            noise, and still missing what matters.
          </p>
          <p>
            <strong className="font-bold text-[#111111]">The Tech Ledger</strong> solves this. It is a single page that
            aggregates trending signals from the most important sources in software engineering and AI research, then
            presents them with the clarity and hierarchy of a well-edited newspaper. No infinite scroll. No algorithmic
            feed. No dark patterns. Just ink and paper, rendered in pixels.
          </p>
          <p>
            Built as a demonstration of full-stack capability — from API integration and caching strategy to typographic
            design and animation — The Tech Ledger is equal parts engineering portfolio and daily utility.
          </p>
        </div>
      </section>

      {/* ===== Section 3: How It Works ===== */}
      <section className="mb-20">
        <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
          How It Works
        </p>
        <div className="space-y-6">
          <p className="font-body text-base leading-relaxed text-[#525252]">
            Every time you visit, a pipeline of specialized APIs fires in parallel to gather the latest signals:
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "01", title: "Scrape", desc: "Firecrawl extracts trending repositories from GitHub with structured data parsing.", color: "#111111" },
              { step: "02", title: "Search", desc: "Tavily searches Hacker News and engineering blogs for breaking stories and discussions.", color: "#111111" },
              { step: "03", title: "Discover", desc: "Exa semantically searches arXiv for the latest AI and machine learning papers.", color: "#CC0000" },
            ].map((s) => (
              <div key={s.step} className="border border-[#111111] p-5">
                <span className="font-mono text-[10px] font-bold text-[#737373]">STEP {s.step}</span>
                <h3 className="mt-1 font-serif text-lg font-black text-[#111111]">{s.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-[#525252]">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-4">
            <div className="flex-1 h-px bg-[#E5E5E0]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">Deduplicate &amp; Rank</span>
            <div className="flex-1 h-px bg-[#E5E5E0]" />
          </div>
          <p className="font-body text-sm leading-relaxed text-[#525252]">
            Duplicate stories across sources are merged by URL normalization and title similarity. Results are ranked
            by a composite score with exponential time decay — fresher signals surface to the top. Everything is cached
            in Vercel KV for five minutes, so repeat visits are instant.
          </p>
        </div>
      </section>

      {/* ===== Section 4: The Stack ===== */}
      <section className="mb-20">
        <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
          The Stack
        </p>
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {stackItems.map((item, i) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group border-[#111111] p-5 transition-all duration-200 hover:bg-[#F5F5F5]
                ${i % 2 === 0 ? "sm:border-r" : ""}
                ${i % 4 !== 3 ? "lg:border-r" : ""}
                border-b border-t border-l
                ${i % 4 === 0 ? "lg:border-l" : ""}
                ${i === 0 ? "sm:border-l" : ""}
              `}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-serif text-sm font-black text-[#111111]">{item.name}</h3>
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#CC0000] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-[#737373]">{item.role}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ===== Section 5: Edition ===== */}
      <section className="border-t-4 border-[#111111] pt-10">
        <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#737373]">
          Edition
        </p>
        <div className="mx-auto max-w-2xl space-y-3 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
          <p>
            <span className="text-[#111111] font-bold">Vol. I</span> &middot; Printed in Digital &middot; Est. June 2026
          </p>
          <p>
            <span className="text-[#111111] font-bold">Publisher</span> &middot; The Tech Ledger Press
          </p>
          <p>
            <span className="text-[#111111] font-bold">Editor-in-Chief</span> &middot; He Wenwan
          </p>
          <p className="pt-2 text-[#525252] normal-case tracking-normal">
            Built as an open-source portfolio project. All source code available on request.
            Designed in the Newsprint tradition — zero radius, sharp geometry, visible grid lines,
            and typographic hierarchy inspired by the golden age of print journalism.
          </p>
        </div>
      </section>

      <Link
        href="/"
        className="mt-12 inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]"
      >
        &larr; Back to the Ledger
      </Link>
      </main>
      <Footer />
    </>
  );
}
