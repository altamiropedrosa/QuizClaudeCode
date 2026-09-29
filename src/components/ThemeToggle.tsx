"use client";

import { useSyncExternalStore } from "react";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";

type ThemeChoice = "light" | "dark" | "system";

const OPTIONS: { value: ThemeChoice; label: string; icon: string }[] = [
  { value: "light", label: "Tema claro", icon: "☀" },
  { value: "dark", label: "Tema escuro", icon: "☾" },
  { value: "system", label: "Tema do sistema", icon: "◐" },
];

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ThemeChoice {
  return readJson<ThemeChoice>("local", STORAGE_KEYS.theme) ?? "system";
}

function setTheme(choice: ThemeChoice) {
  writeJson("local", STORAGE_KEYS.theme, choice);
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
  listeners.forEach((l) => l());
}

export function ThemeToggle() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => "system" as const);

  return (
    <div role="radiogroup" aria-label="Tema" className="flex rounded-sm border border-border font-mono text-sm">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={current === opt.value}
          aria-label={opt.label}
          title={opt.label}
          onClick={() => setTheme(opt.value)}
          className={`px-2 py-1 ${current === opt.value ? "bg-accent text-on-accent" : "text-muted hover:text-text"}`}
        >
          <span aria-hidden="true">{opt.icon}</span>
        </button>
      ))}
    </div>
  );
}
