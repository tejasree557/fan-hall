-- Run this in Supabase SQL Editor to fix player_id error

-- 1. Drop FK constraint
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_player_id_fkey;

-- 2. Change player_id to text (accepts slugs)
ALTER TABLE stories ALTER COLUMN player_id TYPE text;

-- 3. Clean players table (use slug as primary key)
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_pkey;
ALTER TABLE players ADD COLUMN slug text UNIQUE;
UPDATE players SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));
ALTER TABLE players ADD PRIMARY KEY (slug);

-- Test: Story submission now works with /write/mithali-raj → player_id = "mithali-raj"

-- Fan Hall Like System: Keep like_count (all code uses this column name)
-- Do NOT rename to likes - code uses like_count everywhere
-- Ensure like_count exists
ALTER TABLE IF EXISTS stories ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;
