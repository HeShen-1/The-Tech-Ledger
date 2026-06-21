import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { WeekCalendar } from "@/components/week-calendar";
import { AiReport } from "@/components/ai-report";
import Link from "next/link";
import { getWeeklyReport, getReportDates } from "@/lib/reports";
import type { TrendingResponse, SourcesResponse } from "@/lib/types";

export const metadata: Metadata = {
  title: "Weekly Report — The Tech Ledger",
};

const API_BASE =
  process.env.NODE_ENV === "production"
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

async function getLiveTrending(): Promise<TrendingResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/trending`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return { signals: [], total: 0, cached: false, cachedAt: null, stale: false };
  }
}

async function getLiveSources(): Promise<SourcesResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/sources`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return { sources: [], updatedAt: new Date().toISOString() };
  }
}

export default async function WeeklyReportPage({
  params,
}: {
  params: { week: string };
}) {
  const report = await getWeeklyReport(params.week);

  if (report) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-screen-xl px-4 py-28">
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">Weekly Digest</p>
          <h1 className="mb-2 font-serif text-4xl font-black text-[#111111] sm:text-5xl">{report.week}</h1>
          <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">{report.days} days &middot; {report.signals.length} unique signals</p>
          <WeekCalendar week={report.week} dates={await getReportDates()} />
          <Link href="/reports" className="mt-10 inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]">&larr; All Reports</Link>
        </main>
        <Footer />
      </>
    );
  }

  // No stored report — show calendar + live data
  const dates = await getReportDates();
  const [trending, sources] = await Promise.all([getLiveTrending(), getLiveSources()]);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-screen-xl px-4 py-28">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">Weekly Digest</p>
        <h1 className="mb-2 font-serif text-4xl font-black text-[#111111] sm:text-5xl">{params.week}</h1>
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">No stored weekly report yet. Weekly digests are generated on Sundays.</p>
        <div className="mb-12"><WeekCalendar week={params.week} dates={dates} /></div>
        <div className="border-t-4 border-[#111111] pt-10">
          <h2 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#737373]">Latest Signals</h2>
          {trending.signals.length === 0 ? (
            <div className="border border-[#111111] py-16 text-center"><p className="font-serif text-lg italic text-[#737373]">No signals available.</p></div>
          ) : (
            <AiReport trending={trending} sources={sources} />
          )}
        </div>
        <Link href="/reports" className="mt-10 inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]">&larr; All Reports</Link>
      </main>
      <Footer />
    </>
  );
}
