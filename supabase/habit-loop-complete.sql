-- =============================================================================
-- HABIT LOOP COMPLETE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- This sets up: likes, streaks, daily votes, leaderboards, battles
-- =============================================================================

-- =============================================================================
-- 1. STORIES TABLE (Keep like_count - matches all code)
-- =============================================================================

-- Ensure stories table has like_count column (not likes)
DO $$
BEGIN
  -- If likes column exists but like_count doesn't, rename it back
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'likes'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'like_count'
  ) THEN
    ALTER TABLE stories RENAME COLUMN likes TO like_count;
  END IF;
  
  -- If neither exists, add like_count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'like_count'
  ) THEN
    ALTER TABLE stories ADD COLUMN like_count integer DEFAULT 0;
  END IF;
END $$;

-- Fix any NULL like_count values
UPDATE stories SET like_count = COALESCE(like_count, 0);

-- RLS for stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for all users" ON stories;
DROP POLICY IF EXISTS "Enable read access for all users" ON stories;
DROP POLICY IF EXISTS "Enable update likes for all" ON stories;

CREATE POLICY "Enable insert for all users" ON stories
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON stories
  FOR SELECT TO public USING (true);

CREATE POLICY "Enable update likes for all" ON stories
  FOR UPDATE TO public USING (true) WITH CHECK (true);


-- =============================================================================
-- 2. BATTLES TABLE (Legacy - for backward compatibility)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.battles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id text NOT NULL,
  votes int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(player_id)
);

CREATE INDEX IF NOT EXISTS battles_player_id_idx ON battles(player_id);

-- RLS for battles
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public battles read" ON battles;
DROP POLICY IF EXISTS "Public battles insert" ON battles;
DROP POLICY IF EXISTS "Public battles update" ON battles;

CREATE POLICY "Public battles read" ON battles
  FOR SELECT TO public USING (true);

CREATE POLICY "Public battles insert" ON battles
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public battles update" ON battles
  FOR UPDATE TO public USING (true) WITH CHECK (true);


-- =============================================================================
-- 3. USER STREAKS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL UNIQUE,
  streak_count int DEFAULT 1,
  last_vote_date date NOT NULL DEFAULT CURRENT_DATE,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_streaks_user_id_idx ON public.user_streaks(user_id);

-- RLS for user_streaks
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public streaks read" ON user_streaks;
DROP POLICY IF EXISTS "Public streaks insert" ON user_streaks;
DROP POLICY IF EXISTS "Public streaks update" ON user_streaks;

CREATE POLICY "Public streaks read" ON user_streaks
  FOR SELECT TO public USING (true);

CREATE POLICY "Public streaks insert" ON user_streaks
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public streaks update" ON user_streaks
  FOR UPDATE TO public USING (true) WITH CHECK (true);


-- =============================================================================
-- 4. DAILY VOTES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.daily_votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_date date NOT NULL DEFAULT CURRENT_DATE,
  player_id text NOT NULL,
  votes_count int DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(vote_date, player_id)
);

CREATE INDEX IF NOT EXISTS daily_votes_vote_date_idx ON public.daily_votes(vote_date);
CREATE INDEX IF NOT EXISTS daily_votes_player_id_idx ON public.daily_votes(player_id);

-- RLS for daily_votes
ALTER TABLE daily_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public daily_votes read" ON daily_votes;
DROP POLICY IF EXISTS "Public daily_votes insert" ON daily_votes;
DROP POLICY IF EXISTS "Public daily_votes update" ON daily_votes;

CREATE POLICY "Public daily_votes read" ON daily_votes
  FOR SELECT TO public USING (true);

CREATE POLICY "Public daily_votes insert" ON daily_votes
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public daily_votes update" ON daily_votes
  FOR UPDATE TO public USING (true) WITH CHECK (true);


-- =============================================================================
-- 5. VOTE HISTORY TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.vote_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  player_id text NOT NULL,
  vote_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enforce one vote per user per day at DB-level.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'vote_history_user_id_vote_date_key'
      AND conrelid = 'public.vote_history'::regclass
  ) THEN
    ALTER TABLE public.vote_history
      ADD CONSTRAINT vote_history_user_id_vote_date_key UNIQUE (user_id, vote_date);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS vote_history_user_id_idx ON public.vote_history(user_id);
CREATE INDEX IF NOT EXISTS vote_history_vote_date_idx ON public.vote_history(vote_date);
CREATE INDEX IF NOT EXISTS vote_history_player_id_idx ON public.vote_history(player_id);

