import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Story {
  id: string;
  player_id: string;
  title: string;
  content: string;
  created_at: string;
  like_count: number;
  emotion?: string;
}

export interface Player {
  id: string;
  name: string;
  slug: string;
  story_count: number;
  total_likes: number;
  image_url?: string;
  description?: string;
  country?: string;
}

export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('id, name, slug, image_url, description, country')
    .order('name');

  if (error) throw new Error(error.message);
  return data as Player[];
}

export async function getPlayerEngagement() {
  const { data, error } = await supabase
    .from('players')
    .select('id');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getStoryCountsByPlayer(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('stories')
    .select('player_id');

  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.player_id] = (counts[row.player_id] || 0) + 1;
  }
  return counts;
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('id, name, slug, image_url, description, country')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Player;
}

export async function getStories() {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      players (
        id,
        name,
        slug,
        image_url,
        country
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);
  return data;
}

export async function getStoriesByPlayer(playerId: string) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getTopStories() {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('like_count', { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);
  return data;
}

export async function getPlayerBattleStats() {
  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      player_id,
      like_count,
      players(name, country)
    `);

  if (error) throw new Error(error.message);

  const stats: Record<string, { total_likes: number; name: string; country: string | null }> = {}; 
  for (const story of stories ?? []) {
    const playerName = (story.players as any)?.name || story.player_id;
    const playerCountry = (story.players as any)?.country || 'India';
    stats[playerName] = stats[playerName] || { total_likes: 0, name: playerName, country: playerCountry };
    stats[playerName].total_likes += story.like_count;
  }

  return Object.values(stats)
    .sort((a, b) => b.total_likes - a.total_likes)
    .slice(0, 3);
}

export async function addStory({
  player_id,
  fan_name,
  country,
  content,
  fan_image_url,
  emotion,
}: {
  player_id: string;
  fan_name: string;
  country: string;
  content: string;
  fan_image_url?: string;
  emotion?: string;
}) {
  const { data, error } = await supabase
    .from('stories')
    .insert({
      player_id,
      fan_name,
      country,
      content,
      fan_image_url: fan_image_url || null,
      emotion: emotion || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function addStoryBySlug(
  slug: string, 
  content: string, 
  fan_name: string,
  country: string = '',
  fan_image_url: string = '',
  emotion?: string
) {
  const { data: players } = await supabase
    .from('players')
    .select('*');

  const player = players?.find(
    p => p.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') === slug
  );

  if (!player) throw new Error('Player not found');

  return addStory({ player_id: player.id, content, fan_name, country, fan_image_url, emotion });
}

export async function uploadFanImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0,8)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('story-images')
    .upload(fileName, file);

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from('story-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function toggleStoryLike(storyId: string, currentLikeCount: number, isCurrentlyLiked: boolean): Promise<number> {
  const delta = isCurrentlyLiked ? -1 : 1;
  const { data, error } = await supabase
    .from('stories')
    .update({ like_count: (currentLikeCount || 0) + delta })
    .eq('id', storyId)
    .select('like_count')
    .single();

  if (error) throw new Error(`Failed to toggle like: ${error.message}`);
  return data.like_count;
}

// Legacy
export async function likeStory(id: string) {
  throw new Error('Use toggleStoryLike instead');
}

// Fan Battle
export async function getTrendingVsRisingBattle(): Promise<Player[]> {
  // Get players with full data including story counts
  const { data: playersData, error } = await supabase
    .from('players')
    .select('*');

  if (error) throw new Error(error.message);

  const players = (playersData || []) as Player[];
  
  if (players.length < 2) {
    return players.slice(0, 2);
  }

  // Filter players with at least one story
  const playersWithStories = players.filter(p => p.story_count > 0);
  
  if (playersWithStories.length < 2) {
    // Fallback to any 2 players if not enough have stories
    return players.slice(0, 2);
  }

  // 1. Trending anchor: player with most engagement (highest story_count)
  const trending = playersWithStories.reduce((prev, current) =>
    current.story_count > prev.story_count ? current : prev
  );

  // 2. Daily challenger rotation: deterministic by day.
  // This ensures matchup changes every day while staying stable for that day.
  const candidates = playersWithStories
    .filter(p => p.id !== trending.id)
    .sort((a, b) => a.id.localeCompare(b.id));

  if (candidates.length === 0) {
    return [trending, playersWithStories[0]];
  }

  const startOfYear = new Date(new Date().getFullYear(), 0, 0);
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const challenger = candidates[dayOfYear % candidates.length];

  return [trending, challenger];
}

export async function getBattlePlayers(): Promise<Player[]> {
  return getTrendingVsRisingBattle();
}

export async function getBattleVotes(): Promise<Record<string, number>> {
  console.log('Fetching today battle votes...')
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('daily_votes')
    .select('player_id, votes_count')
    .eq('vote_date', today)

  if (!error) {
    const votes: Record<string, number> = {}
    for (const row of data ?? []) {
      votes[row.player_id] = row.votes_count
    }
    return votes
  }

  // Fallback for old schemas where daily_votes table does not exist yet.
  const { data: legacyData, error: legacyError } = await supabase
    .from('battles')
    .select('player_id, votes')

  if (legacyError && legacyError.message.includes('Could not find the table')) {
    return {}
  }

  if (legacyError) throw new Error(legacyError.message)

  const votes: Record<string, number> = {}
  for (const row of legacyData ?? []) {
    votes[row.player_id] = row.votes
  }
  return votes
}

// Habit Loop System

// Get or create a unique user ID (device-based)
function getUserId(): string {
  const storageKey = 'fan-hall-user-id';
  let userId = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, userId);
    }
  }
  
  return userId;
}

// Get user's current streak
export async function getUserStreak(): Promise<{ streak_count: number; last_vote_date: string | null }> {
  try {
    const userId = getUserId();
    
    const { data, error } = await supabase
      .from('user_streaks')
      .select('streak_count, last_vote_date')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No record found - new user
      return { streak_count: 0, last_vote_date: null };
    }
    
    if (error) {
      // Silently return default if table doesn't exist or other error
      console.debug('Streak table not available:', error?.code);
      return { streak_count: 0, last_vote_date: null };
    }
    
    return data || { streak_count: 0, last_vote_date: null };
  } catch (err) {
    console.debug('Streak fetch exception:', err);
    return { streak_count: 0, last_vote_date: null };
  }
}

// Update user streak on vote
export async function updateUserStreak(): Promise<{ streak_count: number; updated: boolean }> {
  const userId = getUserId();
  
  try {
    const { data, error } = await supabase.rpc('update_user_streak', { 
      p_user_id: userId 
    });
    
    if (error) {
      console.debug('Streak RPC not available:', error?.code);
      return { streak_count: 1, updated: false };
    }
    
    return { 
      streak_count: data?.streak_count || 1, 
      updated: true 
    };
  } catch (err) {
    console.debug('Streak update exception:', err);
    return { streak_count: 1, updated: false };
  }
}

export async function hasUserVotedToday(): Promise<boolean> {
  const userId = getUserId();
  const today = new Date().toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('vote_history')
      .select('id')
      .eq('user_id', userId)
      .eq('vote_date', today)
      .limit(1);

    if (error) {
      return false;
    }

    return Boolean(data && data.length > 0);
  } catch {
    return false;
  }
}

// Record vote and get vote result
export interface VoteResult {
  streak_count: number;
  daily_vote_count: number;
  leading_votes: number;
  current_player_name: string;
  leader_name: string;
  margin: number;
}

export async function recordVote(playerId: string, playerName: string): Promise<VoteResult> {
  const userId = getUserId();
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const alreadyVoted = await hasUserVotedToday();
    if (alreadyVoted) {
      throw new Error('ALREADY_VOTED_TODAY');
    }

    // Increment daily votes
    await supabase.rpc('increment_daily_votes', { p_player_id: playerId });
    
    // Update streak
    const streakData = await supabase.rpc('update_user_streak', { p_user_id: userId });
    
    // Record vote history (for audit and streak verification)
    try {
      await supabase.from('vote_history').insert({
        user_id: userId,
        player_id: playerId,
        vote_date: today
      });
    } catch (historyError) {
      console.debug('Vote history insert failed (non-critical):', historyError);
    }
    
    // Get today's leaderboard
    const { data: leaderboard, error: leaderError } = await supabase.rpc('get_today_leaderboard');
    
    if (leaderError) {
      console.debug('Leaderboard not available for result:', leaderError?.code);
    }
    
    // Find this player's vote count and the leader
    const todaysVotes = leaderboard || [];
    const playerVotes = todaysVotes.find((v: any) => v.player_id === playerId)?.votes_count || 0;
    const leader = todaysVotes[0] || { player_id: playerId, votes_count: playerVotes };
    const leaderVotes = leader.votes_count || 0;
    const margin = playerVotes - leaderVotes;
    
    // Get leader's name (or use player_id as fallback)
    let leaderName = leader.player_id;
    if (leader.player_id !== playerId) {
      const leaderPlayer = await getPlayerById(leader.player_id);
      if (leaderPlayer) leaderName = leaderPlayer.name;
    } else {
      leaderName = playerName;
    }
    
    return {
      streak_count: streakData?.streak_count || 1,
      daily_vote_count: playerVotes,
      leading_votes: leaderVotes,
      current_player_name: playerName,
      leader_name: leaderName,
      margin,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'ALREADY_VOTED_TODAY') {
      throw error;
    }

    console.debug('Vote recording exception:', error);
    return {
      streak_count: 1,
      daily_vote_count: 1,
      leading_votes: 1,
      current_player_name: playerName,
      leader_name: playerName,
      margin: 0,
    };
  }
}

// Get today's leaderboard
export async function getTodayLeaderboard(): Promise<Array<{ player_name: string; votes_count: number; player_id: string }>> {
  try {
    const { data: leaderboard, error } = await supabase.rpc('get_today_leaderboard');
    
    if (error) {
      console.debug('Leaderboard RPC not available:', error?.code);
      return [];
    }
    
    // Enrich with player names
    const enriched = await Promise.all(
      (leaderboard || []).map(async (entry: any) => {
        const player = await getPlayerById(entry.player_id);
        return {
          player_id: entry.player_id,
          player_name: player?.name || entry.player_id,
          votes_count: entry.votes_count,
        };
      })
    );
    
    return enriched.sort((a, b) => b.votes_count - a.votes_count);
  } catch (error) {
    console.debug('Leaderboard fetch exception:', error);
    return [];
  }
}

// Helper: Get player by ID (not from API, from DB directly)
async function getPlayerById(playerId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();
  
  if (error || !data) return null;
  return data as Player;
}

export async function voteBattle(playerId: string, playerName: string): Promise<VoteResult> {
  console.log('Voting for:', playerId)
  
  // Record vote and get result
  const result = await recordVote(playerId, playerName);
  
  // Also update legacy battles table for backward compatibility
  try {
    const { data, error } = await supabase.rpc('increment_votes', { p_player_id: playerId })
    if (error) console.debug('Legacy vote RPC:', error?.code)
  } catch (rpcError) {
    console.debug('Legacy vote RPC failed:', rpcError)
    try {
      const { error: upsertError } = await supabase
        .from('battles')
        .upsert({ player_id: playerId, votes: 1 }, { 
          onConflict: 'player_id',
          ignoreDuplicates: false
        })
      
      if (upsertError) console.debug('Legacy vote upsert failed:', upsertError?.code)
    } catch (e) {
      console.debug('Legacy vote fallback exception:', e)
    }
  }
  
  return result;
}
