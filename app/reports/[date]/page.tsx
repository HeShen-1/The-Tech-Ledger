import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { AiReport } from "@/components/ai-report";
import Link from "next/link";
import { getDailyReport } from "@/lib/reports";
import { getTrending } from "@/lib/aggregator";
import { getSourceStatuses } from "@/lib/sources";

export default async function DailyReportPage({
  params,
}: {
  params: { date: string };
}) {
  const report = await getDailyReport(params.date);

  const d = new Date(params.date + "T00:00:00");
  const formatted = d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // If stored report exists, show it
  if (report) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-screen-xl px-4 py-28">
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">Daily Edition</p>
          <h1 className="mb-2 font-serif text-4xl font-black text-[#111111] sm:text-5xl">{formatted}</h1>
          <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
            {report.total} signals &middot; Snapshot at {new Date(report.snapshotAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
          {report.aiSummary ? (
            <div className="space-y-6 font-body text-base leading-relaxed text-[#525252]">
              {report.aiSummary.split("\n\n").map((p, i) => (<p key={i}>{p}</p>))}
            </div>
          ) : (
            <div className="border border-[#111111] py-16 text-center">
              <p className="font-serif text-lg italic text-[#737373]">Report snapshot exists but no AI summary was generated.</p>
            </div>
          )}
          <Link href="/reports" className="mt-10 inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]">&larr; All Reports</Link>
        </main>
        <Footer />
      </>
    );
  }

  // No stored report — show live data
  const [trending, sources] = await Promise.all([getTrending(), getSourceStatuses()]);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-screen-xl px-4 py-28">
        <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CC0000]">Daily Edition</p>
        <h1 className="mb-2 font-serif text-4xl font-black text-[#111111] sm:text-5xl">{formatted}</h1>
        <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.15em] text-[#737373]">
          {trending.total} signals &middot; Live data &middot; No stored snapshot yet
        </p>
        {trending.signals.length === 0 ? (
          <div className="border border-[#111111] py-16 text-center">
            <p className="font-serif text-lg italic text-[#737373]">No signals detected. The presses are quiet.</p>
          </div>
        ) : (
          <AiReport trending={trending} sources={{ sources, updatedAt: new Date().toISOString() }} />
        )}
        <Link href="/reports" className="mt-10 inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] transition-all duration-200 hover:bg-[#F9F9F7] hover:text-[#111111] min-h-[44px]">&larr; All Reports</Link>
      </main>
      <Footer />
    </>
  );
}
