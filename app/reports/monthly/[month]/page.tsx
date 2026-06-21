import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ReportCalendar } from "@/components/report-calendar";
import Link from "next/link";
import { getMonthlyReport, getReportDates } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Monthly Report — The Tech Ledger",
};

function monthDisplayName(monthStr: string): string {
  const [year, mo] = monthStr.split("-");
  const d = new Date(parseInt(year), parseInt(mo) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default async function MonthlyReportPage({
  params,
}: {
  params: { month: string };
}) {
  const report = await getMonthlyReport(params.month);

  if (report) {
    const [year, mo] = params.month.split("-");
    const dates = await getReportDates();
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-screen-xl px-4 py-28">
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">Monthly Digest</p>
          <h1 className="mb-2 font-serif text-4xl font-black text-[#111111] sm:text-5xl">{monthDisplayName(params.month)}</h1>
          <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
            {params.month} &middot; {report.days} days &middot; {report.signals.length} unique signals
          </p>
          <div className="mb-12"><ReportCalendar year={parseInt(year)} month={parseInt(mo) - 1} dates={dates} /></div>
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
  const [year, mo] = params.month.split("-");

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-screen-xl px-4 py-28">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">Monthly Digest</p>
        <h1 className="mb-2 font-serif text-4xl font-black text-[#111111] sm:text-5xl">{monthDisplayName(params.month)}</h1>
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">{params.month}</p>
        <p className="mb-6 font-body text-sm italic text-[#737373]">
          No stored monthly report yet. Monthly digests are generated on the last day of each month.
        </p>
        <div className="mb-12"><ReportCalendar year={parseInt(year)} month={parseInt(mo) - 1} dates={dates} /></div>
        <Link href="/reports" className="mt-10 inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]">
          &larr; All Reports
        </Link>
      </main>
      <Footer />
    </>
  );
}
