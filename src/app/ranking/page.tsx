import type { Metadata } from "next";
import Link from "next/link";
import { TerminalWindow } from "@/components/TerminalWindow";
import { getLeaderboard } from "@/lib/leaderboard";
import { categoryFilterSchema } from "@/lib/validation";
import { CATEGORY_FILTERS, CATEGORY_LABELS, type RankingEntry } from "@/types";

export const metadata: Metadata = { title: "Ranking · Quiz Claude Code" };

const TOP = 20;

async function loadRanking(category: Parameters<typeof getLeaderboard>[0]): Promise<RankingEntry[] | null> {
  try {
    return await getLeaderboard(category, TOP);
  } catch (err) {
    console.error("[ranking] load failed", err);
    return null;
  }
}

export default async function RankingPage({ searchParams }: PageProps<"/ranking">) {
  const { category: raw } = await searchParams;
  const parsed = categoryFilterSchema.safeParse(typeof raw === "string" ? raw : undefined);
  const category = parsed.success ? parsed.data : "todas";
  const entries = await loadRanking(category);

  return (
    <div className="space-y-6">
      <h1 className="font-mono text-2xl font-bold sm:text-3xl">
        <span className="text-accent">&gt;</span> Ranking
      </h1>

      <nav aria-label="Filtrar por categoria" className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((c) => (
          <Link
            key={c}
            href={`/ranking?category=${c}`}
            aria-current={c === category ? "page" : undefined}
            className={`rounded-sm border px-3 py-1 font-mono text-sm ${
              c === category ? "border-accent bg-accent text-on-accent" : "border-border text-muted hover:text-text"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </Link>
        ))}
      </nav>

      <TerminalWindow title={`top ${TOP} — ${CATEGORY_LABELS[category].toLowerCase()}`}>
        {entries === null ? (
          <p role="status" data-testid="ranking-unavailable">
            Ranking indisponível no momento. O quiz continua funcionando:{" "}
            <Link href="/" className="text-accent underline underline-offset-4">
              bora jogar
            </Link>
            ?
          </p>
        ) : entries.length === 0 ? (
          <p>
            Ninguém por aqui ainda.{" "}
            <Link href={`/quiz?category=${category}`} className="text-accent underline underline-offset-4">
              Seja a primeira pessoa no ranking!
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-sm" data-testid="ranking-table">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th scope="col" className="py-2 pr-2">#</th>
                  <th scope="col" className="py-2 pr-2">apelido</th>
                  <th scope="col" className="py-2 pr-2 text-right">pontos</th>
                  <th scope="col" className="py-2 pr-2 text-right">acertos</th>
                  <th scope="col" className="hidden py-2 text-right sm:table-cell">data</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={`${e.nickname}-${e.createdAt}`} className="border-b border-border last:border-0">
                    <td className={`py-2 pr-2 ${i < 3 ? "font-bold text-accent" : "text-muted"}`}>{i + 1}</td>
                    <td className="max-w-[10rem] truncate py-2 pr-2">{e.nickname}</td>
                    <td className="py-2 pr-2 text-right font-bold tabular-nums">{e.score}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{e.correct}/15</td>
                    <td className="hidden py-2 text-right text-muted sm:table-cell">
                      {new Date(e.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TerminalWindow>
    </div>
  );
}
