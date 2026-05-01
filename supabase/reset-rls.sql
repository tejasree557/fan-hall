-- Supabase RLS Complete Reset (DROP ALL → RE-CREATE)

-- 1. Disable RLS + drop policies
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public story inserts" ON stories;
DROP POLICY IF EXISTS "Public story reads" ON stories;
DROP POLICY IF EXISTS "Public like updates" ON stories;

-- 2. Re-enable + new policies
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON stories
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON stories
  FOR SELECT TO public USING (true);

CREATE POLICY "Enable update likes for all" ON stories
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 3. Verify
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'stories';

-- SUCCESS: Stories INSERT/UPDATE/READ open for public!

