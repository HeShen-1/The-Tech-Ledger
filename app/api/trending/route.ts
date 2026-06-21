import { NextResponse } from "next/server";
import { getTrending, refreshTrending } from "@/lib/aggregator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refreshToken = searchParams.get("refresh");

  if (refreshToken && refreshToken === process.env.REFRESH_TOKEN) {
    try {
      const data = await refreshTrending();
      return NextResponse.json(data, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    } catch (error) {
      console.error("[api/trending] Refresh failed:", error);
      return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
    }
  }

  try {
    const data = await getTrending();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("[api/trending] Failed:", error);
    return NextResponse.json({ error: "Failed to fetch trending signals" }, { status: 503 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
