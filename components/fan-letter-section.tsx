'use client'

import { Quote } from 'lucide-react'

export function FanLetterSection() {
  return (
    <section className="py-20 sm:py-28 bg-secondary/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative text-center">
          {/* Quote Icon */}
          <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
          
          {/* Title */}
          <span className="text-sm uppercase tracking-wider text-primary font-medium">
            A letter from a fan
          </span>
          
          {/* Letter Content */}
          <blockquote className="mt-8 text-xl sm:text-2xl md:text-3xl text-foreground font-serif leading-relaxed text-balance">
            &ldquo;To the women who taught us that dreams have no gender. You stepped onto the field when few believed, 
            and with every boundary, every wicket, every catch, you rewrote our story. 
            You showed little girls they could be heroes too. 
            We don&apos;t just cheer for you — we carry a piece of your courage in our hearts, forever.&rdquo;
          </blockquote>
          
          {/* Author */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold">PH</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">PitchHer Community</p>
              <p className="text-sm text-muted-foreground">Fans across the world</p>
            </div>
          </div>
          
          {/* Decorative line */}
          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="w-16 h-px bg-border" />
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-16 h-px bg-border" />
          </div>
        </div>
      </div>
    </section>
  )
}
