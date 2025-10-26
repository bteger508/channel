-- One-Way Updates Database Schema for Supabase
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: update_pages
-- Stores the update pages created by users
-- ============================================
CREATE TABLE IF NOT EXISTS update_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 100),
  publish_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: updates
-- Stores individual updates within pages
-- ============================================
CREATE TABLE IF NOT EXISTS updates (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES update_pages(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reactions_heart INTEGER NOT NULL DEFAULT 0 CHECK (reactions_heart >= 0),
  reactions_pray INTEGER NOT NULL DEFAULT 0 CHECK (reactions_pray >= 0),
  reactions_thumbsup INTEGER NOT NULL DEFAULT 0 CHECK (reactions_thumbsup >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS updates_page_id_idx ON updates(page_id);
CREATE INDEX IF NOT EXISTS updates_timestamp_idx ON updates(timestamp DESC);
CREATE INDEX IF NOT EXISTS update_pages_created_at_idx ON update_pages(created_at DESC);
CREATE INDEX IF NOT EXISTS update_pages_publish_token_idx ON update_pages(publish_token);

-- ============================================
-- ROW LEVEL SECURITY (RLS) Setup
-- ============================================

-- Enable RLS on both tables
ALTER TABLE update_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-runs)
DROP POLICY IF EXISTS "Anyone can read update pages" ON update_pages;
DROP POLICY IF EXISTS "Anyone can create update pages" ON update_pages;
DROP POLICY IF EXISTS "Anyone can read updates" ON updates;
DROP POLICY IF EXISTS "Anyone can create updates" ON updates;
DROP POLICY IF EXISTS "Anyone can update reactions" ON updates;

-- Create public read access policy for update_pages
CREATE POLICY "Anyone can read update pages"
  ON update_pages
  FOR SELECT
  USING (true);

-- Create public insert access policy for update_pages
CREATE POLICY "Anyone can create update pages"
  ON update_pages
  FOR INSERT
  WITH CHECK (true);

-- Create public read access policy for updates
CREATE POLICY "Anyone can read updates"
  ON updates
  FOR SELECT
  USING (true);

-- Create public insert access policy for updates
CREATE POLICY "Anyone can create updates"
  ON updates
  FOR INSERT
  WITH CHECK (true);

-- Create public update access policy for reactions
-- Note: This allows anyone to modify reactions
-- In production, you might want to add rate limiting or user tracking
CREATE POLICY "Anyone can update reactions"
  ON updates
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS for atomic operations
-- ============================================

-- Function to increment a reaction
-- Uses parameterized updates to prevent any SQL injection
CREATE OR REPLACE FUNCTION increment_reaction(
  update_id_param TEXT,
  reaction_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with function owner's permissions
AS $$
BEGIN
  -- Validate reaction_type to prevent invalid values
  IF reaction_type NOT IN ('heart', 'pray', 'thumbsup') THEN
    RAISE EXCEPTION 'Invalid reaction type: %', reaction_type;
  END IF;

  -- Use parameterized CASE to safely update
  CASE reaction_type
    WHEN 'heart' THEN
      UPDATE updates SET reactions_heart = reactions_heart + 1 WHERE id = update_id_param;
    WHEN 'pray' THEN
      UPDATE updates SET reactions_pray = reactions_pray + 1 WHERE id = update_id_param;
    WHEN 'thumbsup' THEN
      UPDATE updates SET reactions_thumbsup = reactions_thumbsup + 1 WHERE id = update_id_param;
  END CASE;

  -- Check if update exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Update not found: %', update_id_param;
  END IF;
END;
$$;

-- Function to decrement a reaction
-- Uses parameterized updates to prevent any SQL injection
CREATE OR REPLACE FUNCTION decrement_reaction(
  update_id_param TEXT,
  reaction_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with function owner's permissions
AS $$
BEGIN
  -- Validate reaction_type to prevent invalid values
  IF reaction_type NOT IN ('heart', 'pray', 'thumbsup') THEN
    RAISE EXCEPTION 'Invalid reaction type: %', reaction_type;
  END IF;

  -- Use parameterized CASE to safely update
  CASE reaction_type
    WHEN 'heart' THEN
      UPDATE updates SET reactions_heart = GREATEST(0, reactions_heart - 1) WHERE id = update_id_param;
    WHEN 'pray' THEN
      UPDATE updates SET reactions_pray = GREATEST(0, reactions_pray - 1) WHERE id = update_id_param;
    WHEN 'thumbsup' THEN
      UPDATE updates SET reactions_thumbsup = GREATEST(0, reactions_thumbsup - 1) WHERE id = update_id_param;
  END CASE;

  -- Check if update exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Update not found: %', update_id_param;
  END IF;
END;
$$;

-- ============================================
-- TRIGGERS for updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pages_updated_at ON update_pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON update_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE!
-- ============================================
-- Your database is now set up and ready to use.
-- Next steps:
-- 1. Get your Project URL and anon key from Settings > API
-- 2. Add them to your .env.local file
-- 3. Start using the Supabase client in your app
