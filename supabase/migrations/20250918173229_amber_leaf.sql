/*
  # Add cover image column to release notes

  1. Changes
    - Add `cover_image` column to `release_notes` table
    - Column is optional (nullable) and stores image URLs
*/

ALTER TABLE release_notes 
ADD COLUMN cover_image text;

COMMENT ON COLUMN release_notes.cover_image IS 'Optional custom cover image URL for the release note';