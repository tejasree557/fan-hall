'use client'

import Link from 'next/link'

const TEAM_INDIA_IMAGE = 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg'

export function TeamIndiaCard() {
  return (
    <section className="team-hero">
      <div className="team-card">
        {/* India flag background */}
        <div className="india-bg" />
        
        {/* Flag */}
        <div className="flag" />
        
{/* Content */}
        <div className="content">
          <p className="tag">TEAM INDIA</p>
          <h3>Share Your Love</h3>
          <h1>
            <span className="accent">Write Your Story</span>
          </h1>
          <p className="desc">
            Be the first to share your fan story for Team India. Tell them what their victory means to you and millions of fans.
          </p>
          <div className="actions">
            <Link href="/write?player=team-india" className="primary">
              Write Your Letter
            </Link>
            <Link href="/stories" className="secondary">
              Read All Stories
            </Link>
          </div>
        </div>
        
        {/* Right visual decoration */}
        <div className="right-visual" />
      </div>
    </section>
  )
}
