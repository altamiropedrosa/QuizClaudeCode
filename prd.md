# PRD — Quiz Claude Code (Verdadeiro ou Falso)

> Documento para ser consumido pelo Claude Code na construção do projeto. Contém contexto de negócio, requisitos funcionais, arquitetura técnica, modelo de dados, banco inicial de perguntas e plano de implementação.

---

## 1. Visão geral

**Produto:** aplicação web de quiz "Verdadeiro ou Falso" sobre o Claude Code, com perguntas que vão do nível de negócio (iniciante) ao técnico avançado.

**Problema:** há muita desinformação e muito desconhecimento sobre o que o Claude Code é e o que ele consegue fazer. Gestores não entendem o valor; devs desconhecem recursos como hooks, subagents, skills e MCP.

**Proposta de valor:** aprender de forma leve e gamificada, com feedback explicativo imediato após cada resposta, e medir o próprio nível de conhecimento.

**Idioma:** Português (BR), interface e conteúdo.

## 2. Objetivos e métricas de sucesso

| Objetivo | Métrica |
|---|---|
| Educar | ≥ 70% dos jogadores concluem a partida de 15 perguntas |
| Engajar | ≥ 30% jogam uma segunda partida |
| Competir | ≥ 40% dos que concluem registram apelido no ranking |
| Qualidade | 100% das perguntas com explicação e fonte |

## 3. Público-alvo e personas

1. **Gestora/Negócio (iniciante):** quer entender o que é e para que serve. Nível *Iniciante*.
2. **Dev em adoção (intermediário):** já usa o básico, quer dominar comandos, CLAUDE.md, modos de permissão. Nível *Intermediário*.
3. **Dev avançado / Tech lead:** automatiza com hooks, MCP, subagents, skills, SDK. Nível *Avançado*.

## 4. Escopo

### Dentro da v1
- **Formato das perguntas: apenas Verdadeiro ou Falso.**
- Partida de **15 perguntas com dificuldade progressiva**: 5 de nível Iniciante, depois 5 Intermediário, depois 5 Avançado (ordem fixa por bloco; perguntas sorteadas e embaralhadas dentro de cada bloco), sem repetição dentro da partida.
- Escolha opcional de **categoria temática** (Todas, Fundamentos, Features e Produtividade, Claude API/SDK, Boas práticas e casos de uso).
- **Timer de 10 s por pergunta**; estourar o tempo conta como erro.
- Feedback após cada resposta: correto/incorreto + explicação + link da fonte.
- **Sistema de pontuação** com peso por nível de dificuldade e bônus por rapidez.
- Tela de resultado: pontuação, acertos, tempo total, revisão dos erros, botão "jogar de novo".
- **Salvar o apelido (nickname) ao final da partida**, na tela de resultado, para entrar no **ranking/leaderboard** global (top 20), sem login.
- Responsivo (mobile-first), acessível (teclado, contraste, `aria`).

### Fora da v1
Login/contas, multi-idioma, geração de perguntas por IA, painel administrativo, modo multiplayer.

## 5. Requisitos funcionais

