'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Heart, Sparkles } from 'lucide-react'
import StoryForm from '@/components/StoryForm'
import { getPlayerBySlug } from '@/lib/api'
import { defaultPlayers } from '@/lib/defaultPlayers'
import { toSlug } from '@/lib/utils'

export default function WriteStoryForPlayer() {
  const params = useParams()
  const slug = params.slug as string

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        setIsLoadingPlayers(true)

        // Try Supabase by slug (most reliable)
        const player = await getPlayerBySlug(slug)

        if (player) {
          setPlayerName(player.name)
          setPlayerId(player.id)
          setError(null)
          return
        }

        // Fallback: check defaultPlayers for display name only
        const fallback = defaultPlayers.find(p => toSlug(p.name) === slug)
        if (fallback) {
          setPlayerName(fallback.name)
          setPlayerId(null)
          setError(null)
          return
        }

        setError("Player not found")
      } catch (err) {
        setError('Failed to load player.')
      } finally {
        setIsLoadingPlayers(false)
      }
    }

    if (slug) loadPlayer()
  }, [slug])

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Story Submitted!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your message for <strong>{playerName}</strong> is now live.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">Home</Button>
              </Link>
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-primary-foreground"
              >
                Write Another
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (isLoadingPlayers) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-muted-foreground">Loading player...</div>
      </main>
    )
  }

  // ✅ Show a proper error state if player wasn't found
  if (error && !playerName) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-foreground mb-4">Player Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find a player matching <strong>{slug}</strong>.
            </p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-sm uppercase tracking-wider text-emerald-400 font-medium">
                Write for {playerName}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Your Story for {playerName}
            </h1>
            <p className="mt-4 text-muted-foreground text-pretty">
              Share your message or memory. Make it personal - she might read it.
            </p>
          </div>

          {/* Single Centralized Form */}
          <StoryForm 
            playerId={playerId || undefined}
            playerName={playerName} 
            playerSlug={slug}
            onSuccess={() => setIsSubmitted(true)} 
          />
        </div>
      </div>

      <Footer />
    </main>
  )
}