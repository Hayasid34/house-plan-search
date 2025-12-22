-- Add thumbnail_url column to plans table
-- Migration: 002_add_thumbnail_url
-- Date: 2025-11-12

-- Add thumbnail_url column to store thumbnail image URLs
ALTER TABLE plans ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN plans.thumbnail_url IS 'URL of the thumbnail image generated from the PDF';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_plans_thumbnail_url ON plans(thumbnail_url);
