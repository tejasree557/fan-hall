# Share Experience Fix — COMPLETED ✅

## DELETED (broken /share route & unused components)
- [x] `app/stories/[id]/share/page.tsx` — removed broken 404 route
- [x] `app/stories/[id]/share/` directory — removed
- [x] `components/share-actions-client.tsx` — removed orphaned component
- [x] `components/share-story-card.tsx` — removed unused component
- [x] `components/story-page-actions.tsx` — removed duplicate copy-link component

## EDITED
- [x] `app/stories/[id]/page.tsx` — wrapped story card with `id="story-card"` for html-to-image capture
- [x] `components/story-actions-client.tsx` — 
  - Added "Download Story Image" button (uses `html-to-image` / `toPng`)
  - Added "Copy Story Link" button (copies URL, shows toast)
  - Removed all /share route references
- [x] `components/story-card.tsx` — replaced broken "Open Share Card" menu item with "Copy Story Link"
- [x] `components/stories-section.tsx` — removed broken "Share Image" button that opened /share route
- [x] `app/page.tsx` — fixed `like_count` → `likes` column name mismatch in Supabase query

## VERIFY
- [x] No remaining references to `/stories/{id}/share`
- [x] No remaining references to `like_count` in active code
- [x] All like/love counts use `likes` column consistently

## RESULTING UX
Story detail page (`/stories/:id`) now shows 3 clear actions:
1. **"I felt this"** — toggles like on the story
2. **"Download Story Image"** — captures the `#story-card` element as PNG, no routing, no new tab
3. **"Copy Story Link"** — copies the story URL to clipboard, shows "Link copied!" toast

Story cards in lists show a share menu with only "Copy Story Link".

