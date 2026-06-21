import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SignalCard } from "@/components/signal-card";
import { ReportCalendar } from "@/components/report-calendar";
import Link from "next/link";
import { getMonthlyReport, getReportDates, getDailyReport } from "@/lib/reports";
import { generateAiSummary } from "@/lib/ai-summary";
import type { Signal } from "@/lib/types";

export const metadata: Metadata = {
  title: "Monthly Report — The Tech Ledger",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function MonthlyReportPage({
  params,
}: {
  params: { month: string };
}) {
  let report = await getMonthlyReport(params.month);

  // Fallback: if no stored monthly report, try to build one from daily data
  if (!report) {
    const [year, mo] = params.month.split("-");
    const dates = await getReportDates();
    const monthDates = dates.filter((d) => d.startsWith(params.month));
    if (monthDates.length > 0) {
      const allSignals: Signal[] = [];
      for (const d of monthDates) {
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
        ? await generateAiSummary(unique, "monthly")
        : null;
      report = {
        signals: unique.slice(0, 50),
        days: monthDates.length,
        month: params.month,
        aiSummary: aiSummary ?? undefined,
      };
    }
  }

  if (!report) notFound();

  const [year, mo] = report.month.split("-");
  const monthIdx = parseInt(mo) - 1;
  const dates = await getReportDates();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-screen-xl px-4 py-28">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">
          Monthly Digest
        </p>
        <h1 className="mb-2 font-serif text-4xl font-black text-[#111111] sm:text-5xl">
          {report.month}
        </h1>
        <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
          {report.days} days &middot; {report.signals.length} unique signals
        </p>

        {/* Month Calendar */}
        <div className="mb-12">
          <ReportCalendar
            year={parseInt(year)}
            month={monthIdx}
            dates={dates}
          />
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
              No signals this month.
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
