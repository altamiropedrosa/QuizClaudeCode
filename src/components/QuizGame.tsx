"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { saveMatch } from "@/lib/matchStore";
import { isCorrectAnswer, scoreAnswer, scoreMatch } from "@/lib/scoring";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import { MIN_ANSWER_MS } from "@/lib/validation";
import {
  CATEGORY_LABELS,
  MATCH_SIZE,
  QUESTIONS_PER_LEVEL,
  QUESTION_TIME_MS,
  type AnswerSubmission,
  type CategoryFilter,
  type Level,
  type Question,
} from "@/types";
import { CategoryBadge, LevelBadge } from "./Badges";
import { FeedbackPanel, type Outcome } from "./FeedbackPanel";
import { AnswerButtons, QuestionStatement } from "./QuestionCard";
import { TerminalWindow } from "./TerminalWindow";
import { TimerBar } from "./TimerBar";

const TRANSITION_MS = 1800;

const TRANSITION_TEXT: Record<Level, string> = {
  iniciante: "Aquecendo: nível Iniciante",
  intermediario: "Agora a coisa esquenta: nível Intermediário",
  avancado: "Reta final: nível Avançado",
};

type Phase = "loading" | "error" | "transition" | "question" | "feedback" | "done";

interface State {
  phase: Phase;
  attempt: number;
  questions: Question[];
  index: number;
  answers: AnswerSubmission[];
  score: number;
  lastPoints: number;
}

type Action =
  | { type: "loaded"; questions: Question[] }
  | { type: "failed" }
  | { type: "retry" }
  | { type: "start" }
  | { type: "answer"; answer: boolean | null; timeMs: number }
  | { type: "next" };

const initialState: State = {
  phase: "loading",
  attempt: 0,
  questions: [],
  index: 0,
  answers: [],
  score: 0,
  lastPoints: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loaded":
      return { ...state, phase: "transition", questions: action.questions };
    case "failed":
      return { ...state, phase: "error" };
    case "retry":
      return { ...initialState, attempt: state.attempt + 1 };
    case "start":
      return state.phase === "transition" ? { ...state, phase: "question" } : state;
    case "answer": {
      if (state.phase !== "question") return state;
      const question = state.questions[state.index];
      const points = scoreAnswer(question.level, isCorrectAnswer(question, action.answer), action.timeMs);
      return {
        ...state,
        phase: "feedback",
        answers: [...state.answers, { questionId: question.id, answer: action.answer, timeMs: action.timeMs }],
        score: state.score + points,
        lastPoints: points,
      };
    }
    case "next": {
      if (state.phase !== "feedback") return state;
      const index = state.index + 1;
      if (index >= state.questions.length) return { ...state, phase: "done" };
      return { ...state, index, phase: index % QUESTIONS_PER_LEVEL === 0 ? "transition" : "question" };
    }
  }
}