**RF01 — Home:** título, descrição curta explicando as regras (15 perguntas, 10 s cada, dificuldade crescente), seleção de categoria (padrão "Todas"), botão "Começar", link para ranking. Não há escolha de nível: a dificuldade sobe durante a partida.
**RF02 — Sorteio:** montar 15 perguntas em 3 blocos de 5, na ordem Iniciante → Intermediário → Avançado. Em cada bloco, sortear 5 perguntas do nível (embaralhar com Fisher-Yates), filtrando pela categoria quando houver. Se o conjunto nível × categoria tiver menos de 5 perguntas, completar com perguntas do mesmo nível de outras categorias. Com "Todas", buscar distribuir as categorias dentro de cada bloco.
**RF02b — Categoria na pergunta:** exibir um selo com a categoria em cada pergunta e, na tela de resultado, o desempenho (acertos/total) por categoria.
**RF03 — Pergunta:** exibir enunciado, botões **Verdadeiro** e **Falso**, contador de progresso (n/15), indicador do nível atual (Iniciante, Intermediário, Avançado), barra de timer de 10 s, pontuação atual. Atalhos de teclado: `V` e `F`. Ao mudar de bloco (perguntas 6 e 11), mostrar uma transição rápida: "Agora a coisa esquenta: nível Intermediário".
**RF04 — Feedback:** após responder (ou tempo esgotado), mostrar acerto/erro, explicação e fonte; botão "Próxima" (ou `Enter`).
**RF05 — Pontuação:** acerto = pontos-base do nível + bônus de rapidez. Pontos-base: Iniciante 100, Intermediário 150, Avançado 200. Bônus = `round(base * 0.5 * segundosRestantes / 10)`, com `segundosRestantes` em [0, 10] (fração permitida). Erro ou timeout = 0. Máximo por partida: 3375 (5×150 + 5×225 + 5×300). Desempate no ranking: menor tempo total.
**RF06 — Resultado:** exibir pontuação, acertos, tempo total, classificação textual (ver §7), lista das perguntas erradas com explicação.
**RF07 — Ranking:** ao final da partida, na tela de resultado, campo de apelido (3–16 caracteres, alfanumérico, `_` e `-`) para salvar a pontuação; salvar é opcional. Página `/ranking` com o leaderboard global, top 20, ordenado por pontuação (desempate por menor tempo), com filtro por categoria (padrão "Todas").
**RF08 — Anti-abuso:** limite de submissões por IP (ex.: 5 por hora), filtro simples de palavras ofensivas no apelido, validação de pontuação plausível no servidor (§8.3).
**RF09 — Persistência local:** guardar último apelido e melhor pontuação em `localStorage` (com try/catch).

## 6. Requisitos não funcionais

- Desempenho: LCP < 2 s em 4G; banco de perguntas servido estático.
- Acessibilidade: WCAG AA; foco visível; timer com alternativa textual (`aria-live` discreto).
- Suporte: últimas 2 versões de Chrome, Edge, Firefox, Safari; mobile ≥ 360 px.
- Segurança: nenhuma chave secreta no cliente; RLS ativo no Supabase; sanitização de entrada.
- Observabilidade: logs de erro básicos das rotas de API.

## 7. Níveis e classificação final

Os níveis não são escolhidos pelo jogador: eles compõem a **progressão de dificuldade** da partida (5 perguntas de cada, nessa ordem) e definem o peso da pontuação.

| Nível | Foco | Exemplos de tópicos |
|---|---|---|
| Iniciante | O que é, para quem, valor | conceito, permissões, casos de uso, limites |
| Intermediário | Uso diário | CLAUDE.md, slash commands, modos, contexto, headless |
| Avançado | Extensibilidade e automação | hooks, MCP, subagents, skills, settings, SDK |

### 7.1 Categorias temáticas

Independentes do nível: toda pergunta tem **um nível e uma categoria**.

| ID | Categoria | Cobre |
|---|---|---|
| `fundamentos` | Fundamentos de Claude (CLI) | O que é o Claude Code, instalação e login, comando `claude`, modelo de permissões, settings, uso no terminal e IDEs |
| `features` | Features e Produtividade | CLAUDE.md, slash commands, Plan Mode, `/clear` e `/compact`, hooks, subagents, skills, MCP, atalhos, retomada de sessões |
| `api-sdk` | Claude API/SDK | Claude API (Messages, tool use, prompt caching), SDKs oficiais, Claude Agent SDK, modo headless (`-p`), CI/CD, segurança de chaves |
| `boas-praticas` | Boas práticas e casos de uso | Como escrever bons prompts, planejar antes de codar, verificação com testes, gestão de contexto, segurança, paralelismo, casos de uso técnicos e de negócio |

**Meta de cobertura:** mínimo de 10 perguntas por célula nível × categoria (12 células, 120 perguntas) para o sorteio filtrado funcionar sem completar e com boa variação entre partidas (cada partida usa 5 por nível); a v1 pode lançar com o seed do §10 e a regra de complemento do RF02.

Classificação por pontuação (% do máximo de 3375): 0–39% "Aprendiz", 40–69% "Praticante", 70–89% "Especialista", 90–100% "Mestre do Claude Code".

## 8. Arquitetura técnica

