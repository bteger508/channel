-- Migration: Add publish_token to update_pages table
-- Run this in Supabase SQL Editor to add publisher authentication

-- Add publish_token column
ALTER TABLE update_pages
ADD COLUMN IF NOT EXISTS publish_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64');

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS update_pages_publish_token_idx ON update_pages(publish_token);

-- Update RLS policies for updates table
-- Drop old policy
DROP POLICY IF EXISTS "Anyone can create updates" ON updates;

-- Create new policy that requires valid publish token
-- Note: This will be enforced by the application layer
-- RLS still allows creation for now, but app validates token
CREATE POLICY "Anyone can create updates"
  ON updates
  FOR INSERT
  WITH CHECK (true);

-- Note: The actual token validation happens in the application code
-- before calling insertUpdate(). This keeps the database schema simple
-- while allowing the app to enforce publisher-only access.