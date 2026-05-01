'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart, Sparkles } from 'lucide-react'
import StoryForm from '@/components/StoryForm'

export default function WriteStoryPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-primary fill-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Thank You!
            </h1>
            <p className="text-muted-foreground mb-8 text-pretty">
              Your message is now part of her story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Button onClick={() => setIsSubmitted(false)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Write Another Story
              </Button>
            </div>
          </div>
        </div>
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
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm uppercase tracking-wider text-primary font-medium">
                Share Your Love
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Write Your Story
            </h1>
            <p className="mt-4 text-muted-foreground text-pretty">
              Share your message, memory, or story about your favorite player. Let them know how they&apos;ve inspired you.
            </p>
          </div>

          {/* Single Centralized Form */}
          <StoryForm onSuccess={() => setIsSubmitted(true)} />

          {/* Note */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            By submitting, you agree that your story may be displayed on the platform.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  )
}
