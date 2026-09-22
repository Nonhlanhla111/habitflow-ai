import { useCallback, useEffect, useState } from "react";

export type Category = "wellness" | "mind" | "body" | "focus";

export type Habit = {
  id: string;
  name: string;
  category: Category;
  createdAt: string;
  /** ISO date strings (yyyy-mm-dd) on which the habit was completed */
  completions: string[];
};

export type Goal = {
  id: string;
  title: string;
  detail: string;
  progress: number; // 0-100
};

export type Reflection = {
  id: string;
  date: string;
  body: string;
  insight?: string;
};

export type Affirmation = {
  id: string;
  text: string;
  saved: boolean;
};

export type Reminder = {
  id: string;
  label: string;
  time: string; // HH:MM
  active: boolean;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const CATEGORIES: Category[] = ["wellness", "mind", "body", "focus"];

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const lastNDays = (n: number) => {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export function streakFor(habit: Habit) {
  let streak = 0;
  const set = new Set(habit.completions);
  const d = new Date();
  // allow today to be incomplete without breaking the streak
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Hydration-safe persisted state. Starts with `initial` on the server & first paint. */
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, initial));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private mode */
    }
  }, [key, value, ready]);

  const update = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
  return [value, update, ready] as const;
}

export const KEYS = {
  habits: "habitflow.habits",
  goals: "habitflow.goals",
  reflections: "habitflow.reflections",
  affirmations: "habitflow.affirmations",
  reminders: "habitflow.reminders",
  chat: "habitflow.chat",
};

export function useHabits() {
  return usePersistedState<Habit[]>(KEYS.habits, []);
}
export function useGoals() {
  return usePersistedState<Goal[]>(KEYS.goals, []);
}
export function useReflections() {
  return usePersistedState<Reflection[]>(KEYS.reflections, []);
}
export function useAffirmations() {
  return usePersistedState<Affirmation[]>(KEYS.affirmations, []);
}
export function useReminders() {
  return usePersistedState<Reminder[]>(KEYS.reminders, []);
}

/** Snapshot of everything the AI coach should know about, read directly from storage. */
export function buildContext() {
  const habits = read<Habit[]>(KEYS.habits, []);
  const goals = read<Goal[]>(KEYS.goals, []);
  const reflections = read<Reflection[]>(KEYS.reflections, []);
  const week = lastNDays(7);

  const habitLines = habits.length
    ? habits
        .map((h) => {
          const done = week.filter((d) => h.completions.includes(d)).length;
          return `- ${h.name} (${h.category}) — ${done}/7 this week, ${streakFor(h)} day streak`;
        })
        .join("\n")
    : "- none yet";

  const goalLines = goals.length
    ? goals.map((g) => `- ${g.title} — ${g.progress}% complete${g.detail ? ` (${g.detail})` : ""}`).join("\n")
    : "- none yet";

  const reflectionLines = reflections.length
    ? reflections
        .slice(0, 3)
        .map((r) => `- ${r.date}: ${r.body.slice(0, 280)}`)
        .join("\n")
    : "- none yet";

  return `Habits:\n${habitLines}\n\nGoals:\n${goalLines}\n\nRecent reflections:\n${reflectionLines}`;
}
