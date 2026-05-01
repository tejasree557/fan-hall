-- Supabase RLS Policy Fix for Stories (Copy → SQL Editor → RUN)

-- 1. Enable RLS if not enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- 2. INSERT: Anyone can add stories
CREATE POLICY "Public story inserts" ON stories FOR INSERT WITH CHECK (true);

-- 3. SELECT: Public read access
CREATE POLICY "Public story reads" ON stories FOR SELECT USING (true);

-- 4. UPDATE: Anyone can update likes
CREATE POLICY "Public like updates" ON stories FOR UPDATE USING (true) WITH CHECK (true);

-- Test: Story submission + likes work!
-- localhost:3000/write/player → submit → /stories → ❤️ works

