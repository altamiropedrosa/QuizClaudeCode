import { CATEGORY_LABELS, LEVEL_LABELS, LEVELS, type Category, type Level } from "@/types";

export function LevelBadge({ level }: { level: Level }) {
  const intensity = LEVELS.indexOf(level) + 1;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm border border-accent px-2 py-0.5 font-mono text-xs text-accent"
      aria-label={`Nível ${LEVEL_LABELS[level]}`}
    >
      <span aria-hidden="true" className="tracking-tighter">
        {"▰".repeat(intensity)}
        <span className="opacity-30">{"▱".repeat(LEVELS.length - intensity)}</span>
      </span>
      {LEVEL_LABELS[level]}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className="inline-flex items-center rounded-sm border border-border px-2 py-0.5 font-mono text-xs text-muted"
      data-testid="category-badge"
      data-category={category}
    >
      #{CATEGORY_LABELS[category]}
    </span>
  );
}
