import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { buildContext, todayKey, uid, useReflections } from "@/lib/store";
import { reflectionInsight } from "@/lib/ai.functions";

export const Route = createFileRoute("/reflection")({
  head: () => ({
    meta: [
      { title: "Reflection — HabitFlow AI" },
      {
        name: "description",
        content: "Write a daily journal entry and receive a short AI insight on each reflection.",
      },
      { property: "og:title", content: "Reflection — HabitFlow AI" },
      { property: "og:description", content: "Daily journaling with an AI insight per entry." },
    ],
  }),
  component: ReflectionPage,
});

function ReflectionPage() {
  const getInsight = useServerFn(reflectionInsight);
  const [reflections, setReflections] = useReflections();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || loading) return;
    setError(null);
    setLoading(true);
    const id = uid();
    setReflections((prev) => [{ id, date: todayKey(), body: text }, ...prev]);
    setBody("");
    try {
      const { insight } = await getInsight({ data: { reflection: text, context: buildContext() } });
      setReflections((prev) => prev.map((r) => (r.id === id ? { ...r, insight } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate an insight.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Reflection" subtitle="A few honest lines a day is enough.">
      <GlassCard>
        <form onSubmit={save} className="space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="How did today actually go?"
            className="w-full resize-none rounded-xl border border-input bg-secondary/40 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save reflection"}
          </button>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </form>
      </GlassCard>

      <div className="mt-4 space-y-3">
        {reflections.map((r) => (
          <GlassCard key={r.id}>
            <div className="flex items-start justify-between gap-4">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{r.date}</p>
              <button
                aria-label="Delete reflection"
                onClick={() => setReflections((prev) => prev.filter((x) => x.id !== r.id))}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{r.body}</p>
            {r.insight ? (
              <p className="mt-4 flex gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{r.insight}</span>
              </p>
            ) : null}
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
}
