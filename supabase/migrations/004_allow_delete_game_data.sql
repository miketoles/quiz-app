-- Allow deleting game data (sessions, participants, responses) so dev force-delete can cascade quizzes

-- Game sessions: allow delete
DROP POLICY IF EXISTS "Anyone can delete game sessions" ON game_sessions;
CREATE POLICY "Anyone can delete game sessions" ON game_sessions
FOR DELETE USING (true);

-- Game participants: allow delete
DROP POLICY IF EXISTS "Anyone can delete game participants" ON game_participants;
CREATE POLICY "Anyone can delete game participants" ON game_participants
FOR DELETE USING (true);

-- Question responses: allow delete
DROP POLICY IF EXISTS "Anyone can delete question responses" ON question_responses;
CREATE POLICY "Anyone can delete question responses" ON question_responses
FOR DELETE USING (true);

