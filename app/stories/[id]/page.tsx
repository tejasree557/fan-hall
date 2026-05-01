import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { StoryActionsClient } from '@/components/story-actions-client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: story } = await supabase
    .from('stories')
    .select(`
      *,
      players (
        id,
        name,
        slug,
        image_url,
        country
      )
    `)
    .eq('id', id)
    .single()

  if (!story) {
    notFound()
  }

  const player = story.players
  const countryFlag =
    story.country === 'India' || !story.country ? '🇮🇳' : story.country
  const playerImageUrl = player?.image_url
    ? `/api/proxy-image?url=${encodeURIComponent(player.image_url)}`
    : null
  const exportPlayerImage = playerImageUrl || '/placeholder.svg'
  const viralLines = [
    'This one felt personal.',
    'Couldn’t scroll past this.',
    'This story stayed with me.',
  ]
  const viralLine = viralLines[(story.id?.length || 0) % viralLines.length]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center p-6">
      {/* Story Card — captured for download */}
      <div id="story-card" className="max-w-xl w-full text-center mt-10 sm:mt-16 bg-[#0f172a]/60 rounded-3xl p-8 border border-cyan-400/10 shadow-2xl">
        {/* Player Image */}
        {playerImageUrl ? (
          <img
            src={playerImageUrl}
            alt={player.name}
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-4xl">
            🏏
          </div>
        )}

        {/* Player Name */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {player?.name || 'A Special Player'}
        </h1>

        {/* Story */}
        <p className="mt-6 text-lg sm:text-xl text-gray-100 italic leading-relaxed">
          &ldquo;{story.content}&rdquo;
        </p>

        {/* Fan */}
        <p className="mt-4 text-sm opacity-70 text-gray-300">
          — {story.fan_name} {countryFlag}
        </p>

        {/* Likes */}
        <p className="mt-2 text-sm text-gray-300">
          ❤️ {story.like_count || 0} loves
        </p>
      </div>

      <div
        id="story-export"
        className="fixed left-[-9999px] top-[-9999px] flex h-[1920px] w-[1080px] flex-col items-center justify-center bg-[linear-gradient(180deg,#0f172a,#020617)] p-20 text-center text-white"
      >
        <img
          src={exportPlayerImage}
          alt={player?.name || 'Player'}
          className="mb-10 h-40 w-40 rounded-full object-cover shadow-[0_0_40px_rgba(34,197,94,0.35)]"
        />

        <h1 className="text-7xl font-semibold leading-tight">{player?.name || 'PitchHer Story'}</h1>

        <p className="my-10 max-w-[800px] text-[42px] leading-[1.6] italic">&ldquo;{story.content}&rdquo;</p>

        <p className="mt-5 text-4xl text-white/70">
          — {story.fan_name} {countryFlag}
        </p>

        <div className="mt-6 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-6 py-3 text-2xl text-cyan-100">
          {viralLine}
        </div>

        <div className="mt-5 text-2xl text-white/80">❤️ {story.like_count || 0} fans felt this</div>

        <div className="absolute bottom-[60px] text-2xl text-white/50">@PitchHer</div>
      </div>

      {/* Actions */}
      <StoryActionsClient
        storyId={story.id}
        initialLikeCount={story.like_count || 0}
        storyEmotion={story.emotion}
        playerName={player?.name}
        storyContent={story.content}
        fanName={story.fan_name}
        countryFlag={countryFlag}
      />
    </div>
  )
}
