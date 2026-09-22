import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { uid, useGoals } from "@/lib/store";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — HabitFlow AI" },
      {
        name: "description",
        content:
          "Define long-term goals with progress tracking that informs your AI coach's guidance.",
      },
      { property: "og:title", content: "Goals — HabitFlow AI" },
      {
        property: "og:description",
        content: "Long-term goals, tracked in percentages and understood by your coach.",
      },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const [goals, setGoals] = useGoals();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setGoals((prev) => [
      ...prev,
      { id: uid(), title: title.trim(), detail: detail.trim(), progress: 0 },
    ]);
    setTitle("");
    setDetail("");
  };

  return (
    <AppShell title="Goals" subtitle="The bigger picture your daily habits ladder up to.">
      <GlassCard>
        <form onSubmit={add} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read 12 books this year"
            className="w-full rounded-xl border border-input bg-secondary/40 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
          <input
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Why it matters (optional)"
            className="w-full rounded-xl border border-input bg-secondary/40 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Add goal
          </button>
        </form>
      </GlassCard>

      <div className="mt-4 space-y-3">
        {goals.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-muted-foreground">No goals yet.</p>
          </GlassCard>
        ) : (
          goals.map((g) => (
            <GlassCard key={g.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p>{g.title}</p>
                  {g.detail ? (
                    <p className="mt-1 text-sm text-muted-foreground">{g.detail}</p>
                  ) : null}
                </div>
                <button
                  aria-label="Delete goal"
                  onClick={() => setGoals((prev) => prev.filter((x) => x.id !== g.id))}
                  className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={g.progress}
                  onChange={(e) =>
                    setGoals((prev) =>
                      prev.map((x) =>
                        x.id === g.id ? { ...x, progress: Number(e.target.value) } : x,
                      ),
                    )
                  }
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
                />
                <span className="w-12 text-right text-sm text-muted-foreground">{g.progress}%</span>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </AppShell>
  );
}
