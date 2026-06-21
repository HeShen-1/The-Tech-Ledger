import { NextResponse } from "next/server";
import { getDailyReport } from "@/lib/reports";

export async function GET(
  _request: Request,
  { params }: { params: { date: string } },
) {
  try {
    const report = await getDailyReport(params.date);
    if (!report)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
