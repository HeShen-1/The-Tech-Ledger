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
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
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
