'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getStories, toggleStoryLike } from '@/lib/api'
import { ArrowRight, Heart, Share2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function StoryCard({ story, onRefresh }: { story: any; onRefresh: () => void }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(story.like_count || 0)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    if (story.id) {
      const stored = localStorage.getItem(`liked-${story.id}`);
      setLiked(stored === 'true');
      setLikeCount(story.like_count || 0);
    }
  }, [story.id]);

  const initials = story.fan_name
    ? story.fan_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleLike = async () => {
    if (isToggling || !story.id) return;

    setIsToggling(true);
    const wasLiked = liked;
    try {
      const newCount = await toggleStoryLike(story.id, likeCount, wasLiked);
      setLikeCount(newCount);
      const newLiked = !wasLiked;
      setLiked(newLiked);
      localStorage.setItem(`liked-${story.id}`, newLiked ? 'true' : '');
      if (newLiked && story.emotion) {
        localStorage.setItem('user_emotion', story.emotion)
        setTimeout(() => {
          alert('This story matches you. Share it?')
        }, 800)
      }
      onRefresh();
    } catch (error) {
      console.error('Like toggle failed:', error);
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col gap-4 hover:border-border transition-colors">
      {/* PLAYER HEADER - Main Focus */}
      {story.players && (
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
          {story.players.image_url ? (
            <img src={story.players.image_url} alt={story.players.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-semibold shrink-0">🏏</div>
          )}
          <div>
            <p className="text-xs text-gray-400 leading-none">For</p>
            <p className="text-sm font-semibold text-cyan-400 leading-tight">{story.players.name}</p>
          </div>
        </div>
      )}

      {/* Author Info */}
      <div className="flex items-start gap-2">
        <div className="flex items-center gap-2 flex-1">
          {story.fan_image_url ? (
            <img src={story.fan_image_url} alt={story.fan_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary">{initials}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-foreground text-xs">{story.fan_name}</p>
            {story.country && (
              <p className="text-xs text-muted-foreground">{story.country}</p>
            )}
          </div>
        </div>
      </div>

      {/* Story Content */}
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
        &ldquo;{story.content}&rdquo;
      </p>

      {story.emotion && (
        <span className="w-fit rounded-[20px] bg-white/10 px-[10px] py-1 text-[12px] lowercase text-white/85">
          {story.emotion}
        </span>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(`/share/${story.id}`, '_blank')}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
            title="Share Story"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={handleLike}
            disabled={isToggling}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-all transform hover:scale-110 active:scale-90 ${
              liked ? 'text-red-400 bg-red-400/10' : 'text-muted-foreground hover:text-red-400 hover:bg-red-400/10'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 transition-all ${liked ? 'fill-red-400 scale-110' : ''}`} />
            {likeCount}
          </button>
        </div>
      </div>

    </div>
  )
}

export function StoriesSection() {
  const [stories, setStories] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [userEmotion, setUserEmotion] = useState<string | null>(null)

  const fetchStories = useCallback(async () => {
    try {
      const data = await getStories();
      setStories(data || []);
    } catch (err) {
      setError('Could not load stories.');
    }
  }, []);

  useEffect(() => {
    fetchStories();
    setLoaded(true);
    setUserEmotion(localStorage.getItem('user_emotion'))
  }, [fetchStories])

  const refreshStories = () => {
    fetchStories();
    setUserEmotion(localStorage.getItem('user_emotion'))
  };

  const finalStories = useMemo(() => {
    const allStories = stories || []
    if (!userEmotion) return allStories

    const personalizedStories = allStories.filter((story) => story.emotion === userEmotion)
    const fallbackStories = personalizedStories.length > 0 ? personalizedStories : allStories

    return [...fallbackStories].sort((a, b) => {
      if (a.emotion === userEmotion) return -1
      if (b.emotion === userEmotion) return 1
      return 0
    })
  }, [stories, userEmotion])

  return (
    <section className="py-20 sm:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              Fan Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
              Stories that feel like you
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl text-pretty">
              Because you felt this...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              You paused on something emotional... here&apos;s more.
            </p>
          </div>
          <Link href="/stories">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground gap-1 group">
              View all stories
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Stories */}
        {!loaded ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading stories...</div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground text-sm">{error}</div>
        ) : finalStories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No stories yet. Be the first to write one!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalStories.slice(0, 6).map((story) => (
              <StoryCard key={story.id} story={story} onRefresh={refreshStories} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Have a story to share?</p>
          <Link href="/write">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Share Your Story
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
