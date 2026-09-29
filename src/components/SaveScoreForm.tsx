"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { saveMatch, type StoredMatch } from "@/lib/matchStore";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import { nicknameSchema } from "@/lib/validation";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_nickname: "Esse apelido não pode ser usado. Tenta outro?",
  implausible_match: "Não deu para validar essa partida. Que tal jogar de novo?",
  rate_limited: "Você já salvou várias partidas na última hora. Tenta de novo mais tarde.",
  ranking_unavailable: "Ranking indisponível no momento. Seu resultado continua aqui.",
};

export function SaveScoreForm({ match }: { match: StoredMatch }) {
  // Only mounted client-side (after the stored match is read), so localStorage is safe here.
  const [nickname, setNickname] = useState(() => readJson<string>("local", STORAGE_KEYS.lastNickname) ?? "");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (match.saved) {
    return (
      <p className="font-mono" role="status">
        <span className="text-success">✓</span> Salvo como <strong>{match.saved.nickname}</strong>, na posição{" "}
        <strong className="text-accent">#{match.saved.rank}</strong>.{" "}
        <Link href={`/ranking?category=${match.category}`} className="text-accent underline underline-offset-4">
          Ver ranking
        </Link>
      </p>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = nicknameSchema.safeParse(nickname);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: parsed.data, category: match.category, answers: match.answers }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 201) {
        writeJson("local", STORAGE_KEYS.lastNickname, parsed.data);
        saveMatch({ ...match, saved: { nickname: parsed.data, rank: body.rank } });
        return;
      }
      setError(ERROR_MESSAGES[body.error] ?? ERROR_MESSAGES.ranking_unavailable);
    } catch {
      setError(ERROR_MESSAGES.ranking_unavailable);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2" noValidate>
      <label htmlFor="nickname" className="block font-mono text-sm text-muted">
        Salvar no ranking (opcional)
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="nickname"
          name="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="seu_apelido"
          autoComplete="nickname"
          maxLength={16}
          aria-invalid={error ? true : undefined}
          aria-describedby="nickname-help"
          className="flex-1 rounded-sm border border-border bg-bg px-3 py-2 font-mono"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-sm bg-accent px-4 py-2 font-mono font-bold text-on-accent hover:opacity-90 disabled:opacity-60"
        >
          {sending ? "Salvando…" : "Salvar"}
        </button>
      </div>
      <p id="nickname-help" className={`text-sm ${error ? "text-danger" : "text-muted"}`} role={error ? "alert" : undefined}>
        {error ?? "3 a 16 caracteres: letras, números, _ ou -."}
      </p>
    </form>
  );
}
