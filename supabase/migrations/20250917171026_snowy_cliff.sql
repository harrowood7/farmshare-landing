/*
  # Setup authentication and RLS policies for admin access

  1. Security
    - Enable RLS on release_notes table (already enabled)
    - Add policy for authenticated users to manage release notes
    - Ensure public can still read release notes
*/

-- Update the existing policy to allow full CRUD operations for authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to manage posts" ON release_notes;

CREATE POLICY "Allow authenticated users full access to release notes"
  ON release_notes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure public read access is maintained
-- (This policy should already exist from previous migrations)