import { TerminalWindow } from "@/components/TerminalWindow";

export default function RankingLoading() {
  return (
    <div className="space-y-6">
      <h1 className="font-mono text-2xl font-bold sm:text-3xl">
        <span className="text-accent">&gt;</span> Ranking
      </h1>
      <TerminalWindow title="top 20">
        <p className="cursor-blink font-mono text-muted" role="status">
          carregando
        </p>
      </TerminalWindow>
    </div>
  );
}
