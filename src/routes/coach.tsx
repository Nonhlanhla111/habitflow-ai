import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { buildContext, type ChatMessage } from "@/lib/store";
import { coachChat } from "@/lib/ai.functions";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI Coach — HabitFlow AI" },
      {
        name: "description",
        content:
          "Chat with a coach that adapts its guidance to your real habits, goals and reflections.",
      },
      { property: "og:title", content: "AI Coach — HabitFlow AI" },
      {
        property: "og:description",
        content: "Personalized habit coaching that understands your context.",
      },
    ],
  }),
  component: CoachPage,
});

const STARTERS = [
  "Why do I keep skipping my evening habit?",
  "Help me plan a realistic tomorrow.",
  "How do I rebuild a broken streak?",
];

function CoachPage() {
  const chat = useServerFn(coachChat);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await chat({
        data: {
          messages: [
            {
              role: "system" as const,
              content: `You are HabitFlow AI, a warm and specific habit coach. Use the user's real data below. Be concise (max 120 words), concrete, and never generic. Suggest one next action.\n\n${buildContext()}`,
            },
            ...next,
          ],
        },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The coach could not respond.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="AI Coach" subtitle="Grounded in your habits, goals and reflections.">
      <GlassCard className="flex h-[62vh] min-h-[420px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <Sparkles className="size-6 text-primary" />
              <p className="max-w-sm text-sm text-muted-foreground">
                Your coach reads your tracked habits before answering. Start anywhere.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-primary/15 text-foreground"
                    : "bg-secondary/60 text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))
          )}
          {loading ? (
            <div className="w-24 rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
              thinking…
            </div>
          ) : null}
          <div ref={endRef} />
        </div>

        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach…"
            className="flex-1 rounded-xl border border-input bg-secondary/40 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Send"
            className="rounded-xl bg-primary px-4 py-2.5 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </form>
      </GlassCard>
    </AppShell>
  );
}
