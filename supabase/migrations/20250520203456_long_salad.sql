/*
  # Create Release Notes Schema

  1. New Tables
    - `release_notes`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `version` (text, required)
      - `published_at` (timestamp with timezone, required)
      - `created_at` (timestamp with timezone, auto-generated)
      - `updated_at` (timestamp with timezone, auto-generated)

  2. Security
    - Enable RLS on `release_notes` table
    - Add policies for public read access
    - Add policies for authenticated users to manage posts
*/

CREATE TABLE IF NOT EXISTS release_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  version text NOT NULL,
  published_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE release_notes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON release_notes
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage posts
CREATE POLICY "Allow authenticated users to manage posts"
  ON release_notes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_release_notes_updated_at
  BEFORE UPDATE ON release_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();