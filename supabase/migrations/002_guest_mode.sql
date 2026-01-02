-- Migration: Guest Mode Support
-- This migration updates the schema to support guest users without authentication

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Hosts can update their sessions" ON game_sessions;
DROP POLICY IF EXISTS "Hosts can update their game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Hosts can create game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can view active game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can create game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can view game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can update game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Participants can update themselves" ON game_participants;
DROP POLICY IF EXISTS "Participants can update their records" ON game_participants;
DROP POLICY IF EXISTS "Participants can join games" ON game_participants;
DROP POLICY IF EXISTS "Participants can view their game" ON game_participants;
DROP POLICY IF EXISTS "Anyone can join games" ON game_participants;
DROP POLICY IF EXISTS "Anyone can view game participants" ON game_participants;
DROP POLICY IF EXISTS "Anyone can update participants" ON game_participants;

-- Make host_id nullable for guest hosts
ALTER TABLE game_sessions ALTER COLUMN host_id DROP NOT NULL;

-- Make organization_id and creator_id nullable on quizzes
ALTER TABLE quizzes ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE quizzes ALTER COLUMN creator_id DROP NOT NULL;

-- Add creator_name column for display purposes
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS creator_name TEXT NOT NULL DEFAULT 'Anonymous';

-- Remove patient_code column (no longer used)
ALTER TABLE quizzes DROP COLUMN IF EXISTS patient_code;

-- Create permissive policies for game_sessions
CREATE POLICY "Anyone can create game sessions" ON game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view game sessions" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can update game sessions" ON game_sessions FOR UPDATE USING (true);

-- Create permissive policies for game_participants
CREATE POLICY "Anyone can join games" ON game_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view game participants" ON game_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can update participants" ON game_participants FOR UPDATE USING (true);
