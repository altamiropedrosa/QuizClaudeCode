"use client";

import { useImperativeHandle, type Ref } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { QUESTION_TIME_MS } from "@/types";
import { TimerBar } from "./TimerBar";

export interface QuestionTimerHandle {
  /** Milliseconds since the current question's countdown started. */
  elapsedMs(): number;
}

/**
 * Owns the countdown state so its 100 ms ticks re-render only this component, not the whole question.
 * While paused (feedback), shows `frozenMs` instead.
 */
export function QuestionTimer({
  ref,
  running,
  runKey,
  frozenMs,
  onExpire,
}: {
  ref: Ref<QuestionTimerHandle>;
  running: boolean;
  runKey: unknown;
  frozenMs: number;
  onExpire: () => void;
}) {
  const { remainingMs, elapsedMs } = useCountdown(QUESTION_TIME_MS, running, runKey, onExpire);
  useImperativeHandle(ref, () => ({ elapsedMs }), [elapsedMs]);
  return <TimerBar remainingMs={running ? remainingMs : frozenMs} />;
}
