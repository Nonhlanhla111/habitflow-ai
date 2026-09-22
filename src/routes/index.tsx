import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { lastNDays, streakFor, todayKey, useGoals, useHabits } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HabitFlow AI — Your daily habit dashboard" },
      {
        name: "description",
        content:
          "See streaks, weekly consistency and today's habits at a glance, with an AI coach that knows your routine.",
      },
      { property: "og:title", content: "HabitFlow AI — Your daily habit dashboard" },
      {
        property: "og:description",
        content: "Track habits, reflect daily and get personalized AI coaching in one place.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [habits, setHabits] = useHabits();
  const [goals] = useGoals();
  const week = lastNDays(7);
  const today = todayKey();

  const doneToday = habits.filter((h) => h.completions.includes(today)).length;
  const weekCells = week.map((d) => ({
    day: new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" }),
    date: d,
    rate: habits.length ? habits.filter((h) => h.completions.includes(d)).length / habits.length : 0,
  }));
  const weekRate = habits.length
    ? Math.round((weekCells.reduce((s, c) => s + c.rate, 0) / 7) * 100)
    : 0;
  const bestStreak = habits.reduce((m, h) => Math.max(m, streakFor(h)), 0);

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
    <AppShell
      title="Today"
      subtitle={new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="glass-hover">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <TrendingUp className="size-4 text-primary" /> Weekly consistency
          </div>
          <p className="mt-3 font-display text-4xl">{weekRate}%</p>
        </GlassCard>
        <GlassCard className="glass-hover">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Flame className="size-4 text-gold" /> Best streak
          </div>
          <p className="mt-3 font-display text-4xl">
            {bestStreak}
            <span className="ml-1 text-base text-muted-foreground">days</span>
          </p>
        </GlassCard>
        <GlassCard className="glass-hover">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Done today</div>
          <p className="mt-3 font-display text-4xl">
            {doneToday}
            <span className="text-base text-muted-foreground">/{habits.length}</span>
          </p>
        </GlassCard>
      </div>

      <GlassCard className="mt-4">
        <h2 className="text-lg">This week</h2>
        <div className="mt-4 flex items-end justify-between gap-2">
          {weekCells.map((c) => (
            <div key={c.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end overflow-hidden rounded-lg bg-secondary/60">
                <div
                  className="w-full rounded-lg bg-primary/80"
                  style={{ height: `${Math.max(c.rate * 100, 3)}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">{c.day}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Today&rsquo;s habits</h2>
          <Link to="/habits" className="text-xs text-primary hover:underline">
            Manage
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No habits yet.{" "}
              <Link to="/habits" className="text-primary hover:underline">
                Create your first one
              </Link>
              .
            </p>
          ) : (
            habits.map((h) => {
              const done = h.completions.includes(today);
              return (
                <button
                  key={h.id}
                  onClick={() => toggle(h.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    done
                      ? "border-primary/40 bg-primary/12"
                      : "border-border bg-secondary/40 hover:border-primary/30"
                  }`}
                >
                  <span className="flex flex-col">
                    <span className="text-sm">{h.name}</span>
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      {h.category} · {streakFor(h)}d streak
                    </span>
                  </span>
                  <span
                    className={`flex size-6 items-center justify-center rounded-full border text-xs ${
                      done ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {done ? "✓" : ""}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </GlassCard>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg">Goals</h2>
          <div className="mt-4 space-y-3">
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                <Link to="/goals" className="text-primary hover:underline">
                  Set a long-term goal
                </Link>{" "}
                to sharpen your coaching.
              </p>
            ) : (
              goals.slice(0, 3).map((g) => (
                <div key={g.id}>
                  <div className="flex justify-between text-sm">
                    <span>{g.title}</span>
                    <span className="text-muted-foreground">{g.progress}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg">
              <Sparkles className="size-4 text-primary" /> Your coach
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask about a habit you keep missing, or how to structure tomorrow.
            </p>
          </div>
          <Link
            to="/coach"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open AI Coach
          </Link>
        </GlassCard>
      </div>
    </AppShell>
  );
}
