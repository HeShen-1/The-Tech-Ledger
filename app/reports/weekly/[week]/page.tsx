import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { WeekCalendar } from "@/components/week-calendar";
import Link from "next/link";
import { getWeeklyReport, getReportDates } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Weekly Report — The Tech Ledger",
};

function weekDisplayName(weekStr: string): string {
  const [year, w] = weekStr.split("-W");
  const weekNum = parseInt(w);
  const jan1 = new Date(parseInt(year), 0, 1);
  const daysOffset = (weekNum - 1) * 7;
  const start = new Date(jan1.getTime() + daysOffset * 86400000);
  const dayOfWeek = start.getDay();
  const monday = new Date(start.getTime() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const monStr = monday.toLocaleDateString("en-US", opts);
  const sunStr = sunday.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${monStr} – ${sunStr}`;
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
          <h1 className="mb-2 font-serif text-4xl font-black text-[#111111] sm:text-5xl">{weekDisplayName(params.week)}</h1>
          <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
            {params.week} &middot; {report.days} days &middot; {report.signals.length} unique signals
          </p>
          <WeekCalendar week={params.week} dates={await getReportDates()} />
          <Link href="/reports" className="mt-10 inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]">
            &larr; All Reports
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // No stored report — show calendar with message
  const dates = await getReportDates();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-screen-xl px-4 py-28">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">Weekly Digest</p>
        <h1 className="mb-2 font-serif text-4xl font-black text-[#111111] sm:text-5xl">{weekDisplayName(params.week)}</h1>
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">{params.week}</p>
        <p className="mb-6 font-body text-sm italic text-[#737373]">
          No stored weekly report yet. Weekly digests are generated on Sundays once snapshots accumulate.
        </p>
        <div className="mb-12"><WeekCalendar week={params.week} dates={dates} /></div>
        <Link href="/reports" className="mt-10 inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]">
          &larr; All Reports
        </Link>
      </main>
      <Footer />
    </>
  );
}
