/*
  # Add visibility column to release notes

  1. Changes
    - Add `is_visible` column to `release_notes` table with default value `true`
    - This allows admins to hide release notes from public view while keeping them in the database

  2. Security
    - No changes to existing RLS policies needed
    - Column defaults to visible for backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'release_notes' AND column_name = 'is_visible'
  ) THEN
    ALTER TABLE release_notes ADD COLUMN is_visible boolean DEFAULT true;
  END IF;
END $$;