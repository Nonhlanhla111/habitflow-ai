import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import {
  CATEGORIES,
  lastNDays,
  streakFor,
  todayKey,
  uid,
  useHabits,
  type Category,
} from "@/lib/store";

export const Route = createFileRoute("/habits")({
  head: () => ({
    meta: [
      { title: "Habits — HabitFlow AI" },
      {
        name: "description",
        content: "Create, complete and edit daily habits across wellness, mind, body and focus.",
      },
      { property: "og:title", content: "Habits — HabitFlow AI" },
      {
        property: "og:description",
        content: "Build daily routines and watch your streaks grow.",
      },
    ],
  }),
  component: HabitsPage,
});

function HabitsPage() {
  const [habits, setHabits] = useHabits();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("wellness");
  const [editingId, setEditingId] = useState<string | null>(null);
  const today = todayKey();
  const week = lastNDays(7);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editingId) {
      setHabits((prev) =>
        prev.map((h) => (h.id === editingId ? { ...h, name: trimmed, category } : h)),
      );
      setEditingId(null);
    } else {
      setHabits((prev) => [
        ...prev,
        { id: uid(), name: trimmed, category, createdAt: today, completions: [] },
      ]);
    }
    setName("");
  };

  const toggle = (id: string) =>
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completions: h.completions.includes(today)
                ? h.completions.filter((d) => d !== today)
                : [...h.completions, today],
            }
          : h,
      ),
    );

  return (
    <AppShell title="Habits" subtitle="Small, repeatable actions — one tap to complete.">
      <GlassCard>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 10 minute morning walk"
            className="flex-1 rounded-xl border border-input bg-secondary/40 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm capitalize outline-none focus:border-primary/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-card capitalize">
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {editingId ? "Save" : "Add habit"}
          </button>
        </form>
      </GlassCard>

      <div className="mt-4 space-y-3">
        {habits.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-muted-foreground">
              Nothing tracked yet. Start with one habit you can do in under ten minutes.
            </p>
          </GlassCard>
        ) : (
          habits.map((h) => {
            const done = h.completions.includes(today);
            return (
              <GlassCard key={h.id} className="glass-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate">{h.name}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                      {h.category} · {streakFor(h)} day streak
                    </p>
                    <div className="mt-3 flex gap-1.5">
                      {week.map((d) => (
                        <span
                          key={d}
                          title={d}
                          className={`size-4 rounded-md ${
                            h.completions.includes(d) ? "bg-primary" : "bg-secondary"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      aria-label="Edit habit"
                      onClick={() => {
                        setEditingId(h.id);
                        setName(h.name);
                        setCategory(h.category);
                      }}
                      className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      aria-label="Delete habit"
                      onClick={() => setHabits((prev) => prev.filter((x) => x.id !== h.id))}
                      className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <button
                      aria-label="Complete habit"
                      onClick={() => toggle(h.id)}
                      className={`rounded-lg border p-2 ${
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <Check className="size-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
