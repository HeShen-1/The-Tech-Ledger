import { kv } from "@vercel/kv";
import type { TrendingResponse, Signal } from "./types";
import { getTrending } from "./aggregator";
import { generateAiSummary, generateAiSummaryFromSummaries } from "./ai-summary";

const REPORT_PREFIX = "report:daily:";
const WEEKLY_PREFIX = "report:weekly:";
const MONTHLY_PREFIX = "report:monthly:";
const DATES_KEY = "report:dates";

function kvAvailable(): boolean {
  return !!process.env.KV_URL && !process.env.KV_URL.includes("xxx");
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function weekKey(date?: Date): string {
  const d = date || new Date();
  // ISO week number
  const start = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function monthKey(date?: Date): string {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function snapshotDaily(): Promise<{ ok: boolean; key: string }> {
  const key = todayKey();
  const data = await getTrending();
  await kv.set(
    REPORT_PREFIX + key,
    {
      signals: data.signals.slice(0, 20),
      snapshotAt: new Date().toISOString(),
      total: data.total,
      sources: data.signals.length,
    },
    { ex: 86400 * 90 },
  );
  // Smart AI generation — don't regenerate if recently done
  const existingAi = await kv.get<string>(REPORT_PREFIX + key + ":ai");
  const lastAiTime = await kv.get<string>(REPORT_PREFIX + key + ":ai:time");
  let shouldGenerate = !existingAi;
  if (existingAi && lastAiTime) {
    const hoursSince = (Date.now() - new Date(lastAiTime).getTime()) / 3600000;
    if (hoursSince > 6) {
      // Check if top signals meaningfully changed
      const prevSignals = await kv.get<{ signals: Signal[] }>(REPORT_PREFIX + key);
      if (prevSignals) {
        const prevTop = prevSignals.signals.slice(0, 3).map(s => s.url).join(",");
        const currTop = data.signals.slice(0, 3).map(s => s.url).join(",");
        shouldGenerate = prevTop !== currTop;
      }
    }
  }

  if (shouldGenerate) {
    const aiSummary = await generateAiSummary(data.signals, "daily");
    if (aiSummary) {
      await kv.set(REPORT_PREFIX + key + ":ai", aiSummary, { ex: 86400 * 90 });
      await kv.set(REPORT_PREFIX + key + ":ai:time", new Date().toISOString(), { ex: 86400 });
    }
  }
  // Add to dates set
  await kv.sadd(DATES_KEY, key);
  return { ok: true, key };
}

export async function getDailyReport(
  date: string,
): Promise<{
  signals: Signal[];
  snapshotAt: string;
  total: number;
  sources: number;
  aiSummary?: string;
} | null> {
  if (!kvAvailable()) return null;
  const report = await kv.get<{
    signals: Signal[];
    snapshotAt: string;
    total: number;
    sources: number;
  }>(REPORT_PREFIX + date);
  if (!report) return null;
  const aiSummary = await kv.get<string>(REPORT_PREFIX + date + ":ai");
  return { ...report, aiSummary: aiSummary ?? undefined };
}

export async function getReportDates(): Promise<string[]> {
  if (!kvAvailable()) return [];
  try {
    const dates = await kv.smembers(DATES_KEY);
    return (dates as string[]).sort().reverse();
  } catch (error) {
    console.error("[reports] KV getReportDates failed:", error);
    return [];
  }
}

export async function getWeeklyReport(
  week: string,
): Promise<{
  signals: Signal[];
  days: number;
  week: string;
  aiSummary?: string;
} | null> {
  if (!kvAvailable()) return null;
  try {
    const report = await kv.get<{
      signals: Signal[];
      days: number;
      week: string;
    }>(WEEKLY_PREFIX + week);
    if (!report) return null;
    const aiSummary = await kv.get<string>(WEEKLY_PREFIX + week + ":ai");
    return { ...report, aiSummary: aiSummary ?? undefined };
  } catch (error) {
    console.error("[reports] KV getWeeklyReport failed:", error);
    return null;
  }
}

export async function getMonthlyReport(
  month: string,
): Promise<{
  signals: Signal[];
  days: number;
  month: string;
  aiSummary?: string;
} | null> {
  if (!kvAvailable()) return null;
  try {
    const report = await kv.get<{
      signals: Signal[];
    days: number;
    month: string;
  }>(MONTHLY_PREFIX + month);
      if (!report) return null;
      const aiSummary = await kv.get<string>(MONTHLY_PREFIX + month + ":ai");
      return { ...report, aiSummary: aiSummary ?? undefined };
    } catch (error) {
      console.error("[reports] KV getMonthlyReport failed:", error);
      return null;
    }
  }

export async function generateWeeklyReport(): Promise<{ ok: boolean }> {
  const wk = weekKey();
  const dates = await getReportDates();
  const thisWeek = dates.filter(
    (d) =>
      d >= `${new Date().getFullYear()}-01-01` &&
      weekKey(new Date(d)) === wk,
  );
  if (thisWeek.length === 0) return { ok: false };
  // Collect daily AI summaries
  const dailySummaries: string[] = [];
  for (const d of thisWeek) {
    const aiText = await kv.get<string>(REPORT_PREFIX + d + ":ai");
    if (aiText) dailySummaries.push(`[${d}] ${aiText.slice(0, 500)}`);
  }
  const aiSummary = dailySummaries.length > 0
    ? await generateAiSummaryFromSummaries(dailySummaries, "weekly")
    : null;
  await kv.set(
    WEEKLY_PREFIX + wk,
    { signals: [], days: thisWeek.length, week: wk },
    { ex: 86400 * 365 },
  );
  if (aiSummary) {
    await kv.set(WEEKLY_PREFIX + wk + ":ai", aiSummary, { ex: 86400 * 365 });
  }
  return { ok: true };
}

export async function generateMonthlyReport(): Promise<{ ok: boolean }> {
  const mo = monthKey();
  const dates = await getReportDates();
  const thisMonth = dates.filter((d) => d.startsWith(mo));
  if (thisMonth.length === 0) return { ok: false };
  // Collect weekly AI summaries for this month
  const weeklySummaries: string[] = [];
  const seenWeeks = new Set<string>();
  for (const d of thisMonth) {
    const wk = weekKey(new Date(d));
    if (seenWeeks.has(wk)) continue;
    seenWeeks.add(wk);
    const aiText = await kv.get<string>(WEEKLY_PREFIX + wk + ":ai");
    if (aiText) weeklySummaries.push(`[Week ${wk}] ${aiText.slice(0, 500)}`);
  }
  const aiSummary = weeklySummaries.length > 0
    ? await generateAiSummaryFromSummaries(weeklySummaries, "monthly")
    : null;
  await kv.set(
    MONTHLY_PREFIX + mo,
    { signals: [], days: thisMonth.length, month: mo },
    { ex: 86400 * 365 },
  );
  if (aiSummary) {
    await kv.set(MONTHLY_PREFIX + mo + ":ai", aiSummary, { ex: 86400 * 365 });
  }
  return { ok: true };
}
