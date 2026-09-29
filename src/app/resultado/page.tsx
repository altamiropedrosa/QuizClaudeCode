import type { Metadata } from "next";
import { ResultView } from "@/components/ResultView";

export const metadata: Metadata = { title: "Resultado · Quiz Claude Code" };

export default function ResultPage() {
  return <ResultView />;
}