### 8.1 Stack
- **Next.js 14+ (App Router) + TypeScript + Tailwind CSS**
- **Supabase (Postgres)** para o ranking; cliente `@supabase/supabase-js` usado **somente no servidor** (Route Handlers)
- **Zod** para validação
- Testes: **Vitest** (lógica) + **Playwright** (fluxo principal)
- Deploy e infraestrutura: **Vercel + Supabase** (detalhes no §8.8)

### 8.2 Estrutura de pastas
```
/
├─ prd.md
├─ CLAUDE.md
├─ .env.example
├─ supabase/
│  └─ schema.sql
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                 # Home / regras e escolha de categoria
│  │  ├─ quiz/page.tsx            # Partida (15 perguntas)
│  │  ├─ resultado/page.tsx       # Resultado (estado via sessionStorage)
│  │  ├─ ranking/page.tsx         # Ranking
│  │  └─ api/
│  │     ├─ questions/route.ts    # GET ?category= -> 15 perguntas (5/5/5), com gabarito (ver 8.3)
│  │     └─ scores/route.ts       # GET ranking, POST nova pontuação
│  ├─ components/                 # QuestionCard, TimerBar, ResultSummary, RankingTable, CategoryPicker, LevelBadge
│  ├─ data/questions.json         # banco de perguntas
│  ├─ lib/                        # scoring.ts, shuffle.ts, supabase.ts, validation.ts, profanity.ts
│  └─ types/index.ts
└─ tests/
```

### 8.3 Decisões de design
- **Perguntas:** ficam em `src/data/questions.json`, versionadas no repositório. O sorteio ocorre no servidor (`/api/questions`), que devolve as 15 perguntas (5 iniciante, 5 intermediário, 5 avançado, nessa ordem) **com gabarito** (o quiz é educativo, sem prêmio; trapacear só prejudica o próprio jogador). Para o ranking, o cliente envia a lista de `{questionId, answer, timeMs}` e o **servidor recalcula a pontuação** com o gabarito, ignorando qualquer pontuação enviada pelo cliente.
- **Validação de plausibilidade:** rejeitar se não houver exatamente 15 respostas, se os IDs forem duplicados, se a sequência não seguir 5 iniciante → 5 intermediário → 5 avançado, se `timeMs` < 400 ms ou > 10500 ms (10 s + tolerância de rede), ou se a categoria informada não bater com as perguntas. Tempo esgotado é enviado como `answer: null` com `timeMs: 10000`.
- **Rate limit:** contagem de linhas em `scores` por `ip_hash` na última hora, consultada no servidor (ver §8.8); nunca armazenar IP em texto puro.
- **Estado da partida:** React state + `sessionStorage` para sobreviver a refresh na tela de resultado.

### 8.4 Modelo de dados

```sql
create table scores (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 3 and 16),
  category text not null default 'todas'
    check (category in ('todas','fundamentos','features','api-sdk','boas-praticas')),
  score int not null check (score between 0 and 3375),
  correct int not null check (correct between 0 and 15),
  total_time_ms int not null check (total_time_ms >= 0),
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index scores_rank on scores (category, score desc, total_time_ms asc);
alter table scores enable row level security;
-- Sem policies públicas: leitura/escrita apenas via service role no servidor.
```

### 8.5 Contratos de API

`GET /api/questions?category=features` → `200 { questions: Question[15] }` na ordem 5 iniciante, 5 intermediário, 5 avançado (`category` opcional; omitido = `todas`)

`POST /api/scores` (chamado ao final da partida, quando a pessoa salva o apelido)
```json
{ "nickname": "maria_dev", "category": "todas",
  "answers": [{ "questionId": "ini-001", "answer": true, "timeMs": 5400 },
              { "questionId": "ini-004", "answer": null, "timeMs": 10000 }] }
```
(15 itens; `answer: null` = tempo esgotado)
→ `201 { score, correct, rank }` | `400` validação | `429` rate limit.

`GET /api/scores?category=todas&limit=20` (`category` opcional, padrão `todas`) → `200 { scores: [{ nickname, score, correct, createdAt }] }`

