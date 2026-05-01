-- Fix player image URLs to use local images instead of external URLs
-- This fixes CORS issues when exporting share cards to PNG

UPDATE players 
SET image_url = '/images/player-harmanpreet.jpg' 
WHERE name ILIKE '%harmanpreet%' 
   OR image_url LIKE '%harmanpreet%';

UPDATE players 
SET image_url = '/images/player-jemimah.jpg' 
WHERE name ILIKE '%jemimah%' 
   OR image_url LIKE '%jemimah%';

UPDATE players 
SET image_url = '/images/player-mithali.jpg' 
WHERE name ILIKE '%mithali%' 
   OR image_url LIKE '%mithali%';

UPDATE players 
SET image_url = '/images/player-smriti.jpg' 
WHERE name ILIKE '%smriti%' 
   OR image_url LIKE '%smriti%';

-- For other players, use placeholder
UPDATE players 
SET image_url = '/placeholder-user.jpg' 
WHERE image_url LIKE 'http%' 
  AND image_url NOT LIKE '/images/%'
  AND image_url NOT LIKE '/placeholder%';

-- Verify the changes
SELECT name, image_url FROM players;
