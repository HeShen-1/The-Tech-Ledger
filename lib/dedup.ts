import type { RawSignal } from "./types";

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function titleSimilarity(a: string, b: string): number {
  const la = a.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const lb = b.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const maxLen = Math.max(la.length, lb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(la, lb) / maxLen;
}

export function deduplicateSignals(signals: RawSignal[]): RawSignal[] {
  const seen = new Set<string>();
  const result: RawSignal[] = [];
  for (const signal of signals) {
    const normUrl = normalizeUrl(signal.url);
    if (seen.has(normUrl)) continue;
    const isDup = result.some(
      (e) => titleSimilarity(signal.title, e.title) > 0.85,
    );
    if (!isDup) { seen.add(normUrl); result.push(signal); }
  }
  return result;
}