### 8.6 Tipos
```ts
type Level = 'iniciante' | 'intermediario' | 'avancado';
type Category = 'fundamentos' | 'features' | 'api-sdk' | 'boas-praticas';
interface Question {
  id: string;            // ex.: "ini-001"
  level: Level;
  category: Category;
  statement: string;     // afirmação a ser julgada
  answer: boolean;       // gabarito
  explanation: string;   // porquê, 1–3 frases
  sourceUrl: string;     // documentação oficial
  tags: string[];
}
```

### 8.7 Variáveis de ambiente (`.env.example`)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
IP_HASH_SALT=
```

### 8.8 Deploy e infraestrutura de destino

**Destino: Vercel (aplicação) + Supabase (banco de dados).** Não há outros serviços de infraestrutura na v1.

| Componente | Serviço | Detalhes |
|---|---|---|
| Frontend e API (Route Handlers) | **Vercel** | Deploy do Next.js; Route Handlers rodam como funções serverless |
| Banco do ranking | **Supabase** (Postgres) | Tabela `scores` criada com `supabase/schema.sql`; RLS ativo, acesso só pelo servidor |
| Perguntas | Repositório | `src/data/questions.json` vai no build, sem banco |

**Ambientes**
- **Produção:** branch `main` → deploy automático na Vercel, ligado a um projeto Supabase de produção.
- **Preview:** cada PR/branch gera um preview na Vercel; usar um projeto Supabase separado (ou de desenvolvimento) para não poluir o ranking real.
- **Local:** `npm run dev` com `.env.local` apontando para o projeto Supabase de desenvolvimento (ou Supabase CLI local).

**Configuração**
- Variáveis de ambiente (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SALT`) cadastradas no painel da Vercel por ambiente (Production, Preview, Development). Nenhuma delas com prefixo `NEXT_PUBLIC_`.
- `SUPABASE_SERVICE_ROLE_KEY` usada só em código de servidor (Route Handlers); nunca no cliente nem versionada. Arquivo `.env.local` no `.gitignore`.
- Rotas de API que acessam o Supabase devem usar o runtime Node.js e ser dinâmicas (sem cache estático de `GET /api/scores`; para `/api/questions` o sorteio é aleatório e também não deve ser cacheado).
- Região: escolher Vercel Functions e projeto Supabase na mesma região (ex.: São Paulo, `gru1` na Vercel e `sa-east-1` no Supabase) para reduzir latência.
- Migrações: `supabase/schema.sql` aplicado manualmente (SQL Editor) ou via Supabase CLI; qualquer mudança futura em arquivo versionado.
- Domínio: subdomínio `*.vercel.app` na v1; domínio próprio opcional depois.

**Limites dos planos gratuitos** (verificar valores atuais antes do lançamento): o Supabase gratuito pode pausar projetos inativos por um período, o que derrubaria o ranking. Mitigação: tratar erro de banco com mensagem amigável na UI ("Ranking indisponível no momento") sem quebrar o quiz, que continua jogável, e considerar um plano pago ou uma verificação periódica se o app for divulgado.

**Rate limit em ambiente serverless:** contador em memória não funciona entre instâncias. Usar a própria tabela do Supabase (contagem de `scores` por `ip_hash` na última hora) para o limite de submissões, sem serviço extra.

## 9. UX / UI

- Identidade visual: ver §9.1.
- Fluxo: Home (regras + categoria) → 15 perguntas com dificuldade crescente (pergunta → feedback) → resultado → salvar apelido no ranking → ranking.
- Verdadeiro/Falso com cores **e** ícones (não depender só de cor).
- Timer: barra que esvazia em 10 s; últimos 3 s em destaque.
- Indicador de nível (Iniciante, Intermediário, Avançado) sempre visível, com cor/ícone crescente de intensidade.

### 9.1 Identidade visual

**Direção:** estética de terminal. Superfícies como janelas de terminal, prompt `>` nos títulos e nas perguntas, cursor piscante discreto (desligado com `prefers-reduced-motion`), bordas finas e cantos pouco arredondados.

