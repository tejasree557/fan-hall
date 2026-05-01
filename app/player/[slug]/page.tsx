import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { StoryCard } from '@/components/story-card'
import { StoriesEmptyState } from '@/components/stories-empty-state'
import { Button } from '@/components/ui/button'
import { getPlayers, getStoriesByPlayer } from '@/lib/api'
import { toSlug } from '@/lib/utils'
import { ArrowLeft, PenLine } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PlayerPage({ params }: PageProps) {
  const { slug } = await params
  let players = [] as Awaited<ReturnType<typeof getPlayers>>
  let loadError: string | null = null

  try {
    players = await getPlayers()
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load player.'
  }

  const player = players.find((item) => toSlug(item.name) === slug)

  if (!player && !loadError) {
    notFound()
  }
  if (!player) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-28 px-4">
          <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {loadError}
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  let stories = [] as Awaited<ReturnType<typeof getStoriesByPlayer>>
  try {
    stories = await getStoriesByPlayer(player.id)
  } catch {
    stories = []
  }
  const totalLikes = stories.reduce((sum, story) => sum + story.like_count, 0)
  const stats = [
    { label: 'Fan Messages', value: `${stories.length}` },
    { label: 'Total Likes', value: `${totalLikes}` },
    { label: 'Countries Reached', value: `${new Set(stories.map((story) => story.country)).size}` },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Banner */}
      <section className="relative h-[50vh] sm:h-[60vh] pt-16">
        <Image
          src={player.image_url ?? ''}
          alt={player.name}
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-20 left-4 sm:left-8 z-10">
          <Link href="/">
            <Button variant="ghost" size="sm" className="bg-background/50 backdrop-blur-sm hover:bg-background/70">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Player Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12">
          <div className="max-w-7xl mx-auto">
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              Featured Player
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mt-2">
              {player.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Description and Stats */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2">
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                {player.description}
              </p>
              <Link href="/write" className="mt-6 inline-block">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <PenLine className="w-4 h-4" />
                  Write a message for {player.name.split(' ')[0]}
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-card border border-border/50 rounded-lg p-4 text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stories Section */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
              Messages fans wrote for her
            </h2>
            {stories.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    id={story.id}
                    fanName={story.fan_name}
                    country={story.country}
                    storyPreview={story.content}
                    likeCount={story.like_count}
                    createdAt={story.created_at}
                    fanImageUrl={story.fan_image_url}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl">
                <StoriesEmptyState playerName={player.name} />
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export function generateStaticParams() {
  return getPlayers().then((players) => players.map((player) => ({ slug: toSlug(player.name) })))
}
