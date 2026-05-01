import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-12 bg-card border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-foreground">
                Pitch<span className="text-primary">Her</span>
              </span>
            </Link>
            <p className="mt-4 text-muted-foreground max-w-md text-pretty">
              A fan-driven platform celebrating Indian women&apos;s cricket. Share your love, stories, and messages for the players who inspire millions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/players" className="text-muted-foreground hover:text-foreground transition-colors">
                  Players
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/write" className="text-muted-foreground hover:text-foreground transition-colors">
                  Write something she might read
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PitchHer. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> for cricket fans
          </p>
        </div>
      </div>
    </footer>
  )
}
