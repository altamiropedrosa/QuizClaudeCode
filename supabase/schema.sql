-- Quiz Claude Code: ranking table (PRD §8.4).
-- Apply via the Supabase SQL Editor or `supabase db push`. Keep future changes in versioned files.

create table if not exists scores (
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

-- Leaderboard ordering: score desc, tie-break by lower total time.
create index if not exists scores_rank on scores (category, score desc, total_time_ms asc);

-- Rate limit lookup: submissions per ip_hash in the last hour.
create index if not exists scores_ip_recent on scores (ip_hash, created_at desc);

alter table scores enable row level security;
-- No public policies: reads and writes only through the service role on the server.

-- Explicit grants (newer projects may not auto-grant Data API access to new tables).
revoke all on table scores from anon, authenticated;
grant select, insert on table scores to service_role;
