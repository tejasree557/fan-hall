-- SAFE: Copy ALL → Supabase SQL Editor → RUN

-- 1. Create stories table if missing
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL,
  fan_name text NOT NULL,
  country text NOT NULL,
  content text NOT NULL,
  fan_image_url text,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. Player slug fix (safe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'slug') THEN
    ALTER TABLE players ADD COLUMN slug text UNIQUE;
    UPDATE players SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
END $$;

-- 3. Fix player_id type (if needed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
             WHERE table_name = 'stories' AND column_name = 'player_id') THEN
    ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_player_id_fkey;
    ALTER TABLE stories ALTER COLUMN player_id TYPE text;
  END IF;
END $$;

-- SUCCESS: Tables ready for Fan Hall!
-- Test: localhost:3000/write/smriti-mandhana → submit story
