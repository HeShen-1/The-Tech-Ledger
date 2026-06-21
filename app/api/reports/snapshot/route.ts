import { NextResponse } from "next/server";
import {
  snapshotDaily,
  generateWeeklyReport,
  generateMonthlyReport,
} from "@/lib/reports";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token || token !== process.env.REFRESH_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const daily = await snapshotDaily();
    // Weekly: only on Sundays (day 0)
    if (new Date().getDay() === 0) {
      await generateWeeklyReport();
    }
    // Monthly: only on last day of month
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDate() === 1) {
      await generateMonthlyReport();
    }
    return NextResponse.json({ ok: true, daily: daily.key });
  } catch (error) {
    console.error("[api/reports/snapshot] Failed:", error);
    return NextResponse.json({ error: "Snapshot failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
