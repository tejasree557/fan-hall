import os

path = 'app/stories/[id]/share/page.tsx'
if os.path.exists(path):
    os.remove(path)

content = """'use client'

import { useEffect, useState } from 'react'
import { toPng } from 'html-to-image'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'
import { Instagram, Heart } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface StoryData {
  id: string
  content: string
  fan_name: string
  country: string
  like_count: number
  created_at: string
  players: { name: string; image_url?: string } | null
}

const convertImageToDataUrl = (src: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || 200
        canvas.height = img.naturalHeight || 200
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(null); return }
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch { resolve(null) }
    }
    img.onerror = () => resolve(null)
    const cb = src.includes('?') ? '&' : '?'
    img.src = src + cb + '_cb=' + Date.now()
  })
}

export default function SharePage() {
  const params = useParams()
  const id = params?.id as string

  const [story, setStory] = useState(null)
  const [playerImgDataUrl, setPlayerImgDataUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchStory = async () => {
      try {
        const { data } = await supabase
          .from('stories')
          .select('*, players (id, name, image_url)')
          .eq('id', id)
          .single()
        if (data) {
          setStory(data)
          const img = data.players?.image_url
          if (img) {
            const url = await convertImageToDataUrl(img)
            if (url) setPlayerImgDataUrl(url)
          }
        }
      } catch (err) {
        console.error('Failed to fetch story:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStory()
  }, [id])

  const handleShare = async () => {
    const el = document.getElementById('share-card')
    if (!el) return
    try {
      await new Promise((r) => setTimeout(r, 300))
      const dataUrl = await toPng(el, {
        backgroundColor: '#000000',
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
      })
      const link = document.createElement('a')
      link.download = 'pitchher-story.png'
      link.href = dataUrl
      link.click()
      toast.success('Image downloaded! Now share it on Instagram')
    } catch (err) {
      console.error('Failed to generate image:', err)
      toast.error('Could not generate image. Try taking a screenshot instead!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500">Story not found</p>
      </div>
    )
  }

  const player = story.players
  const countryFlag = story.country === 'India' || !story.country ? 'IN' : story.country
  const imgSrc = playerImgDataUrl || player?.image_url

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div id="share-card" className="w-full max-w-lg relative rounded-2xl p-8 flex flex-col items-center text-center" style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 100%)',
        border: '1px solid rgba(34,211,238,0.15)',
        boxShadow: '0 0 60px rgba(34,211,238,0.08)',
      }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)' }} />

        <div className="relative mx-auto mb-6">
          <div className="absolute inset-0 rounded-full animate-glow-pulse" style={{ transform: 'scale(1.15)' }} />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mx-auto" style={{ border: '2px solid rgba(34,211,238,0.4)', boxShadow: '0 0 30px rgba(34,211,238,0.15)' }}>
            {imgSrc ? (
              <img src={imgSrc} alt={player?.name || 'Player'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-pink-500/20 flex items-center justify-center text-3xl">🏏</div>
            )}
          </div>

        <p className="text-sm font-semibold tracking-widest uppercase mb-1" style={{ color: '#22d3ee' }}>
          For {player?.name || 'A Special Player'} 💙
        </p>

        <div className="relative py-6 px-2 w-full">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 text-6xl leading-none font-serif opacity-10 select-none" style={{ color: '#22d3ee' }}>&ldquo;</span>
          <p className="relative text-xl sm:text-2xl font-light leading-relaxed italic" style={{ color: '#f3f4f6' }}>
            {story.content}
          </p>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-6xl leading-none font-serif opacity-10 select-none" style={{ color: '#ec4899' }}>&rdquo;</span>
        </div>

        <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <span className="text-lg mr-1">—</span>
          {story.fan_name} <span className="ml-1">{countryFlag}</span>
        </p>

        <div className="w-16 h-px my-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)' }} />

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-red-400 text-red-400" />
            <span className="text-sm font-medium" style={{ color: '#f3f4f6' }}>
              {story.like_count || 0} love{story.like_count !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.3)' }}>This message was written by a fan</p>
          <p className="text-[10px] mt-2 tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.15)' }}>pitchher.vercel.app</p>
        </div>

      <div className="mt-8">
        <button onClick={handleShare} className="group flex items-center gap-3 px-8 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95" style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 50%, #ec4899 100%)',
          backgroundSize: '200% auto',
          color: '#000000',
          boxShadow: '0 0 30px rgba(236,72,153,0.3)',
        }}>
          <Instagram className="w-5 h-5" />
          Share to Instagram
        </button>
        <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Downloads a beautiful image you can post</p>
      </div>
  )
}
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done:', path, os.path.getsize(path), 'bytes')
"""

with open('write_share_page.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Script written')
