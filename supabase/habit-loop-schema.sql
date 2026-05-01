-- Habit Loop System
-- Run this in Supabase SQL Editor

-- User Streaks: Track consecutive voting days
create table if not exists public.user_streaks (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null unique, -- device/browser ID
  streak_count int default 1,
  last_vote_date date not null,
  updated_at timestamp with time zone default now()
);

-- Daily Votes: Track votes per player per day
create table if not exists public.daily_votes (
  id uuid primary key default uuid_generate_v4(),
  vote_date date not null,
  player_id text not null,
  votes_count int default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(vote_date, player_id)
);

-- Vote History: Track individual votes with user & timestamp
create table if not exists public.vote_history (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  player_id text not null,
  vote_date date not null,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists user_streaks_user_id_idx on public.user_streaks(user_id);
create index if not exists daily_votes_vote_date_idx on public.daily_votes(vote_date);
create index if not exists daily_votes_player_id_idx on public.daily_votes(player_id);
create index if not exists vote_history_user_id_idx on public.vote_history(user_id);
create index if not exists vote_history_vote_date_idx on public.vote_history(vote_date);

-- RPC Function: Increment daily votes for a player
create or replace function public.increment_daily_votes(p_player_id text)
returns void as $$
declare
  today date := current_date;
begin
  insert into public.daily_votes (vote_date, player_id, votes_count)
  values (today, p_player_id, 1)
  on conflict (vote_date, player_id)
  do update set votes_count = daily_votes.votes_count + 1, updated_at = now();
end;
$$ language plpgsql;

-- RPC Function: Update or create streak
create or replace function public.update_user_streak(p_user_id text)
returns json as $$
declare
  yesterday date := current_date - interval '1 day';
  today date := current_date;
  last_vote date;
  new_streak int;
  result json;
begin
  -- Get last vote date for this user
  select last_vote_date into last_vote from public.user_streaks where user_id = p_user_id;
  
  -- Calculate new streak
  if last_vote is null then
    new_streak := 1;
  elsif last_vote = yesterday then
    new_streak := (select streak_count from public.user_streaks where user_id = p_user_id) + 1;
  elsif last_vote = today then
    new_streak := (select streak_count from public.user_streaks where user_id = p_user_id);
  else
    new_streak := 1;
  end if;
  
  -- Upsert streak record
  insert into public.user_streaks (user_id, streak_count, last_vote_date, updated_at)
  values (p_user_id, new_streak, today, now())
  on conflict (user_id)
  do update set 
    streak_count = new_streak, 
    last_vote_date = today,
    updated_at = now();
  
  -- Return result
  select json_build_object(
    'streak_count', new_streak,
    'last_vote_date', today
  ) into result;
  
  return result;
end;
$$ language plpgsql;

-- Ensure Row Level Security is enabled on the table
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RPC Function: Get today's leaderboard
create or replace function public.get_today_leaderboard()
returns table(player_id text, votes_count int) as $$
begin
  return query
  select daily_votes.player_id, daily_votes.votes_count
  from public.daily_votes
  where daily_votes.vote_date = current_date
  order by daily_votes.votes_count desc;
end;
$$ language plpgsql;