**Paleta** (definir como tokens no Tailwind/CSS variables; nunca usar cores fixas nos componentes):

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--bg` | `#FAF7F2` | `#1C1917` | Fundo da página |
| `--surface` | `#FFFFFF` | `#26221F` | Cartões e janelas |
| `--text` | `#2B2622` | `#F1ECE4` | Texto principal |
| `--muted` | `#6B625A` | `#A39A90` | Texto secundário |
| `--accent` | `#C4562F` | `#E07A55` | Terracota: botões primários e destaques |
| `--success` | `#2F7D4F` | `#5CC48A` | Acerto |
| `--danger` | `#B3372F` | `#F0776E` | Erro |

Valores de partida: ajustar para garantir contraste mínimo WCAG AA (4.5:1 para texto) em ambos os temas.

**Tipografia:** interface e texto corrido em fonte sans (Inter ou a fonte do sistema); títulos, selos, timer, pontuação e ranking em fonte monoespaçada (JetBrains Mono ou IBM Plex Mono), via `next/font`.

**Tema:** segue `prefers-color-scheme` por padrão, com alternador (claro/escuro/sistema) no cabeçalho; a escolha é salva em `localStorage` (com try/catch) e aplicada sem flash de tema.

**Tom de voz:** descontraído e didático, em PT-BR, segunda pessoa ("você"), com humor leve e sem gíria pesada. Exemplos:
- Acerto: "Boa! Era isso mesmo." / Erro: "Quase! Olha só o porquê:"
- Timeout: "O tempo acabou. Bora para a próxima?"
- Classificações: Aprendiz, Praticante, Especialista, Mestre do Claude Code.
- Explicações: curtas (1 a 3 frases), sem jargão sem explicação, sobretudo nos níveis iniciante e intermediário.

**Restrições de marca:**
- Não usar o logo, o nome estilizado nem a marca oficial da Anthropic ou do Claude. Usar apenas identidade própria (nome do projeto em texto e um ícone simples, como `>_`).
- Rodapé em todas as páginas: "Projeto independente, não afiliado à Anthropic. Claude e Claude Code são marcas da Anthropic."
- Nome de trabalho: **Quiz Claude Code**, para ser revisto antes do lançamento.

**Fica para depois da v1:** logo definitivo, ilustrações, animações elaboradas, imagem de compartilhamento (Open Graph) e certificado do resultado. Na v1, favicon simples (`>_`) e metadados básicos.

## 10. Banco inicial de perguntas (seed)

Cada nível deve ter **no mínimo 10** perguntas na v1 (cada partida usa 5 por nível; meta: 15 por nível para variar o sorteio). As abaixo são o seed; o Claude Code deve convertê-las para `src/data/questions.json` no schema do §8.6, com `sourceUrl` apontando para a página correspondente de https://docs.claude.com/en/docs/claude-code (overview, memory, hooks, mcp, sub-agents, skills, settings, sdk).

Cada pergunta recebe também o campo `category` (§7.1). Categorias das perguntas abaixo:

| Categoria | IDs |
|---|---|
| `fundamentos` | ini-001, ini-002, ini-003, ini-005, ini-008, ini-009, int-009, int-010, ava-009 |
| `features` | int-001 a int-007, ava-001 a ava-008 |
| `api-sdk` | int-008, ava-010, mais as perguntas `api-*` do §10.1 |
| `boas-praticas` | ini-004, ini-006, ini-007, ini-010, mais as perguntas `bp-*` do §10.1 |

> ⚠️ O Claude Code evolui rápido. Antes de publicar, **revisar cada pergunta contra a documentação atual**.

