'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SimplePlayerCardProps {
  name: string
  slug: string
  image: string
  role?: string
  country?: string
  storyCount?: number
  totalLikes?: number
}

const getEmotionalCTA = (storyCount: number) => {
  if (storyCount === 0) return '❤️ Be First'
  if (storyCount === 1) return '💬 Write'
  if (storyCount < 5) return '🔥 Write'
  return '📣 Write'
}

export function SimplePlayerCard({
  name,
  slug,
  image,
  role,
  country,
  storyCount = 0,
  totalLikes = 0,
}: SimplePlayerCardProps) {
  const isUnstartedPlayer = storyCount === 0
  const cta = getEmotionalCTA(storyCount)

  return (
    <Link href={`/write/${slug}`} className="group block">
      <div
        className={`p-3 rounded-lg transition-all duration-200 ${
          isUnstartedPlayer
            ? 'opacity-60 border border-dashed border-gray-600 hover:opacity-100 hover:border-cyan-500 bg-card/20'
            : 'border border-gray-700 hover:border-cyan-400 bg-card/50 hover:bg-card'
        }`}
      >
        {/* Image */}
        <div className="relative h-32 aspect-square overflow-hidden rounded-md mb-2">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div>
          <h3 className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors">
            {name}
          </h3>
          
          {country && (
            <p className="text-xs text-gray-400 mt-1">
              {country} • {role || 'Player'}
            </p>
          )}
          {!country && role && (
            <p className="text-xs text-gray-400 mt-1">
              {role}
            </p>
          )}

          {/* Engagement Status */}
          {isUnstartedPlayer ? (
            <p className="text-xs text-yellow-400 mt-2 font-medium">
              ⏳ Be the first fan to write
            </p>
          ) : (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              {storyCount > 0 && <span>📖 {storyCount}</span>}
              {totalLikes > 0 && <span>❤️ {totalLikes}</span>}
            </div>
          )}

          {/* CTA */}
          <button className="text-cyan-400 text-xs mt-2 font-medium hover:underline flex items-center gap-1 group/btn">
            {cta}
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </Link>
  )
}

