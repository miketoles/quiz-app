-- Add warmup/trivia question support
-- Warmup questions don't count toward scoring or leaderboard stats

-- Add is_warmup column to questions table
ALTER TABLE questions ADD COLUMN is_warmup BOOLEAN DEFAULT false;

-- Add comment explaining the feature
COMMENT ON COLUMN questions.is_warmup IS 'Warmup/trivia questions do not count toward score, streak, or leaderboard stats. Used for fun questions to warm up players before real BIP questions.';
