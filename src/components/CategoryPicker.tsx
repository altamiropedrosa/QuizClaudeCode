import { CATEGORY_FILTERS, CATEGORY_LABELS, type CategoryFilter } from "@/types";

/** Radio group meant to live inside a GET <form>; submits as `?category=`. */
export function CategoryPicker({ defaultValue = "todas", legend }: { defaultValue?: CategoryFilter; legend: string }) {
  return (
    <fieldset>
      <legend className="mb-2 font-mono text-sm text-muted">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {CATEGORY_FILTERS.map((category) => (
          <label
            key={category}
            className="flex cursor-pointer items-center gap-2 rounded-sm border border-border px-3 py-2 has-checked:border-accent has-checked:text-accent has-focus-visible:outline-2 has-focus-visible:outline-accent"
          >
            <input
              type="radio"
              name="category"
              value={category}
              defaultChecked={category === defaultValue}
              className="accent-(--accent)"
            />
            {CATEGORY_LABELS[category]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
