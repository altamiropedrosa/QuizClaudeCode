import type { Metadata } from "next";
import { QuizGame } from "@/components/QuizGame";
import { categoryFilterSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Partida · Quiz Claude Code" };

export default async function QuizPage({ searchParams }: PageProps<"/quiz">) {
  const { category } = await searchParams;
  const parsed = categoryFilterSchema.safeParse(typeof category === "string" ? category : undefined);
  const value = parsed.success ? parsed.data : "todas";
  // key: a new category (or "jogar de novo") always starts a fresh match.
  return <QuizGame key={value} category={value} />;
}
