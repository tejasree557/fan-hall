'use client'

import { useState } from 'react'
import { toPng } from 'html-to-image'
import { toast } from 'sonner'
import { Download } from 'lucide-react'

export function StoryViewDownloadButton() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleShare = async () => {
    const node = document.getElementById('story-export')
    if (!node) {
      toast.error('Story export card not ready')
      return
    }

    setIsDownloading(true)
    try {
      await document.fonts.ready
      const dataUrl = await toPng(node, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#020617',
        filter: (element) => {
          if (!(element instanceof HTMLImageElement)) return true
          if (!element.src) return true
          return (
            element.src.startsWith(window.location.origin) ||
            element.src.startsWith('data:') ||
            element.src.startsWith('blob:')
          )
        },
      })

      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'pitchher-story.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'PitchHer Story',
        })
        toast.success('Posted from your story canvas ✨')
      } else {
        const link = document.createElement('a')
        link.download = 'pitchher-story.png'
        link.href = URL.createObjectURL(blob)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(link.href), 1000)
        toast.success('Image ready. Post this story ❤️')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : error instanceof Event
            ? 'Image export failed due to blocked or cross-origin image'
            : String(error)
      console.error('Story image download failed:', errorMessage, error)
      toast.error('Download failed. Try a story image without external assets.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isDownloading}
      className="download-btn mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Download className="h-4 w-4" />
      {isDownloading ? 'Generating...' : '⬇ Download Story Image'}
    </button>
  )
}
