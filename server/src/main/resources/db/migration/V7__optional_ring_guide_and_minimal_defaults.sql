-- Ring-size guide is opt-in. Existing stores remain unchanged except for this new flag.
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS show_ring_size_guide BOOLEAN NOT NULL DEFAULT FALSE;

-- Upgrade only the original unmodified jewelry demo hero from V4.
-- Never replace a seller's published/customized design.
UPDATE store_design
SET template = 'MINIMAL',
    color_mode = 'LIGHT',
    accent_color = '#F4B400',
    design_config = jsonb_set(
      jsonb_set(
        (design_config #- '{sections,0,settings,cutoutImage}' #- '{sections,0,settings,imageUrl}'),
        '{sections,0,variant}', '"fullscreen"'::jsonb, true),
      '{sections,0,settings,overlayOpacity}', '0'::jsonb, true)
WHERE id = 1
  AND template = 'EDITORIAL'
  AND design_config->'sections'->0->'settings'->>'title' = 'MOMENTS, CAPTURED IN METAL';
