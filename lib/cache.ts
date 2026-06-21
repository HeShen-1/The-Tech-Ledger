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