### Iniciante
| ID | Afirmação | R | Explicação |
|---|---|---|---|
| ini-001 | Claude Code é uma ferramenta de programação agêntica da Anthropic que roda no terminal. | V | Ele lê seu código, edita arquivos e executa comandos a partir de instruções em linguagem natural. |
| ini-002 | Claude Code é desenvolvido pela OpenAI. | F | É produto da Anthropic, criadora dos modelos Claude. |
| ini-003 | Claude Code só pode ser usado no terminal. | F | Também há extensões para VS Code e JetBrains, app desktop e versão web. |
| ini-004 | Claude Code pode ajudar a entender uma base de código que você nunca viu. | V | Você pode pedir resumos de arquitetura e localizar onde algo é implementado. |
| ini-005 | Por padrão, o Claude Code pede permissão antes de editar arquivos ou executar comandos. | V | O modelo de permissões mantém a pessoa no controle das ações sensíveis. |
| ini-006 | Claude Code só serve para escrever código novo, não para depurar ou refatorar. | F | Ele também depura, refatora, escreve testes, explica código e automatiza tarefas de git. |
| ini-007 | Com Claude Code, a revisão humana do código gerado deixa de ser necessária. | F | Revisar continua sendo boa prática; o humano é responsável pelo que vai para produção. |
| ini-008 | Para iniciar o Claude Code, você digita `claude` no terminal dentro da pasta do projeto. | V | Esse é o comando que abre a sessão interativa no diretório atual. |
| ini-009 | Usar Claude Code exige conta na Anthropic (assinatura ou acesso via API/nuvem parceira). | V | É necessária autenticação; há opções via plano Claude, Console da Anthropic ou provedores de nuvem. |
| ini-010 | Claude Code pode automatizar tarefas repetitivas de desenvolvimento, como escrever testes e commits. | V | Isso reduz trabalho manual e libera tempo para decisões de maior valor. |

### Intermediário
| ID | Afirmação | R | Explicação |
|---|---|---|---|
| int-001 | O arquivo CLAUDE.md é carregado automaticamente como contexto no início de cada sessão. | V | Serve para registrar convenções, comandos e regras do projeto. |
| int-002 | O comando `/init` cria um CLAUDE.md inicial analisando o projeto. | V | Gera um ponto de partida que você pode editar. |
| int-003 | O comando `/clear` limpa o contexto da conversa atual. | V | Útil ao trocar de tarefa para não carregar contexto irrelevante. |
| int-004 | O comando `/compact` resume a conversa para liberar espaço na janela de contexto. | V | Mantém o essencial e reduz tokens usados. |
| int-005 | No Plan Mode, o Claude edita os arquivos imediatamente sem apresentar um plano. | F | No Plan Mode ele apenas analisa e propõe um plano, sem modificar arquivos até você aprovar. |
| int-006 | Você pode criar slash commands personalizados como arquivos Markdown em `.claude/commands`. | V | Eles viram comandos reutilizáveis do projeto (ou pessoais em `~/.claude/commands`). |
| int-007 | O CLAUDE.md só pode existir na raiz do projeto. | F | Também pode existir em `~/.claude/CLAUDE.md` e em subpastas, que são carregados conforme o contexto. |
| int-008 | `claude -p "pergunta"` executa uma consulta em modo não interativo e imprime a resposta. | V | Útil em scripts e pipelines de CI. |
| int-009 | Pressionar `Esc` interrompe o Claude durante o trabalho sem encerrar a sessão. | V | Você pode redirecionar a conversa em seguida. |
| int-010 | Não é possível retomar uma conversa anterior do Claude Code. | F | `claude --continue` retoma a última e `claude --resume` permite escolher uma sessão. |

### Avançado
| ID | Afirmação | R | Explicação |
|---|---|---|---|
| ava-001 | Hooks são comandos que rodam automaticamente em pontos do ciclo de vida, como antes ou depois do uso de uma ferramenta. | V | Ex.: `PreToolUse` e `PostToolUse`. |
| ava-002 | A execução de hooks é decidida pelo modelo e, portanto, não é garantida. | F | Hooks são determinísticos: o harness os executa sempre que o evento ocorre. |
| ava-003 | Um hook `PreToolUse` pode bloquear a execução de uma ferramenta. | V | Por exemplo, impedir edição de arquivos sensíveis retornando código de saída de bloqueio. |
| ava-004 | MCP (Model Context Protocol) permite conectar o Claude Code a ferramentas e fontes de dados externas. | V | Ex.: GitHub, bancos de dados, Slack, navegadores. |
| ava-005 | Servidores MCP só podem ser executados localmente via stdio. | F | Também há transportes remotos, como HTTP e SSE. |
| ava-006 | Subagents têm janela de contexto própria, separada da conversa principal. | V | Isso evita poluir o contexto principal com pesquisas e tarefas paralelas. |
| ava-007 | Subagents podem ser definidos como arquivos Markdown em `.claude/agents`. | V | O arquivo tem frontmatter (nome, descrição, ferramentas) e o prompt do agente. |
| ava-008 | Uma skill é definida por uma pasta contendo um arquivo `SKILL.md`. | V | O Claude carrega a skill quando a descrição corresponde à tarefa. |
| ava-009 | `settings.local.json` é pensado para preferências pessoais que não devem ser commitadas. | V | Diferente de `settings.json` do projeto, que pode ser compartilhado com o time. |
| ava-010 | O Claude Agent SDK permite construir seus próprios agentes reutilizando o mesmo loop e ferramentas do Claude Code. | V | Disponível para TypeScript e Python. |