export function QuizGame({ category }: { category: CategoryFilter }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const transitionRef = useRef<HTMLButtonElement>(null);

  const question: Question | undefined = state.questions[state.index];
  const lastAnswer = state.answers[state.index];

  // Load the match.
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/questions?category=${category}`, { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { questions: Question[] }) => dispatch({ type: "loaded", questions: data.questions }))
      .catch(() => {
        if (!controller.signal.aborted) dispatch({ type: "failed" });
      });
    return () => controller.abort();
  }, [category, state.attempt]);

  const onExpire = useCallback(() => dispatch({ type: "answer", answer: null, timeMs: QUESTION_TIME_MS }), []);
  const { remainingMs, elapsedMs } = useCountdown(QUESTION_TIME_MS, state.phase === "question", state.index, onExpire);

  const answer = useCallback(
    (value: boolean) => {
      // Server rejects sub-400 ms answers as implausible; report at least that (costs <1 bonus point).
      const timeMs = Math.round(Math.min(Math.max(elapsedMs(), MIN_ANSWER_MS), QUESTION_TIME_MS));
      dispatch({ type: "answer", answer: value, timeMs });
    },
    [elapsedMs],
  );

  // Block transition: auto-advance after a short pause.
  useEffect(() => {
    if (state.phase !== "transition") return;
    transitionRef.current?.focus();
    const timer = setTimeout(() => dispatch({ type: "start" }), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [state.phase, state.index]);

  // Focus management between screens.
  useEffect(() => {
    if (state.phase === "question") headingRef.current?.focus();
    if (state.phase === "feedback") nextRef.current?.focus();
  }, [state.phase, state.index]);

  // Keyboard shortcuts: V / F to answer, Enter to continue.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      const key = e.key.toLowerCase();
      if (state.phase === "question" && (key === "v" || key === "f")) {
        e.preventDefault();
        answer(key === "v");
      } else if (e.key === "Enter" && !target?.closest("button, a")) {
        if (state.phase === "feedback") dispatch({ type: "next" });
        if (state.phase === "transition") dispatch({ type: "start" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, answer]);

  // Match finished: persist and go to the result screen.
  useEffect(() => {
    if (state.phase !== "done") return;
    saveMatch({ category, questions: state.questions, answers: state.answers });
    const { score } = scoreMatch(state.answers, (id) => state.questions.find((q) => q.id === id));
    const best = readJson<number>("local", STORAGE_KEYS.bestScore) ?? 0;
    if (score > best) writeJson("local", STORAGE_KEYS.bestScore, score);
    router.replace("/resultado");
  }, [state.phase, state.questions, state.answers, category, router]);

  if (state.phase === "error") {
    return (
      <TerminalWindow title="erro">
        <p className="mb-4">Não consegui carregar as perguntas. Confere a conexão e tenta de novo?</p>
        <button
          type="button"
          onClick={() => dispatch({ type: "retry" })}
          className="rounded-sm bg-accent px-4 py-2 font-mono font-bold text-on-accent"
        >
          Tentar de novo
        </button>
      </TerminalWindow>
    );
  }

  if (state.phase === "loading" || state.phase === "done" || !question) {
    return (
      <p className="cursor-blink font-mono text-muted" role="status">
        carregando
      </p>
    );
  }

  if (state.phase === "transition") {
    return (
      <TerminalWindow title="nível">
        <div className="py-8 text-center" data-testid="block-transition">
          <p className="mb-6 font-mono text-xl font-bold text-accent sm:text-2xl" role="status">
            {TRANSITION_TEXT[question.level]}
          </p>
          <button
            ref={transitionRef}
            type="button"
            onClick={() => dispatch({ type: "start" })}
            className="font-mono text-sm text-muted underline underline-offset-4 hover:text-text"
          >
            Começar agora ↵
          </button>
        </div>
      </TerminalWindow>
    );
  }

  const outcome: Outcome | null = lastAnswer
    ? lastAnswer.answer === null
      ? "timeout"
      : isCorrectAnswer(question, lastAnswer.answer)
        ? "correct"
        : "wrong"
    : null;

  return (
    <TerminalWindow title={`quiz — ${CATEGORY_LABELS[category].toLowerCase()}`}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-sm">
          <span data-testid="progress" aria-label={`Pergunta ${state.index + 1} de ${MATCH_SIZE}`}>
            {state.index + 1}/{MATCH_SIZE}
          </span>
          <LevelBadge level={question.level} />
          <span data-testid="score" aria-label={`Pontuação: ${state.score}`}>
            <span className="text-muted">pts </span>
            <span className="font-bold tabular-nums">{state.score}</span>
          </span>
        </div>

        <TimerBar remainingMs={state.phase === "question" ? remainingMs : (QUESTION_TIME_MS - (lastAnswer?.timeMs ?? 0))} />

        <div className="space-y-3" data-testid="question" data-question-id={question.id} data-level={question.level}>
          <CategoryBadge category={question.category} />
          <QuestionStatement question={question} headingRef={headingRef} />
        </div>

        {state.phase === "question" && <AnswerButtons onAnswer={answer} />}

        {state.phase === "feedback" && outcome && (
          <FeedbackPanel
            question={question}
            outcome={outcome}
            points={state.lastPoints}
            isLast={state.index === MATCH_SIZE - 1}
            onNext={() => dispatch({ type: "next" })}
            nextRef={nextRef}
          />
        )}
      </div>
    </TerminalWindow>
  );
}
