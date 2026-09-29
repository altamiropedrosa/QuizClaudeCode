import { QUESTION_TIME_MS } from "@/types";

const WARNING_MS = 3000;
const ANNOUNCE_AT_SECONDS = [5, 3];

export function TimerBar({ remainingMs }: { remainingMs: number }) {
  const seconds = Math.ceil(remainingMs / 1000);
  const warning = remainingMs <= WARNING_MS;
  const pct = (remainingMs / QUESTION_TIME_MS) * 100;
  // Only announce milestones, so screen readers aren't flooded every second.
  const announcement = ANNOUNCE_AT_SECONDS.includes(seconds) ? `${seconds} segundos restantes` : "";

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-2 flex-1 overflow-hidden rounded-sm bg-border"
        role="progressbar"
        aria-label="Tempo restante"
        aria-valuemin={0}
        aria-valuemax={QUESTION_TIME_MS / 1000}
        aria-valuenow={seconds}
        aria-valuetext={`${seconds} segundos`}
      >
        <div
          className={`h-full ${warning ? "bg-danger" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`w-10 text-right font-mono text-sm tabular-nums ${warning ? "font-bold text-danger" : "text-muted"}`}>
        {seconds}s
      </span>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
