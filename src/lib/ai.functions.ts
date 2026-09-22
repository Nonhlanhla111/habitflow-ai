import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(8000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
});

async function callGateway(messages: z.infer<typeof messageSchema>[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured yet.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "google/gemini-3.8-flash", messages }),
  });

  if (res.status === 429) throw new Error("Too many requests right now — try again in a moment.");
  if (res.status === 402) throw new Error("AI credits are exhausted. Add credits to keep coaching.");
  if (!res.ok) throw new Error(`The coach could not respond (${res.status}).`);

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export const coachChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data }) => ({ reply: await callGateway(data.messages) }));

const insightSchema = z.object({ reflection: z.string().min(1).max(4000), context: z.string().max(4000) });

export const reflectionInsight = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => insightSchema.parse(d))
  .handler(async ({ data }) => {
    const reply = await callGateway([
      {
        role: "system",
        content:
          "You are a warm, precise habit coach. Read the user's journal entry and reply with ONE short insight (max 40 words). No greetings, no lists, no questions.",
      },
      { role: "user", content: `My context:\n${data.context}\n\nToday's reflection:\n${data.reflection}` },
    ]);
    return { insight: reply };
  });

const affSchema = z.object({ context: z.string().max(4000) });

export const generateAffirmations = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => affSchema.parse(d))
  .handler(async ({ data }) => {
    const reply = await callGateway([
      {
        role: "system",
        content:
          "Write 4 personal affirmations grounded in the user's goals and habits. Present tense, first person, max 16 words each. Return them as 4 plain lines with no numbering, quotes or extra text.",
      },
      { role: "user", content: data.context },
    ]);
    const lines = reply
      .split("\n")
      .map((l) => l.replace(/^[-*\d.\s"]+|["]+$/g, "").trim())
      .filter(Boolean)
      .slice(0, 4);
    return { affirmations: lines };
  });
