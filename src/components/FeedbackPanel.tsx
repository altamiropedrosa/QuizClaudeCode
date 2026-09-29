import type { Ref } from "react";
import type { Question } from "@/types";
import { RichText } from "./QuestionCard";

export type Outcome = "correct" | "wrong" | "timeout";

const MESSAGES: Record<Outcome, { icon: string; text: string; tone: string }> = {
  correct: { icon: "✓", text: "Boa! Era isso mesmo.", tone: "text-success border-success" },
  wrong: { icon: "✗", text: "Quase! Olha só o porquê:", tone: "text-danger border-danger" },
  timeout: { icon: "⏱", text: "O tempo acabou. Bora para a próxima?", tone: "text-danger border-danger" },
};

export function FeedbackPanel({
  question,
  outcome,
  points,
  isLast,
  onNext,
  nextRef,
}: {
  question: Question;
  outcome: Outcome;
  points: number;
  isLast: boolean;
  onNext: () => void;
  nextRef?: Ref<HTMLButtonElement>;
}) {
  const msg = MESSAGES[outcome];
  return (
    <div className={`space-y-3 border-l-4 pl-4 ${msg.tone}`} role="status" data-testid="feedback" data-outcome={outcome}>
      <p className="font-mono font-bold">
        <span aria-hidden="true">{msg.icon} </span>
        {msg.text}
        {points > 0 && <span className="ml-2 text-accent">+{points}</span>}
      </p>
      <p className="text-text">
        A resposta certa é <strong>{question.answer ? "Verdadeiro" : "Falso"}</strong>.{" "}
        <RichText text={question.explanation} />
      </p>
      <p className="text-sm">
        <a
          href={question.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-4"
        >
          Ver na documentação<span className="sr-only"> (abre em nova aba)</span> ↗
        </a>
      </p>
      <button
        ref={nextRef}
        type="button"
        onClick={onNext}
        className="rounded-sm bg-accent px-4 py-2 font-mono font-bold text-on-accent hover:opacity-90"
      >
        {isLast ? "Ver resultado" : "Próxima"} <span aria-hidden="true">↵</span>
      </button>
    </div>
  );
}
