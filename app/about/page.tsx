import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — The Tech Ledger",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-28">
      <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
        About
      </p>
      <h1 className="mb-6 font-serif text-4xl font-black text-[#111111] sm:text-5xl">
        The Tech Ledger
      </h1>
      <div className="max-w-2xl space-y-4 font-body text-base leading-relaxed text-[#525252]">
        <p>
          A real-time technology news aggregator styled as a digital newspaper.
          We track trending repositories on GitHub, front-page stories on Hacker
          News, cutting-edge AI papers on arXiv, and engineering blogs from the
          world&apos;s best teams.
        </p>
        <p>
          Built with Next.js, Tailwind CSS, Framer Motion, and Vercel KV.
          Data sourced via Firecrawl, Tavily, and Exa APIs.
        </p>
        <p>
          Designed in the Newsprint editorial tradition — sharp geometry, serif
          typography, visible grid lines, and zero radius corners. No dark mode.
          No soft shadows. Just ink and paper, rendered in pixels.
        </p>
      </div>
      <Link
        href="/"
        className="mt-8 inline-block border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]"
      >
        &larr; Back to the Ledger
      </Link>
    </div>
  );
}
