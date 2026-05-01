'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'
import { getPlayers, getStoryCountsByPlayer, type Player } from '@/lib/api'
import { defaultPlayers } from '@/lib/defaultPlayers'
import { toSlug } from '@/lib/utils'

const JHULAN_IMAGE_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvU6CG38X_oWSIvL8vgGJTk33sGAaKqZXaHQ&s'
const SMRITI_IMAGE_URL =
  'https://www.infoknocks.com/wp-content/uploads/2025/10/smriti-mandhana.webp'
const HARMANPREET_IMAGE_URL =
  'https://bsmedia.business-standard.com/_media/bs/img/article/2025-09/26/thumb/featurecrop/1200X900/1758884407-7155.jpg'

function FanFavCard({
  name,
  slug,
  image,
  role,
  country,
  storyCount,
  rank,
}: {
  name: string
  slug: string
  image?: string
  role?: string
  country?: string
  storyCount: number
  rank: number
}) {
  const rankLabel = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`

  return (
    <Link href={`/write/${slug}`} className="group block flex-shrink-0 min-w-[220px] max-w-[220px]">


      <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-3 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] relative rounded-2xl overflow-hidden h-64">

        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
        )}

        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

        {/* Rank badge */}
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {rankLabel}
        </div>

        {/* Story count badge */}
        {storyCount > 0 && (
          <div className="absolute top-3 right-3 bg-primary/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-semibold">
            {storyCount} {storyCount === 1 ? 'story' : 'stories'}
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-white/60 text-xs mb-1 uppercase tracking-wider">{country}</p>
          <div className="mt-3 space-y-1">
            <h3 className="text-white font-semibold text-sm">{name}</h3>
            <p className="text-gray-400 text-xs">{role}</p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {storyCount === 0 ? (
              <span className="text-white/50 text-xs">Be the first to write</span>
            ) : (
              <span className="text-white/60 text-xs">{storyCount} fan{storyCount !== 1 ? 's' : ''} wrote</span>
            )}
            <span className="text-primary text-xs font-semibold group-hover:translate-x-1 transition-transform inline-block">
              Write →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function FanFavoritesSection() {
  const [players, setPlayers] = useState<Player[]>([])


  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const fallbackPlayers = defaultPlayers.map((p) => ({
          id: toSlug(p.name),
          name: p.name,
          image_url: p.image_url,
          description: p.description,
          slug: toSlug(p.name),
          story_count: 0,
          total_likes: 0,
          country: p.country,
        }))

        const [data, counts] = await Promise.all([getPlayers(), getStoryCountsByPlayer()])
        setPlayerCounts(counts)
        setPlayers(data.length > 0 ? data : fallbackPlayers)
      } catch {
        setPlayers(
          defaultPlayers.map((p) => ({
            id: toSlug(p.name),
            name: p.name,
            image_url: p.image_url,
            description: p.description,
            slug: toSlug(p.name),
            story_count: 0,
            total_likes: 0,
            country: p.country,
          }))
        )
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  const ranked = useMemo(
    () =>
      players
        .map((p) => ({
          name: p.name,
          slug: p.slug ?? toSlug(p.name),
          image:
            p.name.toLowerCase() === 'jhulan goswami'
              ? JHULAN_IMAGE_URL
              : p.name.toLowerCase() === 'smriti mandhana'
                ? SMRITI_IMAGE_URL
                : p.name.toLowerCase() === 'harmanpreet kaur'
                  ? HARMANPREET_IMAGE_URL
                  : p.image_url,
          role: p.description || 'Player',
          country: p.country,
          storyCount: playerCounts[p.id] || 0,
        }))
        .sort((a, b) =>
          b.storyCount !== a.storyCount
            ? b.storyCount - a.storyCount
            : a.name.localeCompare(b.name)
        )
        .map((p, i) => ({ ...p, rank: i + 1 })),
    [players, playerCounts]
  )

  return (
    <section className="py-20 sm:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">
            Leaderboard
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
            🔥 Fan Favorites Right Now
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Most loved by fans this week
          </p>

        </div>

        {/* Horizontal scroll */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto scrollbar-hide px-2">
            {ranked.map((player) => (
              <div key={player.slug} className="snap-start">
                <FanFavCard {...player} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

