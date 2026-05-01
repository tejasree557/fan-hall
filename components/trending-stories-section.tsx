'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getTopStories } from '@/lib/api'
import { TrendingUp, Heart, MessageCircle } from 'lucide-react'

export function TrendingStoriesSection() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
    async function loadStories() {
      try {
        const data = await getTopStories()
        // Filter out stories with no title (blank or untitled)
        const allStories = data || []
        const filteredStories = allStories.filter(
          (story: any) => story.title && story.title.trim()
        )
        // Show filtered stories if available, otherwise show all (to avoid empty section)
        setStories(filteredStories.length > 0 ? filteredStories : allStories)
      } catch (error) {
        console.error('Failed to load trending stories:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStories()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!stories.length) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-b from-purple-900/20 to-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-bold text-white">Trending Stories</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stories.map((story, index) => (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="group block"
            >
              <div className="bg-card/80 backdrop-blur border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/60 transition-all hover:transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full">
                    #{index + 1} Trending
                  </span>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{story.like_count || 0}</span>
                  </div>
                </div>
                
<h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                  {story.title || ''}
                </h3>
                
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {story.content?.substring(0, 100)}...
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-300 font-medium">
                    {story.fan_name || 'Anonymous Fan'}
                  </span>
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}