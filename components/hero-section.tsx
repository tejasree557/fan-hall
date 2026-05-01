import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { PenLine, Users } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 md:pt-28 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.forbesindia.com/blog/wp-content/uploads/2025/11/AFP2025110282T694P-2025-11-7a61d6833e9b76acf6af90e1d82145ee-3x2.jpg"
          alt="Indian women cricketers celebrating"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/50" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-28 sm:pt-32 md:pt-40">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8">
          For the players who{' '}
          <span className="text-primary bg-gradient-to-r from-primary/20 to-primary/10 px-3 py-1 rounded-full">
            inspired
          </span>{' '}
          us.
        </h1>

        <p className="mt-8 text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          A place where fans share their love and stories for the incredible women who changed Indian cricket forever.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link href="/write">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg gap-2 group"
            >
              <PenLine className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Write something she might read
            </Button>
          </Link>
          <Link href="/players">
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-secondary px-8 py-6 text-lg gap-2 group"
            >
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Explore Players
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground">2.5K+</div>
            <div className="text-sm text-muted-foreground mt-1">Stories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground">50K+</div>
            <div className="text-sm text-muted-foreground mt-1">Fans</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground">15+</div>
            <div className="text-sm text-muted-foreground mt-1">Players</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
