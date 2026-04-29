# Share Link Page Redesign — Progress Tracker

## Plan
Redesign `app/stories/[id]/share/page.tsx` from image-generation share page to a **dedicated tribute screen** for when someone receives a shared link.

## Steps
- [x] Step 1: Rewrite `app/stories/[id]/share/page.tsx` with tribute screen design
  - Removed image generation (`toPng`, `preloadImage`, `share` callback, `generating` state)
  - Removed reactions (❤️/💔 buttons, `reaction` state, emotional line)
  - Removed Instagram CTA
  - Added tribute card layout per user spec (`w-full max-w-[420px]`, `bg-white/5`, `backdrop-blur-xl`, cyan border, glow shadow)
  - Added glowing player avatar
  - Added player name (clean, uppercase, cyan, Playfair font)
  - Added horizontal divider
  - Added story content (italic, cinematic, Cormorant font)
  - Added author with country flag
  - Added ❤️ {like_count} loves with proper singular/plural
  - Added "Write Your Own Story" CTA button → links to `/write/{slug}` (with fallback to `/write` if no player)
  - Imported `Link` from `next/link` and `toSlug` from `@/lib/utils`
- [x] Step 2: Verify no broken imports / types — file read back successfully
- [x] Step 3: Confirm visual polish matches product feel — all user design specs applied
