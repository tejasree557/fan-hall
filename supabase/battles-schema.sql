-- Fan Battle Voting System
-- Run this in Supabase SQL Editor

create extension if not exists "uuid-ossp";

create table if not exists public.battles (
  id uuid primary key default uuid_generate_v4(),
  player_id text not null,
  votes int default 0,
  created_at timestamp with time zone default now()
);

-- Index for performance
create index if not exists battles_player_id_idx on battles(player_id);

-- Optional: Reset votes daily (run manually or cron)
-- DELETE FROM battles WHERE created_at < NOW() - INTERVAL '24 hours';
