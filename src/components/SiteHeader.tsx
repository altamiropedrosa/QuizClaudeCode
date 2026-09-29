import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-mono font-bold text-text">
          <span className="text-accent">&gt;_</span> Quiz Claude Code
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/ranking" className="font-mono text-sm text-muted underline-offset-4 hover:text-text hover:underline">
            ranking
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <p className="mx-auto max-w-3xl px-4 py-4 text-center text-xs text-muted">
        Projeto independente, não afiliado à Anthropic. Claude e Claude Code são marcas da Anthropic.
      </p>
    </footer>
  );
}
