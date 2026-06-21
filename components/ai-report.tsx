"use client";

import type { TrendingResponse, SourcesResponse } from "@/lib/types";

function topBySource(signals: TrendingResponse["signals"], source: string, n: number) {
  return signals.filter((s) => s.source === source).slice(0, n);
}

function topCategories(signals: TrendingResponse["signals"], n: number): string[] {
  const counts: Record<string, number> = {};
  for (const s of signals) {
    counts[s.category] = (counts[s.category] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([cat]) => cat);
}

function plural(n: number, word: string, pluralForm?: string): string {
  if (n === 1) return `${n} ${word}`;
  if (pluralForm) return `${n} ${pluralForm}`;
  if (word.endsWith("y") && !word.endsWith("ay") && !word.endsWith("ey") && !word.endsWith("oy") && !word.endsWith("uy")) {
    return `${n} ${word.slice(0, -1)}ies`;
  }
  return `${n} ${word}s`;
}

export function AiReport({
  trending,
  sources,
}: {
  trending: TrendingResponse;
  sources: SourcesResponse;
}) {
  const { signals } = trending;
  if (signals.length === 0) {
    return (
      <p className="font-body text-base italic leading-relaxed text-[#737373]">
        No signals detected today. The presses are quiet.
      </p>
    );
  }

  const ghTop = topBySource(signals, "github", 3);
  const hnTop = topBySource(signals, "hackernews", 2);
  const arxivTop = topBySource(signals, "arxiv", 2);
  const blogTop = topBySource(signals, "blog", 2);
  const cats = topCategories(signals, 4);
  const ghSource = sources.sources.find((s) => s.name === "GitHub Trending");
  const hnSource = sources.sources.find((s) => s.name === "Hacker News");
  const arxivSource = sources.sources.find((s) => s.name === "arXiv Papers");
  const blogSource = sources.sources.find((s) => s.name === "Tech Blogs");

  const totalSources = new Set(signals.map((s) => s.source)).size;

  return (
    <div className="space-y-6 font-body text-base leading-relaxed text-[#525252]">
      {/* Lead paragraph */}
      <p>
        <span className="float-left mr-3 font-serif text-7xl font-black leading-[0.7] text-[#111111]">T</span>
        oday&apos;s edition tracks{" "}
        <strong className="font-bold text-[#111111]">{plural(signals.length, "unique signal")}</strong>{" "}
        across <strong className="font-bold text-[#111111]">{plural(totalSources, "source")}</strong>.
        {ghTop.length > 0 && (
          <>
            {" "}The lead story comes from GitHub Trending, where{" "}
            <strong className="font-bold text-[#111111]">{ghTop[0].title}</strong>{" "}
            earned <strong className="font-bold text-[#111111]">{ghTop[0].scoreLabel}</strong>
            {ghTop[1] && (
              <>
                , followed by <strong className="font-bold text-[#111111]">{ghTop[1].title}</strong>{" "}
                ({ghTop[1].scoreLabel})
              </>
            )}
            {ghTop[2] && (
              <>
                {" "}and <strong className="font-bold text-[#111111]">{ghTop[2].title}</strong>{" "}
                ({ghTop[2].scoreLabel})
              </>
            )}
            .
          </>
        )}
      </p>

      {/* Source breakdown */}
      {ghSource && ghTop.length > 0 && (
        <p>
          <strong className="font-bold text-[#111111]">GitHub Trending</strong>{" "}
          contributed {plural(ghTop.length, "repository")}, spanning languages
          including{" "}
          {Array.from(new Set(
              signals
                .filter((s) => s.source === "github")
                .slice(0, 5)
                .map((s) => s.category)
                .filter((c) => c !== "Unknown"),
            ))
            .slice(0, 5)
            .join(", ")}
          .{" "}
          {ghSource.status === "ok"
            ? `The source responded in ${ghSource.latency}ms.`
            : "The source experienced delays today."}
        </p>
      )}

      {arxivTop.length > 0 && (
        <p>
          <strong className="font-bold text-[#111111]">Research &amp; Papers</strong>{" "}
          from arXiv brought {plural(arxivTop.length, "paper")} to our attention
          {arxivTop[0] && (
            <>
              , including{" "}
              <strong className="font-bold text-[#111111]">{arxivTop[0].title}</strong>
            </>
          )}
          {arxivTop[1] && (
            <>
              {" "}and{" "}
              <strong className="font-bold text-[#111111]">{arxivTop[1].title}</strong>
            </>
          )}
          {arxivTop[0]?.summary && (
            <>
              . {arxivTop[0].summary.slice(0, 200)}
              {arxivTop[0].summary.length > 200 ? "..." : ""}
            </>
          )}
        </p>
      )}

      {blogTop.length > 0 && (
        <p>
          <strong className="font-bold text-[#111111]">Engineering Blogs</strong>{" "}
          added {plural(blogTop.length, "story")}
          {blogTop[0] && (
            <>
              , led by{" "}
              <strong className="font-bold text-[#111111]">{blogTop[0].title}</strong>
            </>
          )}
          {blogTop[1] && (
            <>
              {" "}and{" "}
              <strong className="font-bold text-[#111111]">{blogTop[1].title}</strong>
            </>
          )}
          . The Tech Blogs source covers 9 domains including GitHub&apos;s engineering blog,
          Stack Overflow, Meta Engineering, Stripe, Cloudflare, and Netflix Tech Blog.
        </p>
      )}

      {hnSource && hnTop.length > 0 && (
        <p>
          <strong className="font-bold text-[#111111]">Hacker News</strong>{" "}
          contributed {plural(hnTop.length, "story")} after deduplication
          {hnTop[0] && (
            <>
              , featuring{" "}
              <strong className="font-bold text-[#111111]">{hnTop[0].title}</strong>
            </>
          )}
          .{" "}
          {hnTop.length <= 2
            ? "HN discussions showed significant overlap with content from other sources, suggesting broad consensus on today's important stories."
            : "The HN front page is active with diverse technical discussions."}
        </p>
      )}

      {/* Category roundup */}
      {cats.length > 0 && (
        <p>
          <strong className="font-bold text-[#111111]">Dominant Categories</strong>{" "}
          today: {cats.join(", ")}.{" "}
          {cats.includes("AI/ML") || cats.includes("AI Research")
            ? "AI and machine learning continue to drive the majority of developer attention across all sources."
            : "Today's signal mix reflects a balanced technology landscape."}
        </p>
      )}

      {/* Source health footer */}
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
        Source status:{" "}
        {sources.sources
          .map((s) => `${s.name} (${s.status === "ok" ? "✓" : "✗"} ${s.latency}ms)`)
          .join(" · ")}
        {" · "}Cache: {trending.cached ? "hit" : "fresh"}
      </p>
    </div>
  );
}
