import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SignalCard } from "@/components/signal-card";
import { WeekCalendar } from "@/components/week-calendar";
import Link from "next/link";
import { getWeeklyReport, getReportDates, getDailyReport } from "@/lib/reports";
import { generateAiSummary } from "@/lib/ai-summary";
import type { Signal } from "@/lib/types";

export const metadata: Metadata = {
  title: "Weekly Report — The Tech Ledger",
};

export default async function WeeklyReportPage({
  params,
}: {
  params: { week: string };
}) {
  let report = await getWeeklyReport(params.week);

  // Fallback: if no stored weekly report, try to build one from daily data
  if (!report) {
    const dates = await getReportDates();
    const [year, w] = params.week.split("-W");
    const weekNum = parseInt(w);
    const jan1 = new Date(parseInt(year), 0, 1);
    const daysOffset = (weekNum - 1) * 7;
    const start = new Date(jan1.getTime() + daysOffset * 86400000);
    const dayOfWeek = start.getDay();
    const monday = new Date(
      start.getTime() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 86400000,
    );

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getTime() + i * 86400000);
      weekDates.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      );
    }

    const matchingDates = dates.filter((d) => weekDates.includes(d));
    if (matchingDates.length > 0) {
      const allSignals: Signal[] = [];
      for (const d of matchingDates) {
        const daily = await getDailyReport(d);
        if (daily) allSignals.push(...daily.signals);
      }
      const seen = new Set<string>();
      const unique = allSignals.filter((s) => {
        if (seen.has(s.url)) return false;
        seen.add(s.url);
        return true;
      });
      const aiSummary = unique.length > 0
        ? await generateAiSummary(unique, "weekly")
        : null;
      report = {
        signals: unique.slice(0, 30),
        days: matchingDates.length,
        week: params.week,
        aiSummary: aiSummary ?? undefined,
      };
    }
  }

  if (!report) notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-screen-xl px-4 py-28">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
          Weekly Digest
        </p>
        <h1 className="mb-2 font-serif text-4xl font-black text-[#111111] sm:text-5xl">
          {report.week}
        </h1>
        <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
          {report.days} days &middot; {report.signals.length} unique signals
        </p>

        {/* Week Calendar */}
        <div className="mb-12">
          <WeekCalendar week={report.week} dates={
            (() => {
              const [year, w] = report.week.split("-W");
              const weekNum = parseInt(w);
              const jan1 = new Date(parseInt(year), 0, 1);
              const daysOffset = (weekNum - 1) * 7;
              const start = new Date(jan1.getTime() + daysOffset * 86400000);
              const dayOfWeek = start.getDay();
              const monday = new Date(
                start.getTime() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 86400000,
              );
              const weekDates: string[] = [];
              for (let i = 0; i < 7; i++) {
                const d = new Date(monday.getTime() + i * 86400000);
                weekDates.push(
                  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
                );
              }
              return weekDates;
            })()
          } />
        </div>

        {/* AI Summary or Signal list */}
        {report.aiSummary ? (
          <div className="space-y-6 font-body text-base leading-relaxed text-[#525252]">
            {report.aiSummary.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : report.signals.length === 0 ? (
          <div className="border border-[#111111] py-16 text-center">
            <p className="font-serif text-lg italic text-[#737373]">
              No signals this week.
            </p>
          </div>
        ) : (
          <div>
            {report.signals.map((signal, i) => (
              <SignalCard key={signal.id} signal={signal} index={i} />
            ))}
          </div>
        )}

        <Link
          href="/reports"
          className="mt-10 inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]"
        >
          &larr; All Reports
        </Link>
      </main>
      <Footer />
    </>
  );
}
