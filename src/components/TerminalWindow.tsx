import type { ReactNode } from "react";

/** Card styled as a terminal window: title bar + content surface. */
export function TerminalWindow({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-md border border-border bg-surface shadow-sm ${className}`}>
      <div className="flex items-center gap-2 border-b border-border px-3 py-2" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-danger/70" />
        <span className="size-2.5 rounded-full bg-accent/70" />
        <span className="size-2.5 rounded-full bg-success/70" />
        <span className="ml-2 truncate font-mono text-xs text-muted">{title}</span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
