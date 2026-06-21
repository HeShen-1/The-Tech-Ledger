import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ReportCalendar } from "@/components/report-calendar";
import { ReportPreview } from "@/components/report-preview";
import { AiReport } from "@/components/ai-report";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import type { TrendingResponse, SourcesResponse } from "@/lib/types";

export const metadata: Metadata = {
  title: "Reports — The Tech Ledger",
};

const API_BASE =
  process.env.NODE_ENV === "production"
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

async function getDates(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/reports/dates`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.dates || [];
  } catch {
    return [];
  }
}

async function getTrendingForReports(): Promise<TrendingResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/trending`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return { signals: [], total: 0, cached: false, cachedAt: null, stale: false };
  }
}

async function getSourcesForReports(): Promise<SourcesResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/sources`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return { sources: [], updatedAt: new Date().toISOString() };
  }
}

export default async function ReportsPage() {
  const [dates, trending, sources] = await Promise.all([
    getDates(),
    getTrendingForReports(),
    getSourcesForReports(),
  ]);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const hasToday = dates.includes(today);

  // Week and month
  const start = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7,
  );
  const weekStr = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-screen-xl px-4 py-28">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
          Archive
        </p>
        <h1 className="mb-4 font-serif text-4xl font-black text-[#111111] sm:text-5xl">
          Reports
        </h1>
        <p className="mb-12 max-w-xl font-body text-base leading-relaxed text-[#525252]">
          Daily snapshots of trending signals. Click a marked date to view the
          report. Weekly and monthly digests aggregate the top stories.
        </p>

        {/* Quick links */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <Link
            href={hasToday ? `/reports/${today}` : "#"}
            className={`border border-[#111111] p-5 transition-all duration-200 hover:bg-[#F5F5F5] hover:shadow-[4px_4px_0px_0px_#111111] ${!hasToday ? "pointer-events-none opacity-40" : ""}`}
          >
            <Calendar
              className="mb-3 h-6 w-6 text-[#CC0000]"
              strokeWidth={1.5}
            />
            <h3 className="font-serif text-lg font-black text-[#111111]">
              Today&apos;s Report
            </h3>
            <p className="mt-1 font-mono text-[10px] uppercase text-[#737373]">
              {hasToday ? today : "Not yet generated"}
            </p>
          </Link>
          <Link
            href={`/reports/weekly/${weekStr}`}
            className="border border-[#111111] p-5 transition-all duration-200 hover:bg-[#F5F5F5] hover:shadow-[4px_4px_0px_0px_#111111]"
          >
            <ArrowRight
              className="mb-3 h-6 w-6 text-[#111111]"
              strokeWidth={1.5}
            />
            <h3 className="font-serif text-lg font-black text-[#111111]">
              Weekly Digest
            </h3>
            <p className="mt-1 font-mono text-[10px] uppercase text-[#737373]">
              {weekStr}
            </p>
          </Link>
          <Link
            href={`/reports/monthly/${monthStr}`}
            className="border border-[#111111] p-5 transition-all duration-200 hover:bg-[#F5F5F5] hover:shadow-[4px_4px_0px_0px_#111111]"
          >
            <ArrowRight
              className="mb-3 h-6 w-6 text-[#111111]"
              strokeWidth={1.5}
            />
            <h3 className="font-serif text-lg font-black text-[#111111]">
              Monthly Digest
            </h3>
            <p className="mt-1 font-mono text-[10px] uppercase text-[#737373]">
              {monthStr}
            </p>
          </Link>
        </div>

        {/* Calendar */}
        <ReportCalendar
          year={now.getFullYear()}
          month={now.getMonth()}
          dates={dates}
        />

        {dates.length === 0 && (
          <p className="mt-4 font-body text-sm italic text-[#737373]">
            No stored snapshots yet. Reports are generated hourly. Showing today&apos;s live data below.
          </p>
        )}

        {/* Today's Report — live trending data */}
        <div className="mt-16 border-t-4 border-[#111111] pt-10">
          <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#737373]">
            Today&apos;s Report — {today}
          </h2>
          <AiReport trending={trending} sources={sources} />
        </div>
      </main>
      <Footer />
    </>
  );
}
