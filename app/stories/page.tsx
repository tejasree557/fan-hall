"use client"

import { StoriesSection } from "@/components/stories-section"

export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <StoriesSection />
        </div>
      </main>
    </div>
  )
}

