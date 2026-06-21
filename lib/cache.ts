import { kv } from "@vercel/kv";
import type { TrendingResponse, SourcesResponse } from "./types";

const SOURCES_KEY = "sources:latest";
const DEFAULT_TTL = 300;

function dailyKey(): string {
  const d = new Date();
  return `trending:daily:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function secondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

export async function getCachedTrending(): Promise<TrendingResponse | null> {
  try {
    return await kv.get<TrendingResponse>(dailyKey());
  } catch (error) {
    console.error("[cache] KV read failed:", error);
    return null;
  }
}

export async function setCachedTrending(data: TrendingResponse): Promise<void> {
  try {
    await kv.set(dailyKey(), data, { ex: secondsUntilMidnight() });
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
