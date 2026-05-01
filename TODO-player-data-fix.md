# Dynamic Players Data Fix TODO

## Information Gathered
- lib/defaultPlayers.ts: Static fallback players
- components/players-section.tsx: Uses getPlayers() but falls back to defaultPlayers
- components/fan-favorites-section.tsx: Uses getPlayers() with fallback
- StoryForm: Loads getPlayers()
- fan-battle-section.tsx: Fetches supabase players directly ✓
- Issue: New players added via AddPlayerModal only in local state (no DB insert)

## Plan
1. Add createPlayer API in lib/api.ts
2. Update AddPlayerModal to call createPlayer → DB insert
3. Remove defaultPlayers fallbacks - always fetch from DB
4. Ensure all sections use getPlayers()

## Dependent Files
- lib/api.ts (add createPlayer)
- components/add-player-modal.tsx (call API)
- components/players-section.tsx (remove fallback)
- components/fan-favorites-section.tsx (remove fallback)

## Follow-up
- Test add player → persists after refresh
- All sections show same players from DB

Confirm to proceed?
