-- Crop preferences affect presentation only; original R2 photos are not modified.
ALTER TABLE product ADD COLUMN IF NOT EXISTS image_aspect VARCHAR(12) NOT NULL DEFAULT 'square';
ALTER TABLE product ADD COLUMN IF NOT EXISTS image_fit VARCHAR(12) NOT NULL DEFAULT 'cover';
ALTER TABLE product ADD COLUMN IF NOT EXISTS image_position_x INTEGER NOT NULL DEFAULT 50;
ALTER TABLE product ADD COLUMN IF NOT EXISTS image_position_y INTEGER NOT NULL DEFAULT 50;
ALTER TABLE product ADD COLUMN IF NOT EXISTS image_zoom INTEGER NOT NULL DEFAULT 100;
