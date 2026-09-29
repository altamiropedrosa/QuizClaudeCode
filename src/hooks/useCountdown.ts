"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TICK_MS = 100;

/**
 * Countdown driven by performance.now() + requestAnimationFrame (no setInterval drift).
 * Restarts whenever `runKey` changes while `running` is true; stops when `running` is false.
 */
export function useCountdown(durationMs: number, running: boolean, runKey: unknown, onExpire: () => void) {
  // Tagged with the runKey it belongs to, so a new countdown never shows the previous one's value.
  const [tick, setTick] = useState<{ key: unknown; ms: number }>({ key: undefined, ms: durationMs });
  const startRef = useRef(0);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    let frame = 0;
    let lastTick = -1;

    const loop = () => {
      const elapsed = performance.now() - startRef.current;
      const remaining = Math.max(durationMs - elapsed, 0);
      const current = Math.ceil(remaining / TICK_MS);
      if (current !== lastTick) {
        lastTick = current;
        setTick({ key: runKey, ms: current * TICK_MS });
      }
      if (remaining <= 0) {
        onExpireRef.current();
        return;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, running, runKey]);

  /** Milliseconds since the current countdown started (call from event handlers). */
  const elapsedMs = useCallback(() => performance.now() - startRef.current, []);

  return { remainingMs: running && tick.key === runKey ? tick.ms : durationMs, elapsedMs };
}
