'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface PlayerCardProps {
  id: string
  name: string
  image: string
  country?: string
  storyCount?: number
}

export function PlayerCard({
  id,
  name,
  image,
  country,
  storyCount = 0,
}: PlayerCardProps) {
  const router = useRouter()

  return (
    <div className="player-card" onClick={() => router.push(`/write?player=${id}`)}>
      <div className="player-image-wrap">
        <Image src={image} alt={name} fill className="player-image" />
      </div>

      <div className="story-badge">
        {storyCount} {storyCount === 1 ? 'story' : 'stories'}
      </div>

      <div className="overlay">
        <h4 className="player-name">{name}</h4>
        <p className="player-country">{country || 'India'}</p>
        <span className="write-link">Write →</span>
      </div>

<style jsx>{`
        .player-card {
          border-radius: 16px;
          height: 160px;
          position: relative;
          cursor: pointer;
          transition: 0.25s ease;
          overflow: hidden;
        }

        .player-card:hover {
          transform: scale(1.04);
        }

        @media (min-width: 640px) {
          .player-card {
            height: 208px;
          }
        }

        .player-image-wrap {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .player-image {
          object-fit: cover;
        }

        .overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 10px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.3), transparent);
        }

        .story-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
          padding: 3px 6px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(3px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        @media (min-width: 640px) {
          .story-badge {
            top: 10px;
            right: 10px;
            padding: 4px 8px;
            font-size: 11px;
          }
        }

        .player-name {
          margin-top: 0;
          margin-bottom: 0;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.3;
          color: #ffffff;
        }

        @media (min-width: 640px) {
          .player-name {
            font-size: 15px;
          }
        }

        .player-country {
          margin-top: 2px;
          margin-bottom: 0;
          font-size: 10px;
          opacity: 0.6;
          color: #ffffff;
        }

        @media (min-width: 640px) {
          .player-country {
            font-size: 11px;
          }
        }

        .write-link {
          display: inline-block;
          margin-top: 2px;
          font-size: 10px;
          color: #22c55e;
        }

        @media (min-width: 640px) {
          .write-link {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  )
}