### 10.1 Perguntas adicionais (Claude API/SDK e Boas práticas e casos de uso)

**Categoria `api-sdk`**

| ID | Nível | Afirmação | R | Explicação |
|---|---|---|---|---|
| api-001 | iniciante | A Claude API e o Claude Code são a mesma coisa; usar um dispensa o outro. | F | A API dá acesso programático aos modelos Claude; o Claude Code é uma ferramenta agêntica pronta construída sobre eles. |
| api-002 | iniciante | A Anthropic oferece SDKs oficiais para a Claude API, como Python e TypeScript. | V | Os SDKs simplificam autenticação, requisições e streaming. |
| api-003 | intermediário | O Claude Agent SDK está disponível para TypeScript e Python. | V | Permite criar agentes com o mesmo loop e ferramentas do Claude Code. |
| api-004 | intermediário | `claude -p` com `--output-format json` permite integrar o Claude Code a scripts com saída estruturada. | V | O modo não interativo é feito para automação. |
| api-005 | intermediário | O Claude Code pode ser executado em pipelines de CI/CD, como o GitHub Actions. | V | Existe integração oficial para automatizar revisões e tarefas em PRs. |
| api-006 | avançado | A Messages API é stateless: o histórico da conversa deve ser reenviado a cada requisição. | V | A API não guarda estado; sua aplicação gerencia as mensagens anteriores. |
| api-007 | avançado | Em tool use com ferramentas definidas por você, o código da função é executado pela Anthropic. | F | O modelo apenas solicita a chamada; sua aplicação executa a função e devolve o resultado. |
| api-008 | avançado | Prompt caching pode reduzir custo e latência quando o início do prompt se repete entre requisições. | V | Prefixos estáveis são reaproveitados em vez de reprocessados. |
| api-009 | avançado | Não há problema em colocar a chave da API diretamente no código do front-end. | F | A chave ficaria exposta; deve ficar no servidor, em variável de ambiente. |
| api-010 | avançado | O Claude Agent SDK pode se conectar a servidores MCP. | V | Isso estende as ferramentas disponíveis ao agente. |

**Categoria `boas-praticas`**

| ID | Nível | Afirmação | R | Explicação |
|---|---|---|---|---|
| bp-001 | iniciante | Descrever objetivo e contexto com clareza no pedido melhora o resultado do Claude Code. | V | Instruções específicas reduzem ambiguidade e retrabalho. |
| bp-002 | iniciante | Os casos de uso do Claude Code se limitam a desenvolvimento de software. | F | Também serve para documentação, análise de dados e automação de tarefas, inclusive por perfis de negócio. |
| bp-003 | iniciante | Não é necessário dar contexto do projeto: o Claude adivinha convenções e regras internas. | F | Contexto explícito, como o CLAUDE.md, é o que ensina o projeto a ele. |
| bp-004 | intermediário | Em tarefas complexas, planejar antes de codar (Plan Mode) costuma dar melhores resultados. | V | Alinhar a abordagem antes de editar evita mudanças na direção errada. |
| bp-005 | intermediário | Dar ao Claude uma forma de verificar o próprio trabalho, como testes e lint, melhora a qualidade. | V | Ele consegue rodar, ver a falha e corrigir sozinho. |
| bp-006 | intermediário | Um CLAUDE.md enxuto e objetivo tende a funcionar melhor do que um extenso com tudo sobre o projeto. | V | Instruções demais diluem as importantes e consomem contexto. |
| bp-007 | intermediário | Sessões muito longas sem `/clear` ou `/compact` não afetam a qualidade, porque o contexto é ilimitado. | F | A janela de contexto é limitada e contexto poluído prejudica as respostas. |
| bp-008 | avançado | `--dangerously-skip-permissions` é recomendado em máquinas pessoais com dados sensíveis. | F | Ele ignora as confirmações; só deve ser usado em ambientes isolados e controlados. |
| bp-009 | avançado | Rodar várias sessões em paralelo com git worktrees é uma prática para tarefas independentes. | V | Cada worktree tem seus arquivos, evitando conflitos entre sessões. |
| bp-010 | avançado | Delegar investigações extensas a subagents ajuda a preservar o contexto da conversa principal. | V | Só o resumo do subagent volta para a sessão principal. |

