import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { SignalList } from "@/components/signal-list";
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
        <SignalList signals={trending.signals} sources={sources.sources} />
      </main>
      <Footer />
    </>
  );
}
