-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL → New Query)

-- Fan Hall Like System: Keep like_count (all code uses this column name)
-- Do NOT rename to likes - code uses like_count everywhere


-- Fix player_id to text (for slugs)
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_player_id_fkey;
ALTER TABLE stories ALTER COLUMN player_id TYPE text;

-- Fix players table slug PK
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_pkey;
ALTER TABLE players ADD COLUMN slug text UNIQUE;
UPDATE players SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));
ALTER TABLE players ADD PRIMARY KEY (slug);

-- Test: Story submission works with /write/player-slug
