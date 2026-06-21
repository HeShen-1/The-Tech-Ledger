import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Globe, Search, FileText } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "API — The Tech Ledger",
};

const apis = [
  {
    name: "Firecrawl",
    description: "Web scraping and crawling API that extracts structured data from any website. Used to scrape GitHub Trending for the latest hot repositories.",
    url: "https://firecrawl.dev",
    icon: Globe,
  },
  {
    name: "Tavily",
    description: "AI-powered search API optimized for LLMs. Used to search Hacker News and engineering blogs for breaking tech stories.",
    url: "https://tavily.com",
    icon: Search,
  },
  {
    name: "Exa",
    description: "Semantic search API that understands meaning, not just keywords. Used to discover the latest AI research papers on arXiv.",
    url: "https://exa.ai",
    icon: FileText,
  },
];

export default function ApiPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-screen-xl px-4 py-28">
      <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
        Infrastructure
      </p>
      <h1 className="mb-4 font-serif text-4xl font-black text-[#111111] sm:text-5xl">
        Search APIs
      </h1>
      <p className="mb-12 max-w-xl font-body text-base leading-relaxed text-[#525252]">
        The Tech Ledger aggregates signals from three specialized APIs.
        Each serves a different purpose in the news-gathering pipeline.
      </p>

      <div className="grid gap-0 sm:grid-cols-3">
        {apis.map((api, i) => (
          <div
            key={api.name}
            className={`border-[#111111] bg-[#F9F9F7] p-6 transition-all duration-200 hover:bg-[#F5F5F5]
              ${i !== 2 ? "sm:border-r" : ""}
              border-b border-t border-l
              ${i === 0 ? "sm:border-l" : ""}
            `}
          >
            <api.icon className="mb-4 h-8 w-8 text-[#111111]" strokeWidth={1.5} />
            <h2 className="mb-2 font-serif text-xl font-black text-[#111111]">{api.name}</h2>
            <p className="mb-4 font-body text-sm leading-relaxed text-[#525252]">{api.description}</p>
            <a
              href={api.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#CC0000] transition-colors hover:text-[#111111]"
            >
              {api.url.replace("https://", "")}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-[#E5E5E0] pt-8">
        <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">
          Developer API
        </p>
        <p className="font-body text-sm leading-relaxed text-[#525252]">
          Access the aggregated trending data programmatically at{" "}
          <code className="border border-[#E5E5E0] bg-[#F5F5F5] px-1.5 py-0.5 font-mono text-xs text-[#111111]">
            /api/trending
          </code>
          . Source health status available at{" "}
          <code className="border border-[#E5E5E0] bg-[#F5F5F5] px-1.5 py-0.5 font-mono text-xs text-[#111111]">
            /api/sources
          </code>
          .
        </p>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]"
      >
        &larr; Back to the Ledger
      </Link>
      </main>
      <Footer />
    </>
  );
}
