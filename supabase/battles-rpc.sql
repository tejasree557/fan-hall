-- Fan Battle RPC - Run in Supabase SQL Editor after creating battles table

DROP FUNCTION IF EXISTS increment_votes(text);

CREATE OR REPLACE FUNCTION increment_votes(p_player_id text)
RETURNS int AS $$
BEGIN
  INSERT INTO battles (player_id, votes) VALUES (p_player_id, 1)
  ON CONFLICT (player_id) 
  DO UPDATE SET votes = battles.votes + 1
  RETURNING votes;
END;
$$ LANGUAGE plpgsql;
