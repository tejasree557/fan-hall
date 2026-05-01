'use client'

import { useState, useEffect } from 'react'
import { Heart, MapPin, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleStoryLike } from '@/lib/api'

interface StoryCardProps {
  id?: string
  fanName: string
  country: string
  storyPreview: string
  likeCount: number
  playerName?: string
  createdAt?: string
  image_url?: string
}

function timeAgo(date?: string) {
  if (!date) return 'just now'
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

export function StoryCard({ id, fanName, country, storyPreview, likeCount: initialLikeCount, playerName, createdAt, image_url }: StoryCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isSubmittingLike, setIsSubmittingLike] = useState(false)

  useEffect(() => {
    if (id) {
      const liked = localStorage.getItem(`liked-${id}`);
      if (liked === 'true') {
        setIsLiked(true);
      }
    }
  }, [id]);

  const handleLike = async () => {
    if (isSubmittingLike || !id) return;

    const wasLiked = isLiked;

    try {
      setIsSubmittingLike(true);
      const newLikeCount = await toggleStoryLike(id!, likeCount, wasLiked);
      setLikeCount(newLikeCount);

      const newLiked = !wasLiked;
      setIsLiked(newLiked);

      localStorage.setItem(`liked-${id}`, newLiked ? 'true' : '');
    } catch (error) {
      console.error('Like toggle failed:', error);
    } finally {
      setIsSubmittingLike(false);
    }
  }

  return (
    <div className="group bg-card border border-border/50 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* PLAYER HEADER - Main Focus */}
      {playerName && (
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-cyan-400/10">
          <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-semibold shrink-0">🏏</div>
          <div>
            <p className="text-xs text-gray-400 leading-none">For</p>
            <p className="text-base font-bold text-cyan-400 leading-tight">{playerName}</p>
          </div>
        </div>
      )}

      {/* Fan/Author Info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground font-semibold text-xs shrink-0">
          {fanName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-foreground text-xs truncate">{fanName}</h4>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="w-3 h-3" />
            <span>{country}</span>
          </div>
        </div>
      </div>

      {image_url && (
        <img
          src={image_url}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      )}

      {/* Story Preview */}
      <p className="italic text-gray-300 text-sm leading-relaxed mb-3">
        &ldquo;{storyPreview.slice(0, 150)}&hellip;&rdquo;
      </p>

      {/* Footer with Actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/30">
        <span className="text-xs text-gray-500">{timeAgo(createdAt)}</span>
        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            onClick={() => id && window.open(`/share/${id}`, '_blank')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors p-1"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isSubmittingLike}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-red-400 transition-all transform hover:scale-110 active:scale-90 p-1"
            title="Like"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all",
                isLiked && "fill-red-400 text-red-400 scale-110"
              )}
            />
            <span className="text-xs font-medium">{likeCount}</span>
          </button>
        </div>
      </div>

    </div>
  )
}

