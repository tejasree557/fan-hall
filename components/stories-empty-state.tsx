import Link from 'next/link'
import { PenLine, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StoriesEmptyStateProps {
  playerName?: string
}

export function StoriesEmptyState({ playerName }: StoriesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-primary" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        No stories yet
      </h3>
      
      <p className="text-muted-foreground max-w-sm mb-6 text-pretty">
        {playerName 
          ? `Be the first fan to write for ${playerName}.`
          : 'Be the first fan to share your story and inspire others.'
        }
      </p>
      
      <Link href="/write">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <PenLine className="w-4 h-4" />
          Write the First Story
        </Button>
      </Link>
    </div>
  )
}
