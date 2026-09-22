import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  CircleCheck,
  Target,
  NotebookPen,
  Sun,
  BellRing,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/coach", label: "AI Coach", icon: Sparkles },
  { to: "/habits", label: "Habits", icon: CircleCheck },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/reflection", label: "Reflection", icon: NotebookPen },
  { to: "/affirmations", label: "Affirmations", icon: Sun },
  { to: "/reminders", label: "Reminders", icon: BellRing },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pb-28 md:pb-12">
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-8 md:px-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-8">
            <Link to="/" className="mb-8 block">
              <span className="font-display text-2xl text-gradient">HabitFlow</span>
              <span className="ml-1 text-xs tracking-[0.3em] text-primary/80">AI</span>
            </Link>
            <nav className="flex flex-col gap-1">
              {nav.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  activeProps={{
                    className: "bg-primary/15 text-primary border-primary/25",
                  }}
                  inactiveProps={{ className: "text-muted-foreground border-transparent" }}
                  className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors hover:text-foreground"
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
          </header>
          {children}
        </main>
      </div>

      <nav className="glass fixed inset-x-3 bottom-3 z-50 flex items-center justify-between rounded-2xl px-2 py-2 md:hidden">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            activeProps={{ className: "text-primary bg-primary/12" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            aria-label={label}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5"
          >
            <Icon className="size-[18px]" />
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}
