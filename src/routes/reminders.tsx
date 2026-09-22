import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { uid, useReminders } from "@/lib/store";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders — HabitFlow AI" },
      {
        name: "description",
        content: "Schedule timed cues like a morning check-in or evening reflection.",
      },
      { property: "og:title", content: "Reminders — HabitFlow AI" },
      { property: "og:description", content: "Timed cues that keep your routine in motion." },
    ],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  const [reminders, setReminders] = useReminders();
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("08:00");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setReminders((prev) => [...prev, { id: uid(), label: label.trim(), time, active: true }]);
    setLabel("");
  };

  return (
    <AppShell title="Reminders" subtitle="Gentle cues at the moments that matter.">
      <GlassCard>
        <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Evening reflection"
            className="flex-1 rounded-xl border border-input bg-secondary/40 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary/50"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Add
          </button>
        </form>
      </GlassCard>

      <div className="mt-4 space-y-3">
        {reminders.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-muted-foreground">No reminders scheduled yet.</p>
          </GlassCard>
        ) : (
          reminders.map((r) => (
            <GlassCard key={r.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-2xl">{r.time}</p>
                <p className="text-sm text-muted-foreground">{r.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setReminders((prev) =>
                      prev.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)),
                    )
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    r.active
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {r.active ? "Active" : "Paused"}
                </button>
                <button
                  aria-label="Delete reminder"
                  onClick={() => setReminders((prev) => prev.filter((x) => x.id !== r.id))}
                  className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </AppShell>
  );
}
