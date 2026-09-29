"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getStoredMatch, subscribeMatch } from "@/lib/matchStore";
import { classify, isCorrectAnswer, MAX_SCORE, scoreMatch } from "@/lib/scoring";
import { CATEGORIES, CATEGORY_LABELS, MATCH_SIZE } from "@/types";
import { CategoryBadge, LevelBadge } from "./Badges";
import { RichText } from "./QuestionCard";
import { SaveScoreForm } from "./SaveScoreForm";
import { TerminalWindow } from "./TerminalWindow";

// `undefined` on the server/first hydration pass, `null` when there's no finished match.
const serverSnapshot = () => undefined;

export function ResultView() {
  const match = useSyncExternalStore(subscribeMatch, getStoredMatch, serverSnapshot);

  if (match === undefined) {
    return <p className="cursor-blink font-mono text-muted">carregando</p>;
  }

  if (!match) {
    return (
      <TerminalWindow title="resultado">
        <p className="mb-4">Nenhuma partida encontrada por aqui.</p>
        <Link href="/" className="rounded-sm bg-accent px-4 py-2 font-mono font-bold text-on-accent">
          Jogar agora
        </Link>
      </TerminalWindow>
    );
  }

  const byId = new Map(match.questions.map((q) => [q.id, q]));
  const result = scoreMatch(match.answers, (id) => byId.get(id));
  const classification = classify(result.score);
  const wrong = match.answers.filter((a) => !isCorrectAnswer(byId.get(a.questionId)!, a.answer));

  return (
    <div className="space-y-6">
      <TerminalWindow title="resultado">
        <div className="space-y-5" data-testid="result">
          <div>
            <p className="font-mono text-sm text-muted">&gt; sua classificação</p>
            <h1 className="font-mono text-2xl font-bold text-accent sm:text-3xl" data-testid="classification">
              {classification}
            </h1>
          </div>

          <dl className="grid grid-cols-3 gap-3 text-center font-mono">
            <Stat label="pontos" value={result.score} hint={`de ${MAX_SCORE}`} testId="final-score" />
            <Stat label="acertos" value={`${result.correct}/${MATCH_SIZE}`} testId="final-correct" />
            <Stat label="tempo" value={`${(result.totalTimeMs / 1000).toFixed(1)}s`} />
          </dl>

          <div>
            <h2 className="mb-2 font-mono text-sm text-muted">&gt; desempenho por categoria</h2>
            <ul className="space-y-1.5">
              {CATEGORIES.filter((c) => result.perCategory[c]).map((c) => {
                const stats = result.perCategory[c]!;
                return (
                  <li key={c} className="flex items-center gap-3">
                    <span className="flex-1">{CATEGORY_LABELS[c]}</span>
                    <span className="font-mono tabular-nums">
                      {stats.correct}/{stats.total}
                    </span>
                    <span className="h-2 w-20 overflow-hidden rounded-sm bg-border" aria-hidden="true">
                      <span className="block h-full bg-success" style={{ width: `${(stats.correct / stats.total) * 100}%` }} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-border pt-4">
            <SaveScoreForm match={match} />
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={`/quiz?category=${match.category}`}
              className="rounded-sm bg-accent px-4 py-2 font-mono font-bold text-on-accent hover:opacity-90"
            >
              Jogar de novo
            </Link>
            <Link href="/" className="self-center font-mono text-sm text-muted underline underline-offset-4 hover:text-text">
              Trocar tema
            </Link>
          </div>
        </div>
      </TerminalWindow>

      {wrong.length > 0 && (
        <TerminalWindow title="revisao.md">
          <h2 className="mb-4 font-mono font-bold">&gt; Para revisar ({wrong.length})</h2>
          <ol className="space-y-5" data-testid="review-list">
            {wrong.map((a) => {
              const q = byId.get(a.questionId)!;
              return (
                <li key={q.id} className="space-y-1.5 border-l-2 border-danger pl-3">
                  <div className="flex flex-wrap gap-2">
                    <LevelBadge level={q.level} />
                    <CategoryBadge category={q.category} />
                  </div>
                  <p className="font-medium">
                    <RichText text={q.statement} />
                  </p>
                  <p className="text-sm">
                    <span className="font-mono text-danger">
                      {a.answer === null ? "tempo esgotado" : `você: ${a.answer ? "V" : "F"}`}
                    </span>
                    {" · "}
                    <span className="font-mono text-success">certo: {q.answer ? "Verdadeiro" : "Falso"}</span>
                  </p>
                  <p className="text-sm text-muted">
                    <RichText text={q.explanation} />{" "}
                    <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">
                      fonte<span className="sr-only"> (abre em nova aba)</span> ↗
                    </a>
                  </p>
                </li>
              );
            })}
          </ol>
        </TerminalWindow>
      )}
    </div>
  );
}

function Stat({ label, value, hint, testId }: { label: string; value: string | number; hint?: string; testId?: string }) {
  return (
    <div className="rounded-sm border border-border p-2 sm:p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-xl font-bold tabular-nums sm:text-2xl" data-testid={testId}>
        {value}
      </dd>
      {hint && <dd className="text-xs text-muted">{hint}</dd>}
    </div>
  );
}
