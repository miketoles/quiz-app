-- Allow deleting game data (sessions, participants, responses) so dev force-delete can cascade quizzes

-- Game sessions: allow delete
CREATE POLICY IF NOT EXISTS "Anyone can delete game sessions" ON game_sessions
FOR DELETE USING (true);

-- Game participants: allow delete
CREATE POLICY IF NOT EXISTS "Anyone can delete game participants" ON game_participants
FOR DELETE USING (true);

-- Question responses: allow delete
CREATE POLICY IF NOT EXISTS "Anyone can delete question responses" ON question_responses
FOR DELETE USING (true);

