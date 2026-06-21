import { NextResponse } from "next/server";
import { getReportDates } from "@/lib/reports";

export async function GET() {
  try {
    const dates = await getReportDates();
    return NextResponse.json({ dates });
  } catch (error) {
    console.error("[api/reports/dates] Failed:", error);
    return NextResponse.json({ dates: [] });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
