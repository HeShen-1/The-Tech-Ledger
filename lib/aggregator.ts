import type { Signal, RawSignal, TrendingResponse } from "./types";
import { fetchAllSources } from "./sources";
import { deduplicateSignals } from "./dedup";
import { getCachedTrending, setCachedTrending } from "./cache";

function scoreLabel(source: Signal["source"], score: number): string {
  switch (source) {
    case "github":
      return `⭐ ${score.toLocaleString()}`;
    case "hackernews":
      return `▲ ${score}`;
    case "arxiv":
      return `📄 ${score}`;
    case "blog":
      return `↗ ${score}`;
  }
}

function sourceLabel(source: Signal["source"]): string {
  switch (source) {
    case "github":
      return "github.com";
    case "hackernews":
      return "news.ycombinator.com";
    case "arxiv":
      return "arxiv.org";
    case "blog":
      return "Engineering Blog";
  }
}

function estimateReadTime(summary: string | null): number | null {
  if (!summary) return null;
  return Math.max(1, Math.round(summary.split(/\s+/).length / 200));
}

function generateId(url: string): string {
  return Buffer.from(url).toString("base64url").slice(0, 16);
}

const HALF_LIFE_HOURS: Record<Signal["source"], number> = {
  github: 6,
  hackernews: 12,
  blog: 48,
  arxiv: 168,
};

function timeDecay(timestamp: string, source: Signal["source"]): number {
  const ageHours =
    (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
  const halfLife = HALF_LIFE_HOURS[source];
  return Math.exp((-Math.LN2 * ageHours) / halfLife);
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
    .map((s) => ({ ...s, score: s.score * timeDecay(s.timestamp, s.source) }))
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
    signals: ranked,
    total: ranked.length,
    cached: false,
    cachedAt: new Date().toISOString(),
    stale: false,
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
    signals: ranked,
    total: ranked.length,
    cached: false,
    cachedAt: new Date().toISOString(),
    stale: false,
  };
  await setCachedTrending(response);
  return response;
}
