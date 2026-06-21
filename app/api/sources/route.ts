import { NextResponse } from "next/server";
import { getSourceStatuses } from "@/lib/sources";
import { getCachedSources, setCachedSources } from "@/lib/cache";

export async function GET() {
  try {
    const cached = await getCachedSources();
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }
    const sources = await getSourceStatuses();
    const response = { sources, updatedAt: new Date().toISOString() };
    await setCachedSources(response);
    return NextResponse.json(response, {
      headers: {
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[api/sources] Failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch source status" },
      { status: 503 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