-- RLS for vote_history
ALTER TABLE vote_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public vote_history read" ON vote_history;
DROP POLICY IF EXISTS "Public vote_history insert" ON vote_history;

CREATE POLICY "Public vote_history read" ON vote_history
  FOR SELECT TO public USING (true);

CREATE POLICY "Public vote_history insert" ON vote_history
  FOR INSERT TO public WITH CHECK (true);


-- =============================================================================
-- 6. RPC FUNCTIONS
-- =============================================================================

-- Function: Increment daily votes for a player
DROP FUNCTION IF EXISTS public.increment_daily_votes(text);

CREATE OR REPLACE FUNCTION public.increment_daily_votes(p_player_id text)
RETURNS void AS $$
DECLARE
  today date := CURRENT_DATE;
BEGIN
  INSERT INTO public.daily_votes (vote_date, player_id, votes_count)
  VALUES (today, p_player_id, 1)
  ON CONFLICT (vote_date, player_id)
  DO UPDATE SET 
    votes_count = daily_votes.votes_count + 1, 
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Grant execute to public
GRANT EXECUTE ON FUNCTION public.increment_daily_votes(text) TO public;
GRANT EXECUTE ON FUNCTION public.increment_daily_votes(text) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_daily_votes(text) TO authenticated;


-- Function: Update or create user streak
DROP FUNCTION IF EXISTS public.update_user_streak(text);

CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id text)
RETURNS json AS $$
DECLARE
  yesterday date := CURRENT_DATE - interval '1 day';
  today date := CURRENT_DATE;
  last_vote date;
  current_streak int;
  new_streak int;
  result json;
BEGIN
  -- Get last vote date and streak for this user
  SELECT last_vote_date, streak_count 
  INTO last_vote, current_streak
  FROM public.user_streaks 
  WHERE user_id = p_user_id;
  
  -- Calculate new streak
  IF last_vote IS NULL THEN
    new_streak := 1;
  ELSIF last_vote = yesterday THEN
    new_streak := COALESCE(current_streak, 0) + 1;
  ELSIF last_vote = today THEN
    new_streak := COALESCE(current_streak, 1);
  ELSE
    new_streak := 1;
  END IF;
  
  -- Upsert streak record
  INSERT INTO public.user_streaks (user_id, streak_count, last_vote_date, updated_at)
  VALUES (p_user_id, new_streak, today, now())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    streak_count = new_streak, 
    last_vote_date = today,
    updated_at = now();
  
  -- Return result
  SELECT json_build_object(
    'streak_count', new_streak,
    'last_vote_date', today
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.update_user_streak(text) TO public;
GRANT EXECUTE ON FUNCTION public.update_user_streak(text) TO anon;
GRANT EXECUTE ON FUNCTION public.update_user_streak(text) TO authenticated;


-- Function: Get today's leaderboard
DROP FUNCTION IF EXISTS public.get_today_leaderboard();

CREATE OR REPLACE FUNCTION public.get_today_leaderboard()
RETURNS TABLE(player_id text, votes_count int) AS $$
BEGIN
  RETURN QUERY
  SELECT dv.player_id, dv.votes_count
  FROM public.daily_votes dv
  WHERE dv.vote_date = CURRENT_DATE
  ORDER BY dv.votes_count DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.get_today_leaderboard() TO public;
GRANT EXECUTE ON FUNCTION public.get_today_leaderboard() TO anon;
GRANT EXECUTE ON FUNCTION public.get_today_leaderboard() TO authenticated;


-- Function: Increment legacy battle votes
DROP FUNCTION IF EXISTS public.increment_votes(text);

CREATE OR REPLACE FUNCTION public.increment_votes(p_player_id text)
RETURNS int AS $$
DECLARE
  new_votes int;
BEGIN
  INSERT INTO battles (player_id, votes) 
  VALUES (p_player_id, 1)
  ON CONFLICT (player_id) 
  DO UPDATE SET votes = battles.votes + 1
  RETURNING battles.votes INTO new_votes;
  
  RETURN COALESCE(new_votes, 1);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.increment_votes(text) TO public;
GRANT EXECUTE ON FUNCTION public.increment_votes(text) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_votes(text) TO authenticated;


-- =============================================================================
-- 7. VERIFY
-- =============================================================================

SELECT 'Tables created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('stories', 'battles', 'user_streaks', 'daily_votes', 'vote_history');

SELECT 'RLS enabled:' as status;
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('stories', 'battles', 'user_streaks', 'daily_votes', 'vote_history');

SELECT 'Functions created:' as status;
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('increment_daily_votes', 'update_user_streak', 'get_today_leaderboard', 'increment_votes');
