'use client'

import { useState, useEffect } from 'react'
import { Heart, Zap, Flame, TrendingUp, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getBattleVotes, voteBattle, getTrendingVsRisingBattle, getUserStreak, getTodayLeaderboard, hasUserVotedToday, type VoteResult } from '@/lib/api'

interface Player {
  id: string
  name: string
  image_url: string
  slug: string
  country?: string
}

interface LeaderboardEntry {
  player_id: string
  player_name: string
  votes_count: number
}

// Fallback players so UI never shows empty state
const fallbackPlayers: Player[] = [
  { id: 'demo-smriti', name: 'Smriti Mandhana', image_url: '/images/player-smriti.jpg', slug: 'smriti-mandhana', country: 'India' },
  { id: 'demo-harmanpreet', name: 'Harmanpreet Kaur', image_url: '/images/player-harmanpreet.jpg', slug: 'harmanpreet-kaur', country: 'India' },
]

export function FanBattleSection() {
  const [battlePlayers, setBattlePlayers] = useState<Player[]>([])
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [votedToday, setVotedToday] = useState(false)
  const [votingPlayer, setVotingPlayer] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [timeUntilReset, setTimeUntilReset] = useState('00:00:00')

  useEffect(() => {
    const fetchBattlePlayers = async () => {
      try {
        console.log('Fetching trending vs rising players...')
        const trendingVsRising = await getTrendingVsRisingBattle()
        console.log('Battle players (Trending vs Rising):', trendingVsRising)
        const players = (trendingVsRising || []) as Player[]
        if (players.length >= 2) {
          setBattlePlayers(players)
        } else {
          setBattlePlayers(fallbackPlayers)
        }
      } catch (error) {
        console.error('Battle players error:', error)
        setBattlePlayers(fallbackPlayers)
      } finally {
        setLoading(false)
      }
    }

    fetchBattlePlayers()
  }, [])

  useEffect(() => {
    const updateTimeUntilReset = () => {
      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 0, 0)
      const diff = Math.max(0, nextMidnight.getTime() - now.getTime())
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      const formatted = [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':')
      setTimeUntilReset(formatted)
    }

    updateTimeUntilReset()
    const timer = setInterval(updateTimeUntilReset, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const streakData = await getUserStreak()
        setStreak(streakData.streak_count)
      } catch (error) {
        console.error('Streak error:', error)
        setStreak(0)
      }
    }

    fetchStreak()
  }, [])

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const votesData = await getBattleVotes()
        console.log('Votes:', votesData)
        setVotes(votesData)
        
        const leaderboardData = await getTodayLeaderboard()
        setLeaderboard(leaderboardData)
      } catch (error) {
        console.error('Votes error:', error)
        setVotes({})
      }
    }

    fetchVotes()
  }, [])

  useEffect(() => {
    const hydrateVotedState = async () => {
      const today = new Date().toDateString()
      const voted = localStorage.getItem('battle-voted')
      const localVoted = voted === today
      const dbVoted = await hasUserVotedToday()
      setVotedToday(localVoted || dbVoted)
      if (dbVoted) {
        localStorage.setItem('battle-voted', today)
      }
    }

    hydrateVotedState()
  }, [])

  const handleVote = async (playerId: string, playerName: string) => {
    if (votedToday || votingPlayer) return

    const today = new Date().toDateString()
    localStorage.setItem('battle-voted', today)
    setVotedToday(true)
    setVotingPlayer(playerId)

    try {
      const result = await voteBattle(playerId, playerName)
      setVoteResult(result)
      setStreak(result.streak_count)
      
      const votesData = await getBattleVotes()
      setVotes(votesData)
      
      const leaderboardData = await getTodayLeaderboard()
      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error('Vote error:', error)
      if (error instanceof Error && error.message.includes('ALREADY_VOTED_TODAY')) {
        setVotedToday(true)
      } else {
        localStorage.removeItem('battle-voted')
        setVotedToday(false)
      }
      setVotingPlayer(null)
    }
  }

  const winnerEntry = Object.entries(votes).reduce<[string, number]>(
    (best, current) => (current[1] > best[1] ? [current[0], current[1]] : best),
    ['', -1]
  )
  const winnerPlayer = battlePlayers.find(p => p.id === winnerEntry[0])
  
  const todayWinner = leaderboard[0]

  console.log('Render - battlePlayers:', battlePlayers.length, battlePlayers)
  console.log('Render - votes:', votes)

  return (
    <section className="py-20 bg-gradient-to-b from-orange-500/5 to-red-500/5">
      <div className="max-w-4xl mx-auto px-4">
        {/* Streak Display */}
        {streak > 0 && !voteResult && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-400/50">
              <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
              <span className="text-2xl font-black text-orange-300">{streak} Day Streak</span>
              <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
            </div>
            {streak >= 3 && (
              <p className="text-sm text-orange-400/80 mt-2 font-medium">🔥 You are on fire! Keep it going!</p>
            )}
          </div>
        )}

        {/* Vote Result Screen */}
        {voteResult && votedToday && (
          <div className="max-w-2xl mx-auto mb-16 p-12 bg-gradient-to-b from-green-500/10 to-cyan-500/10 rounded-3xl border-2 border-green-400/50 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="text-6xl animate-bounce">✨</div>
              <h3 className="text-4xl font-black text-green-300">
                You voted for {voteResult.current_player_name}! 🔥
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-black/40 rounded-2xl border border-cyan-400/30">
                  <div className="text-sm text-gray-400 mb-2">Your Votes</div>
                  <div className="text-3xl font-black text-cyan-300">{voteResult.daily_vote_count}</div>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-orange-400/30">
                  <div className="text-sm text-gray-400 mb-2">Your Streak</div>
                  <div className="text-3xl font-black text-orange-300">🔥 {voteResult.streak_count}</div>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-pink-400/30">
                  <div className="text-sm text-gray-400 mb-2">{voteResult.margin < 0 ? 'Trailing By' : 'Leading By'}</div>
                  <div className="text-3xl font-black text-pink-300">{voteResult.margin > 0 ? `+${voteResult.margin}` : voteResult.margin === 0 ? 'Tied' : `-${Math.abs(voteResult.margin)}`}</div>
                </div>
              </div>

              {voteResult.margin === 0 && (
                <p className="text-cyan-300 font-bold text-lg">
                  🎯 {voteResult.current_player_name} is tied with {voteResult.leader_name}!
                </p>
              )}
              {voteResult.margin > 0 && (
                <p className="text-green-300 font-bold text-lg">
                  ✅ {voteResult.current_player_name} is leading by {voteResult.margin} votes!
                </p>
              )}
              {voteResult.margin < 0 && voteResult.leader_name !== voteResult.current_player_name && (
                <p className="text-orange-300 font-bold text-lg">
                  🎯 {voteResult.leader_name} is ahead, but {voteResult.current_player_name} is gaining momentum!
                </p>
              )}

              <p className="text-gray-300 text-lg mt-8">
                💫 Come back tomorrow to continue your streak!
              </p>
            </div>
          </div>
        )}

        {(!loading && battlePlayers.length < 2) ? (
          <div className="text-center py-20 animate-pulse">
            <p className="text-gray-400 text-xl mb-4">⚡ Preparing today's battle...</p>
            <p className="text-sm text-gray-500">No players found - check Supabase</p>
          </div>
        ) : battlePlayers.length === 2 && !voteResult ? (
          <div className="space-y-8">
            {todayWinner && (
              <div className="text-center p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/40 rounded-3xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-6 h-6 text-yellow-300" />
                  <span className="text-2xl font-black text-yellow-200">Today&apos;s Winner</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {todayWinner.player_name} ({todayWinner.votes_count} votes)
                </p>
              </div>
            )}

            {/* Score */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-3xl font-black text-white bg-black/30 px-8 py-4 rounded-full">
                <span className="text-cyan-400">
                  {votes[battlePlayers[0]?.id] || 0}
                </span>
                vs
                <span className="text-orange-400">
                  {votes[battlePlayers[1]?.id] || 0}
                </span>
              </div>
              {winnerPlayer && (
                <p className="text-cyan-400 font-bold mt-2 text-lg">
                  🔥 {winnerPlayer.name} is leading!
                </p>
              )}
            </div>

            {/* Head-to-head */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {battlePlayers.map((player, index) => {
const isWinner = player.id === winnerEntry[0]
const playerVotes = votes[player.id] || 0
const isVoting = votingPlayer === player.id
const isTrending = index === 0

return (
  <div
    key={player.id}
    onClick={() => handleVote(player.id, player.name)}
    className={cn(
      "group relative cursor-pointer p-8 rounded-3xl border-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25",
      votedToday || isVoting 
        ? "cursor-not-allowed opacity-60" 
        : "hover:border-orange-400 border-transparent hover:shadow-orange-500/50",
      isWinner ? "border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.6)] bg-gradient-to-b from-cyan-500/10" : "bg-zinc-900/50 border-white/10"
    )}
  >
    {/* Status Badge */}
    <div className={cn(
      "absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold",
      isWinner ? "bg-cyan-500 text-black shadow-lg" : isTrending ? "bg-orange-500 text-white" : "bg-cyan-600 text-white"
    )}>
      {isWinner ? "👑 WINNING" : isTrending ? "🔥 LEGEND" : "⭐ RISING STAR"}
    </div>

    {/* Player Card */}
    <div className="text-center space-y-4">
      <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-orange-500/40 transition-shadow">
        <img 
          src={player.image_url || '/placeholder-user.jpg'} 
          alt={player.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <h3 className="text-2xl font-black text-white capitalize">
        {player.name}
      </h3>
      {player.country && (
        <p className="text-xs text-gray-400">
          {player.country}
        </p>
      )}
      <div className="flex items-center justify-center gap-2 text-lg font-bold">
        <Heart className="w-5 h-5 fill-current text-red-400" />
        <span className="text-2xl">
          {playerVotes}
        </span>
      </div>
      {votedToday && !isVoting && (
        <p className="text-sm text-gray-400">
          Voted today
        </p>
      )}
      {isVoting && (
        <p className="text-cyan-400 font-bold animate-pulse">
          Vote counted! 💙
        </p>
      )}
    </div>
  </div>
)
})}
            </div>

            {/* Today's Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="mt-16 max-w-2xl mx-auto p-8 bg-gradient-to-b from-purple-500/10 to-pink-500/10 rounded-3xl border border-purple-400/30">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  <h3 className="text-2xl font-black text-white">Today's Leaderboard</h3>
                </div>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry, idx: number) => (
                    <div key={entry.player_id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-purple-400/20">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-purple-400 w-8">{idx + 1}</span>
                        <span className="font-bold text-white">{entry.player_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="font-black text-cyan-300">{entry.votes_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {votedToday && !voteResult && (
              <div className="text-center mt-12 p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl border border-cyan-400/30">
                <p className="text-xl text-white mb-4">
                  Come back tomorrow to vote again! ⏰
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                  <Zap className="w-4 h-4" />
                  Next battle in {timeUntilReset}
                </div>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="text-center py-20 animate-pulse">
            <p className="text-gray-400 text-xl mb-4">⚡ Preparing today's battle...</p>
            <p className="text-sm text-gray-500">Picking 2 players to fight for your love ❤️</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">⚔️ No players for battle</p>
            <p className="text-sm text-gray-500">Players table empty - seed data needed</p>
          </div>
        )}
      </div>
    </section>
  )
}