Com isso o seed soma **50 perguntas**: 15 iniciante, 17 intermediário e 18 avançado.

## 11. Plano de implementação (ordem sugerida)

1. **Setup:** `create-next-app` (TS, Tailwind, App Router, ESLint), Vitest, Playwright, `CLAUDE.md` do projeto.
2. **Dados e lógica pura:** tipos, `questions.json` (seed do §10 e §10.1, com `category`), `shuffle.ts`, `scoring.ts` e montagem da partida 5/5/5 por nível/categoria com complemento (RF02), com testes unitários.
3. **Design tokens e tema:** variáveis de cor do §9.1 no Tailwind, fontes via `next/font`, alternador de tema sem flash, rodapé com aviso de marca.
4. **UI do quiz:** Home, CategoryPicker, QuestionCard, LevelBadge, TimerBar (10 s), transição entre blocos, feedback, tela de resultado (sem ranking).
5. **API de perguntas** e integração com a UI.
6. **Supabase:** `schema.sql`, `/api/scores` (POST/GET), validação Zod, recálculo de pontuação no servidor, rate limit, filtro de apelido.
7. **Ranking:** página `/ranking` com leaderboard global, filtro de categoria e fluxo de salvar apelido ao final da partida.
8. **Acessibilidade, responsividade e polimento visual.**
9. **Testes E2E** (partida completa) e deploy na Vercel + Supabase conforme o §8.8 (projetos de produção e desenvolvimento, variáveis por ambiente, schema aplicado, região alinhada).

## 12. Critérios de aceite da v1

- [ ] Concluo uma partida completa de 15 perguntas, todas Verdadeiro ou Falso, na ordem 5 iniciante → 5 intermediário → 5 avançado.
- [ ] Posso filtrar por cada uma das 4 categorias e o selo de categoria aparece nas perguntas.
- [ ] O resultado mostra o desempenho por categoria.
- [ ] Timer de 10 s funciona e o timeout conta como erro.
- [ ] Toda pergunta mostra explicação e link de fonte.
- [ ] Pontuação segue a fórmula do RF05 e é recalculada no servidor.
- [ ] Ao final da partida salvo meu apelido e apareço no leaderboard (filtro de categoria correto), ordenado por pontuação e desempate por tempo.
- [ ] Apelido inválido e excesso de submissões são rejeitados.
- [ ] Funciona em mobile (360 px) e com navegação apenas por teclado.
- [ ] Testes unitários e E2E passam; nenhum segredo exposto no cliente.
- [ ] App publicado na Vercel, usando o Supabase de produção, com variáveis configuradas por ambiente.
- [ ] Se o Supabase estiver indisponível, o quiz continua jogável e o ranking mostra mensagem amigável.

## 13. Riscos e pontos em aberto

- **Perguntas desatualizadas:** o produto muda rápido → campo `sourceUrl` e revisão periódica; considerar campo `reviewedAt`.
- **Fraude no ranking:** mitigada por recálculo no servidor e rate limit, mas não eliminada (sem login). Aceitável para a v1.
- **Tamanho do banco:** cada partida usa 5 perguntas por nível; com poucas perguntas por nível, as partidas se repetem muito. Ampliar para 15–20 por nível (e para a meta de 10 por nível × categoria) antes do lançamento.
- **Futuro:** i18n, login opcional, modo "desafio diário", painel admin, exportar certificado de resultado.
