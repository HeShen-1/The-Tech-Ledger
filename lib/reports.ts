import { kv } from "@vercel/kv";
import type { TrendingResponse, Signal } from "./types";
import { getTrending } from "./aggregator";

const REPORT_PREFIX = "report:daily:";
const WEEKLY_PREFIX = "report:weekly:";
const MONTHLY_PREFIX = "report:monthly:";
const DATES_KEY = "report:dates";

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
} | null> {
  return kv.get(REPORT_PREFIX + date);
}

export async function getReportDates(): Promise<string[]> {
  const dates = await kv.smembers(DATES_KEY);
  return (dates as string[]).sort().reverse();
}

export async function getWeeklyReport(
  week: string,
): Promise<{ signals: Signal[]; days: number; week: string } | null> {
  return kv.get(WEEKLY_PREFIX + week);
}

export async function getMonthlyReport(
  month: string,
): Promise<{ signals: Signal[]; days: number; month: string } | null> {
  return kv.get(MONTHLY_PREFIX + month);
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
  const allSignals: Signal[] = [];
  for (const d of thisWeek) {
    const report = await getDailyReport(d);
    if (report) allSignals.push(...report.signals);
  }
  // Dedup by URL
  const seen = new Set<string>();
  const unique = allSignals.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
  await kv.set(
    WEEKLY_PREFIX + wk,
    { signals: unique.slice(0, 30), days: thisWeek.length, week: wk },
    { ex: 86400 * 365 },
  );
  return { ok: true };
}

export async function generateMonthlyReport(): Promise<{ ok: boolean }> {
  const mo = monthKey();
  const dates = await getReportDates();
  const thisMonth = dates.filter((d) => d.startsWith(mo));
  if (thisMonth.length === 0) return { ok: false };
  const allSignals: Signal[] = [];
  for (const d of thisMonth) {
    const report = await getDailyReport(d);
    if (report) allSignals.push(...report.signals);
  }
  const seen = new Set<string>();
  const unique = allSignals.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
  await kv.set(
    MONTHLY_PREFIX + mo,
    { signals: unique.slice(0, 50), days: thisMonth.length, month: mo },
    { ex: 86400 * 365 },
  );
  return { ok: true };
}
