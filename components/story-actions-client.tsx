'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Heart, Share2 } from 'lucide-react'
import { toggleStoryLike } from '@/lib/api'

interface StoryActionsClientProps {
  storyId: string
  initialLikeCount: number
  storyEmotion?: string
  playerName?: string
  storyContent?: string
  fanName?: string
  countryFlag?: string
}

export function StoryActionsClient({ storyId, initialLikeCount, storyEmotion }: StoryActionsClientProps) {
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    // Instant UI feedback
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

    // Update backend
    setIsLoading(true)
    try {
      await toggleStoryLike(storyId, likeCount, isLiked)
      toast.success(newIsLiked ? '❤️ You felt this!' : 'Removed your love')
      if (newIsLiked) {
        if (storyEmotion) {
          localStorage.setItem('user_emotion', storyEmotion)
        }
        setTimeout(() => {
          alert('This story matches you. Share it?')
        }, 800)
        toast('This story is trending. Share it?', {
          action: {
            label: 'This is me ❤️',
            onClick: () => {
              void handleShare()
            },
          },
        })
      }
    } catch (error) {
      // Revert UI on error
      setIsLiked(isLiked)
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1))
      console.error('Failed to update like:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    router.push(`/share/${storyId}`)
  }

  return (
    <div className="w-full max-w-xl mt-10 flex flex-col items-center gap-4">
      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <Heart
          className={`w-5 h-5 transition-all ${isLiked ? 'fill-white' : ''}`}
        />
        I felt this ({likeCount})
      </button>

      {/* Social Share */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
        <p className="text-sm text-gray-400">One tap to share. No copy link flow.</p>
      </div>

    </div>
  )
}
