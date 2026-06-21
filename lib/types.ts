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
