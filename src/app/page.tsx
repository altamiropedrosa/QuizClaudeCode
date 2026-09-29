import Link from "next/link";
import { CategoryPicker } from "@/components/CategoryPicker";
import { TerminalWindow } from "@/components/TerminalWindow";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="cursor-blink font-mono text-2xl font-bold sm:text-3xl">
          <span className="text-accent">&gt;</span> Verdadeiro ou Falso?
        </h1>
        <p className="text-muted">
          Quanto você sabe sobre o Claude Code? Do básico de negócio aos hooks e subagents: descubra seu nível em
          poucos minutos.
        </p>
      </div>

      <TerminalWindow title="regras.md">
        <ul className="space-y-1.5">
          <li>
            <span className="font-mono text-accent">15</span> afirmações para julgar: Verdadeiro ou Falso.
          </li>
          <li>
            <span className="font-mono text-accent">10s</span> por pergunta. Se o tempo acabar, conta como erro.
          </li>
          <li>
            A dificuldade sobe: <span className="font-mono">5 Iniciante → 5 Intermediário → 5 Avançado</span>.
          </li>
          <li>Responder rápido vale bônus. Depois de cada resposta, você vê a explicação e a fonte.</li>
          <li>
            Atalhos: <kbd className="font-mono">V</kbd>, <kbd className="font-mono">F</kbd> e{" "}
            <kbd className="font-mono">Enter</kbd>.
          </li>
        </ul>
      </TerminalWindow>

      <form action="/quiz" className="space-y-5">
        <CategoryPicker legend="Escolha um tema (opcional)" />
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="rounded-sm bg-accent px-6 py-3 font-mono font-bold text-on-accent hover:opacity-90"
          >
            Começar <span aria-hidden="true">→</span>
          </button>
          <Link href="/ranking" className="font-mono text-sm text-muted underline underline-offset-4 hover:text-text">
            Ver ranking
          </Link>
        </div>
      </form>
    </div>
  );
}
