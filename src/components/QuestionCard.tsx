import type { Question } from "@/types";

/** Renders inline `code` spans from the statement's backticks. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="rounded-sm bg-bg px-1 font-mono text-[0.9em]">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function AnswerButtons({
  onAnswer,
  disabled,
}: {
  onAnswer: (answer: boolean) => void;
  disabled?: boolean;
}) {
  const base =
    "flex flex-1 items-center justify-center gap-2 rounded-sm border-2 px-4 py-3 font-mono font-bold transition-colors disabled:opacity-50";
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAnswer(true)}
        className={`${base} border-success text-success hover:bg-success hover:text-surface`}
      >
        <span aria-hidden="true">✓</span> Verdadeiro
        <kbd className="ml-1 rounded-sm border border-current px-1 text-xs opacity-70">V</kbd>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAnswer(false)}
        className={`${base} border-danger text-danger hover:bg-danger hover:text-surface`}
      >
        <span aria-hidden="true">✗</span> Falso
        <kbd className="ml-1 rounded-sm border border-current px-1 text-xs opacity-70">F</kbd>
      </button>
    </div>
  );
}

export function QuestionStatement({ question, headingRef }: { question: Question; headingRef?: React.Ref<HTMLHeadingElement> }) {
  return (
    <h2 ref={headingRef} tabIndex={-1} className="text-lg leading-relaxed font-medium sm:text-xl">
      <span aria-hidden="true" className="mr-2 font-mono text-accent">
        &gt;
      </span>
      <RichText text={question.statement} />
    </h2>
  );
}
