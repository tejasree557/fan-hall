import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { StoryViewDownloadButton } from '@/components/story-view-download-button'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function ShareStoryPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = await params

  const { data: story } = await supabase
    .from('stories')
    .select(
      `
      *,
      players (
        id,
        name,
        image_url
      )
    `,
    )
    .eq('id', storyId)
    .single()

  if (!story) {
    notFound()
  }

  const player = story.players
  const playerImageUrl = player?.image_url
    ? `/api/proxy-image?url=${encodeURIComponent(player.image_url)}`
    : '/placeholder.svg'

  return (
    <main className="share-container flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="flex flex-col items-center">
        <div
          id="story-export"
          className="story-card w-full max-w-[420px] rounded-[30px] bg-gradient-to-b from-slate-800 to-slate-950 p-10 text-center text-white shadow-[0_24px_70px_rgba(0,0,0,0.65)]"
        >
          <img
            src={playerImageUrl}
            alt={player?.name || 'Player'}
            className="avatar mx-auto mb-4 h-20 w-20 rounded-full object-cover"
          />

          <h2 className="text-3xl font-semibold leading-tight">{player?.name || 'PitchHer Story'}</h2>

          <p className="quote mt-5 text-lg italic leading-relaxed text-white/90">&ldquo;{story.content}&rdquo;</p>

          <p className="author mt-3 text-white/70">— {story.fan_name}</p>

          <p className="likes mt-2 text-orange-400">❤️ {story.like_count || 0} loves</p>
        </div>

        <StoryViewDownloadButton />
        <p className="cta mt-3 text-center text-[13px] text-white/60">
          Post this on Instagram &amp; tag @PitchHer
        </p>
      </div>
    </main>
  )
}
