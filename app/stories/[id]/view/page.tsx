import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { StoryViewDownloadButton } from '@/components/story-view-download-button'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function StoryViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

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
    .eq('id', id)
    .single()

  if (!story) {
    notFound()
  }

  const player = story.players
  const countryFlag = story.country === 'India' || !story.country ? '🇮🇳' : story.country
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
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.14),transparent_36%),radial-gradient(circle_at_85%_18%,rgba(59,130,246,0.18),transparent_38%)]" />
      <div
        id="capture"
        className="relative z-10 w-full max-w-[390px] rounded-[28px] border border-cyan-400/20 bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 px-6 pb-7 pt-8 text-center text-white shadow-[0_24px_70px_rgba(0,0,0,0.65)] backdrop-blur-sm animate-in zoom-in-95 duration-300"
      >
        <span className="mx-auto inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
          Fan Story
        </span>

        <div className="mt-5">
          {playerImageUrl ? (
            <img
              src={playerImageUrl}
              alt={player.name || 'Player'}
              className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-cyan-300/55 shadow-[0_10px_30px_rgba(34,211,238,0.25)]"
            />
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500/20 text-2xl ring-2 ring-cyan-300/50">
              🏏
            </div>
          )}
        </div>

        <h1 className="mt-5 text-[37px] font-semibold leading-none tracking-tight text-white">
          {player?.name || 'PitchHer Story'}
        </h1>

        <div className="mx-auto mt-2 h-px w-16 bg-cyan-300/40" />

        <div className="mt-5 max-h-[38vh] overflow-y-auto px-1">
          <p className="text-[27px] leading-[1.55] text-white/92 italic">
            &ldquo;{story.content}&rdquo;
          </p>
        </div>

        <p className="mt-6 text-base font-medium text-cyan-100/95">
          — {story.fan_name} <span className="text-cyan-100/80">{countryFlag}</span>
        </p>

        <p className="mt-2 text-sm text-white/80">❤️ {story.like_count || 0} loves</p>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/65">
          Crafted with love on PitchHer
        </div>
      </div>

      <div className="relative z-10">
        <StoryViewDownloadButton />
      </div>

      <div
        id="story-export"
        className="fixed left-[-9999px] top-[-9999px] flex h-[1920px] w-[1080px] flex-col items-center justify-center bg-[linear-gradient(180deg,#0f172a,#020617)] p-20 text-center text-white"
        style={{ position: 'fixed' }}
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
    </main>
  )
}
