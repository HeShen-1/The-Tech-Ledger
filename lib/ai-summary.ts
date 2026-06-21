import type { Signal } from "./types";

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;

function buildPrompt(signals: Signal[], period: string): string {
  const topItems = signals
    .slice(0, 15)
    .map(
      (s, i) =>
        `${i + 1}. [${s.source.toUpperCase()}] ${s.title} — ${s.scoreLabel} — ${
          s.category
        }${s.summary ? ` — ${s.summary.slice(0, 150)}` : ""}`,
    )
    .join("\n");

  return `You are the editor-in-chief of "The Tech Ledger", a digital newspaper covering technology trends. Write a ${period} editorial report based on the following trending signals. Write in the style of a newspaper editorial — authoritative, concise, insightful. Include: a lead paragraph highlighting the top story, source-by-source analysis, dominant categories, and a brief outlook. Keep it under 500 words. Do not use bullet points. Write in flowing prose.

TRENDING SIGNALS:
${topItems}`;
}

export async function generateAiSummary(
  signals: Signal[],
  period: string = "daily",
): Promise<string | null> {
  if (!DEEPSEEK_KEY) {
    console.warn("[ai-summary] DEEPSEEK_API_KEY not set");
    return null;
  }

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a newspaper editor writing concise, insightful technology reports.",
          },
          { role: "user", content: buildPrompt(signals, period) },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      console.error("[ai-summary] DeepSeek API failed:", res.status);
      return null;
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error("[ai-summary] Failed:", error);
    return null;
  }
}

function buildSummaryPrompt(existingSummaries: string[], period: string): string {
  const items = existingSummaries
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n\n");

  return `You are the editor-in-chief of "The Tech Ledger". Below are ${period} AI-generated report summaries. Synthesize them into a single cohesive ${period} editorial report. Highlight the most important trends, cross-cutting themes, and notable developments. Write in the style of a newspaper editorial — authoritative, concise, insightful. Keep it under 600 words. Do not use bullet points. Write in flowing prose.

EXISTING SUMMARIES:
${items}`;
}

export async function generateAiSummaryFromSummaries(
  existingSummaries: string[],
  period: string = "weekly",
): Promise<string | null> {
  if (!DEEPSEEK_KEY) {
    console.warn("[ai-summary] DEEPSEEK_API_KEY not set");
    return null;
  }

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          {
            role: "system",
            content: "You are a newspaper editor writing concise, insightful technology reports that synthesize multiple summaries.",
          },
          { role: "user", content: buildSummaryPrompt(existingSummaries, period) },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      console.error("[ai-summary] DeepSeek API failed:", res.status);
      return null;
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error("[ai-summary] Failed:", error);
    return null;
  }
}
