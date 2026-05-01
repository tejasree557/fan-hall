'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { PlayerCard } from '@/components/player-card'
import { AddPlayerModal } from '@/components/add-player-modal'
import { Button } from '@/components/ui/button'
import { getPlayers, type Player } from '@/lib/api'
import { toSlug } from '@/lib/utils'
import { ArrowRight, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface StoryPreviewRow {
  player_id: string
  content: string
  like_count: number
}

interface PlayerFeedStats {
  storyCount: number
  totalLikes: number
  topStory: string
  previews: string[]
}

const JHULAN_IMAGE_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvU6CG38X_oWSIvL8vgGJTk33sGAaKqZXaHQ&s'
const SMRITI_IMAGE_URL =
  'https://www.infoknocks.com/wp-content/uploads/2025/10/smriti-mandhana.webp'
const HARMANPREET_IMAGE_URL =
  'https://bsmedia.business-standard.com/_media/bs/img/article/2025-09/26/thumb/featurecrop/1200X900/1758884407-7155.jpg'

const EMPTY_PREVIEW: PlayerFeedStats = {
  storyCount: 0,
  totalLikes: 0,
  topStory: 'No stories yet',
  previews: ['No stories yet'],
}

export function PlayersSection() {
  const [players, setPlayers] = useState<Player[]>([]) // Load from DB only
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerFeedStats>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        // Run with a 5s timeout so it never hangs forever
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000)
        )
        const [data, stories] = await Promise.race([
          Promise.all([
            getPlayers(),
            supabase
              .from('stories')
              .select('player_id, content, like_count')
              .returns<StoryPreviewRow[]>(),
          ]),
          timeout,
        ]) as [Player[], { data: StoryPreviewRow[] | null; error: Error | null }]

        if (stories.error) throw stories.error

        const statsMap: Record<string, PlayerFeedStats> = {}
        for (const story of stories.data ?? []) {
          const existing = statsMap[story.player_id] ?? { ...EMPTY_PREVIEW, previews: [] }
          existing.storyCount += 1
          existing.totalLikes += Number(story.like_count || 0)
          existing.previews.push(story.content || '')
          statsMap[story.player_id] = existing
        }

        for (const playerId of Object.keys(statsMap)) {
          const playerStories = (stories.data ?? [])
            .filter((story) => story.player_id === playerId)
            .sort((a, b) => Number(b.like_count || 0) - Number(a.like_count || 0))

          statsMap[playerId] = {
            storyCount: statsMap[playerId].storyCount,
            totalLikes: statsMap[playerId].totalLikes,
            topStory: playerStories[0]?.content || 'No stories yet',
            previews: playerStories.slice(0, 3).map((story) => story.content || 'No stories yet'),
          }
        }

        setPlayerStats(statsMap)

        setPlayers(data.sort((a, b) => a.name.localeCompare(b.name)))

      } catch {
        // Keep showing fallback — no spinner needed
      }
    }

    void loadPlayers()
  }, [])

  const mappedPlayers = useMemo(
    () =>
      players
        .map((player) => ({
          id: player.id,
          name: player.name,
          slug: player.slug ?? toSlug(player.name),
          image:
            player.name.toLowerCase() === 'jhulan goswami'
              ? JHULAN_IMAGE_URL
              : player.name.toLowerCase() === 'smriti mandhana'
                ? SMRITI_IMAGE_URL
                : player.name.toLowerCase() === 'harmanpreet kaur'
                  ? HARMANPREET_IMAGE_URL
                  : player.image_url || '/placeholder.svg',
          country: player.country,
          storyCount: playerStats[player.id]?.storyCount || 0,
          totalLikes: playerStats[player.id]?.totalLikes || 0,
          topStory: playerStats[player.id]?.topStory || 'No stories yet',
          storyPreviews: playerStats[player.id]?.previews || ['No stories yet'],
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [players, playerStats],
  )


  const handleAddPlayer = async (player: { name: string; imageUrl: string; description: string }) => {
    try {

      const { data: newPlayer, error } = await supabase.from('players').insert({
        name: player.name,
        image_url: player.imageUrl,
        description: player.description,
        slug: toSlug(player.name),
        country: 'India'
      }).select().single()
      
      if (!error && newPlayer) {
        setPlayers(prev => [newPlayer, ...prev])
      }

    } catch (error) {
      console.error('Failed to add player:', error)
    }
  }


  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="players-title text-3xl font-bold text-foreground sm:text-4xl">
              Pick a player. Read what fans feel.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a player and jump straight into fan stories.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary/10 text-primary hover:bg-primary/20 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Player
            </Button>
            <Link href="/players">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground gap-1 group">
                View all players
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="players-grid">
          {mappedPlayers.map((player) => (
            <PlayerCard key={player.slug} {...player} />
          ))}
        </div>
      </div>

      <AddPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddPlayer}
      />

<style jsx>{`
        .players-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 640px) {
          .players-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 16px;
          }
        }

        @media (min-width: 768px) {
          .players-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 20px;
          }
        }

        @media (min-width: 1024px) {
          .players-grid {
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          }
        }
      `}</style>
    </section>
  )
}
