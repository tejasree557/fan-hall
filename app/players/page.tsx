"use client"

import { PlayersSection } from "@/components/players-section"

export default function PlayersPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <PlayersSection />
        </div>
      </main>
    </div>
  )
}

