'use client'

import Image from 'next/image'
import Link from 'next/link'

interface FeaturedPlayerCardProps {
  name: string
  slug: string
  image: string
  role?: string
  country?: string
  storyCount?: number
  totalLikes?: number
  rank?: number
}

const getEmotionalCTA = (storyCount: number) => {
  if (storyCount === 0) return { text: '❤️ She Should Read This', icon: '❤️' }
  if (storyCount < 5) return { text: '🔥 Write What She Deserves', icon: '🔥' }
  if (storyCount < 15) return { text: '💬 Tell Her Why She Matters', icon: '💬' }
  return { text: '📣 Say It Like a True Fan', icon: '📣' }
}

const getEngagementMessage = (storyCount: number, totalLikes: number) => {
  if (storyCount === 0) return '⏳ No one has written yet'
  if (storyCount === 1) return '⏳ 1 fan has written'
  return `🔥 ${storyCount} fans wrote this week`
}

export function FeaturedPlayerCard({
  name,
  slug,
  image,
  role,
  country,
  storyCount = 0,
  totalLikes = 0,
  rank,
}: FeaturedPlayerCardProps) {
  const cta = getEmotionalCTA(storyCount)
  const engagementMsg = getEngagementMessage(storyCount, totalLikes)

  return (
    <Link href={`/write/${slug}`} className="group block flex-shrink-0 w-80">
      <div className="relative rounded-2xl overflow-hidden group scale-100 hover:scale-105 transition-transform duration-300">
        {/* Image with brightness adjustment */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover brightness-75 group-hover:brightness-50 transition-all duration-300"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          {/* Top badge */}
          {rank && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
              🔥 #{rank}
            </div>
          )}

          {/* Bottom content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-white text-2xl font-bold group-hover:text-pink-300 transition-colors">
              {name}
            </h2>
            {country && (
              <p className="text-pink-300 text-xs font-medium mt-1">
                {country}
              </p>
            )}
            {role && (
              <p className="text-pink-200 text-xs mt-0.5">
                {role}
              </p>
            )}
            
            {/* Engagement message */}
            <div className="mt-3 flex items-center gap-1">
              <span className="text-xs text-pink-200">
                {engagementMsg}
              </span>
            </div>

            {/* Likes */}
            {totalLikes > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-lg">❤️</span>
                <span className="text-pink-300 text-xs font-medium">{totalLikes} loves</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
