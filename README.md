# Quiz Claude Code

Quiz de Verdadeiro ou Falso sobre o Claude Code: 15 perguntas com dificuldade crescente (5 Iniciante → 5 Intermediário → 5 Avançado), 10 segundos por pergunta, explicação e fonte após cada resposta, e ranking global sem login.

**Produção:** https://quiz-claude-code-gold.vercel.app

Requisitos completos em [`prd.md`](./prd.md).

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # opcional: sem Supabase o quiz funciona, só o ranking fica indisponível
npm run dev
```

> Há um único ambiente Supabase (produção). Se preencher o `.env.local` com ele, as partidas salvas localmente entram no ranking real.

## Testes

```bash
npm test             # unitários (Vitest)
npm run test:e2e     # E2E (Playwright; na primeira vez: npx playwright install chromium)
npm run lint && npm run typecheck
```

## Deploy (Vercel + Supabase, ambiente único de produção)

1. No Supabase (região `sa-east-1`), rode `supabase/schema.sql` no SQL Editor.
2. Na Vercel, o projeto importa este repositório. A região das funções já vem fixada em `gru1` pelo `vercel.json`.
3. Em Settings → Environment Variables, cadastre as variáveis abaixo, sem prefixo `NEXT_PUBLIC_`:

   | Variável | Valor |
   |---|---|
   | `SUPABASE_URL` | Project URL (Supabase → Project Settings → API) |
   | `SUPABASE_SERVICE_ROLE_KEY` | chave secreta: `secret` (`sb_secret_…`) ou `service_role` legada |
   | `IP_HASH_SALT` | segredo aleatório: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

4. Cada push em `main` gera o deploy de produção. Depois de alterar variáveis, faça um Redeploy.

---

Projeto independente, não afiliado à Anthropic. Claude e Claude Code são marcas da Anthropic.
