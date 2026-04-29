# Fix Story Share Page — TODO

- [x] Analyze current share page and identify broken JSX / missing closing tags
- [x] Get user approval for plan
- [x] Rewrite `app/stories/[id]/share/page.tsx` with proper tribute-card UI
- [x] Verify build compiles without errors (share page is clean — 4 pre-existing errors in unrelated files)
- [x] Confirm normal story page still shows "Copy Story Link" button (no changes made to it)
- [x] Fix truncated file causing "Unterminated string constant" build error
- [x] Remove unused imports (`toSlug`)
- [x] Run `next build` and confirm zero compilation errors
- [x] Revert CTA to "Share to Instagram" with image download
- [x] Remove "Write Your Own Story" button per user feedback
- [x] Add state-driven reaction buttons (❤️ I felt this / 💔 Not for me) with single-selection logic
- [x] Add emotional line that appears on reaction selection
- [x] Switch image export from `html-to-image` to `html2canvas`
- [x] Create hidden off-screen `capture-card` with simplified styling (no blur/glow/animations)
- [x] Verify build compiles cleanly after all changes
