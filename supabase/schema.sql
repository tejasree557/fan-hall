create extension if not exists "pgcrypto";

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  description text not null
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  fan_name text not null,
  country text not null,
  content text not null,
  like_count int not null default 0,
  created_at timestamp with time zone not null default now()
);
