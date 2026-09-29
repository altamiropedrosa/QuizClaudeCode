"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import { TerminalWindow } from "@/components/TerminalWindow";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <TerminalWindow title="erro">
      <div className="space-y-4" data-testid="error-boundary">
        <h1 className="font-mono text-xl font-bold">
          <span className="text-danger">✗</span> Opa, algo deu errado por aqui.
        </h1>
        <p className="text-muted">
          Não foi culpa sua. Tenta de novo; se continuar, volta para o início e começa outra partida.
        </p>
        {error.digest && <p className="font-mono text-xs text-muted">código: {error.digest}</p>}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-sm bg-accent px-4 py-2 font-mono font-bold text-on-accent hover:opacity-90"
          >
            Tentar de novo
          </button>
          <Link href="/" className="font-mono text-sm text-muted underline underline-offset-4 hover:text-text">
            Voltar ao início
          </Link>
        </div>
      </div>
    </TerminalWindow>
  );
}
