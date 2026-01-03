-- Allow managing quiz content when the quiz creator is null (guest-mode quizzes)
-- This keeps auth-based policies intact while letting guest-created quizzes add/update options.

-- Clean up in case policies were created manually
DROP POLICY IF EXISTS "Guests can manage options for guest quizzes" ON question_options;
DROP POLICY IF EXISTS "Guests can manage questions for guest quizzes" ON questions;

-- Question options: permit inserts/updates when the parent quiz has no creator
CREATE POLICY "Guests can manage options for guest quizzes" ON question_options
FOR ALL
USING (
  question_id IN (
    SELECT q.id
    FROM questions q
    JOIN quizzes qz ON q.quiz_id = qz.id
    WHERE qz.creator_id IS NULL
  )
)
WITH CHECK (
  question_id IN (
    SELECT q.id
    FROM questions q
    JOIN quizzes qz ON q.quiz_id = qz.id
    WHERE qz.creator_id IS NULL
  )
);

-- Questions: permit inserts/updates when the parent quiz has no creator
CREATE POLICY "Guests can manage questions for guest quizzes" ON questions
FOR ALL
USING (
  quiz_id IN (
    SELECT id FROM quizzes WHERE creator_id IS NULL
  )
)
WITH CHECK (
  quiz_id IN (
    SELECT id FROM quizzes WHERE creator_id IS NULL
  )
);
