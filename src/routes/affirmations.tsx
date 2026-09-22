import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Heart, Sparkles, Trash2 } from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { buildContext, uid, useAffirmations } from "@/lib/store";
import { generateAffirmations } from "@/lib/ai.functions";

export const Route = createFileRoute("/affirmations")({
  head: () => ({
    meta: [
      { title: "Affirmations — HabitFlow AI" },
      {
        name: "description",
        content: "Generate personalized affirmations from your goals and keep your favorites.",
      },
      { property: "og:title", content: "Affirmations — HabitFlow AI" },
      {
        property: "og:description",
        content: "Affirmations written from your own goals and habits.",
      },
    ],
  }),
  component: AffirmationsPage,
});

function AffirmationsPage() {
  const generate = useServerFn(generateAffirmations);
  const [saved, setSaved] = useAffirmations();
  const [fresh, setFresh] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const { affirmations } = await generate({ data: { context: buildContext() } });
      setFresh(affirmations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate affirmations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Affirmations" subtitle="Written from your own goals — not a generic quote book.">
      <GlassCard>
        <button
          onClick={() => void run()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Sparkles className="size-4" />
          {loading ? "Writing…" : "Generate affirmations"}
        </button>
        {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

        <div className="mt-5 space-y-3">
          {fresh.map((text) => (
            <div
              key={text}
              className="flex items-start justify-between gap-4 rounded-xl border border-border bg-secondary/40 px-4 py-3"
            >
              <p className="font-display text-lg leading-snug">{text}</p>
              <button
                aria-label="Save affirmation"
                onClick={() =>
                  setSaved((prev) =>
                    prev.some((a) => a.text === text)
                      ? prev
                      : [...prev, { id: uid(), text, saved: true }],
                  )
                }
                className="shrink-0 text-muted-foreground hover:text-primary"
              >
                <Heart className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mt-4">
        <h2 className="text-lg">Saved</h2>
        <div className="mt-4 space-y-3">
          {saved.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tap the heart to keep one here.</p>
          ) : (
            saved.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4">
                <p className="font-display text-lg leading-snug">{a.text}</p>
                <button
                  aria-label="Remove affirmation"
                  onClick={() => setSaved((prev) => prev.filter((x) => x.id !== a.id))}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </AppShell>
  );
}
