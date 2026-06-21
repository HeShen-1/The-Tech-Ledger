import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SignalCard } from "@/components/signal-card";
import Link from "next/link";
import { getWeeklyReport } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Weekly Report — The Tech Ledger",
};

export default async function WeeklyReportPage({
  params,
}: {
  params: { week: string };
}) {
  const report = await getWeeklyReport(params.week);
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

        {report.signals.length === 0 ? (
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
