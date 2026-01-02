-- Quiz App Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('bcba', 'rbt', 'admin');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false');
CREATE TYPE game_status AS ENUM ('lobby', 'active', 'question', 'results', 'finished');

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role user_role DEFAULT 'rbt',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- User settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  default_time_limit INTEGER DEFAULT 20,
  default_speed_scoring BOOLEAN DEFAULT true,
  default_points_per_question INTEGER DEFAULT 1000,
  default_auto_advance BOOLEAN DEFAULT false
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  patient_code TEXT,
  share_code TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  time_limit INTEGER DEFAULT 20,
  speed_scoring BOOLEAN DEFAULT true,
  points_per_question INTEGER DEFAULT 1000,
  auto_advance BOOLEAN DEFAULT false
);

CREATE INDEX idx_quizzes_organization ON quizzes(organization_id);
CREATE INDEX idx_quizzes_creator ON quizzes(creator_id);
CREATE INDEX idx_quizzes_share_code ON quizzes(share_code);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type question_type DEFAULT 'multiple_choice',
  question_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  time_limit_override INTEGER
);

CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_questions_order ON questions(quiz_id, order_index);

-- Question options table
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL
);

CREATE INDEX idx_question_options_question ON question_options(question_id);

-- Game sessions table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  host_id UUID NOT NULL REFERENCES profiles(id),
  game_pin TEXT UNIQUE NOT NULL,
  status game_status DEFAULT 'lobby',
  current_question_index INTEGER DEFAULT -1,
  question_started_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  time_limit INTEGER NOT NULL,
  speed_scoring BOOLEAN NOT NULL,
  points_per_question INTEGER NOT NULL,
  auto_advance BOOLEAN NOT NULL,
  winner_id UUID REFERENCES profiles(id)
);

CREATE INDEX idx_game_sessions_pin ON game_sessions(game_pin);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_quiz ON game_sessions(quiz_id);

-- Game participants table
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  nickname TEXT NOT NULL,
  avatar_base TEXT NOT NULL,
  avatar_accessory TEXT,
  total_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_session_id, nickname)
);

CREATE INDEX idx_game_participants_session ON game_participants(game_session_id);
CREATE INDEX idx_game_participants_user ON game_participants(user_id);

-- Question responses table
CREATE TABLE question_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES game_participants(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  user_id UUID REFERENCES profiles(id),
  selected_option_id UUID REFERENCES question_options(id),
  is_correct BOOLEAN DEFAULT false,
  response_time_ms INTEGER NOT NULL,
  points_awarded INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, question_id)
);

CREATE INDEX idx_question_responses_session ON question_responses(game_session_id);
CREATE INDEX idx_question_responses_participant ON question_responses(participant_id);
CREATE INDEX idx_question_responses_question ON question_responses(question_id);
CREATE INDEX idx_question_responses_user ON question_responses(user_id);

-- Leaderboard entries table
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  total_games_played INTEGER DEFAULT 0,
  total_games_won INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_leaderboard_org_points ON leaderboard_entries(organization_id, total_points DESC);

-- Player registry table (for nickname mapping)
CREATE TABLE player_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  real_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_player_registry_org ON player_registry(organization_id);
CREATE INDEX idx_player_registry_name ON player_registry(real_name);

-- Nickname mappings table
CREATE TABLE nickname_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES player_registry(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, nickname)
);

CREATE INDEX idx_nickname_mappings_player ON nickname_mappings(player_id);
CREATE INDEX idx_nickname_mappings_nickname ON nickname_mappings(nickname);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quizzes updated_at
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE nickname_mappings ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can view their own organization
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Profiles: Users can view profiles in their organization
CREATE POLICY "Users can view profiles in their org" ON profiles
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- User settings: Users can manage their own settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Quizzes: Users can view quizzes in their organization
CREATE POLICY "Users can view org quizzes" ON quizzes
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- BCBAs can create/update quizzes
CREATE POLICY "BCBAs can create quizzes" ON quizzes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('bcba', 'admin')
      AND organization_id = quizzes.organization_id
    )
  );

CREATE POLICY "BCBAs can update own quizzes" ON quizzes
  FOR UPDATE USING (
    creator_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('bcba', 'admin'))
  );

CREATE POLICY "BCBAs can delete own quizzes" ON quizzes
  FOR DELETE USING (
    creator_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('bcba', 'admin'))
  );

-- Questions: Follow quiz permissions
CREATE POLICY "Users can view questions for viewable quizzes" ON questions
  FOR SELECT USING (
    quiz_id IN (SELECT id FROM quizzes)
  );

CREATE POLICY "BCBAs can manage questions" ON questions
  FOR ALL USING (
    quiz_id IN (
      SELECT id FROM quizzes
      WHERE creator_id = auth.uid()
    )
  );

-- Question options: Follow question permissions
CREATE POLICY "Users can view options for viewable questions" ON question_options
  FOR SELECT USING (
    question_id IN (SELECT id FROM questions)
  );

CREATE POLICY "BCBAs can manage options" ON question_options
  FOR ALL USING (
    question_id IN (
      SELECT q.id FROM questions q
      JOIN quizzes qz ON q.quiz_id = qz.id
      WHERE qz.creator_id = auth.uid()
    )
  );

-- Game sessions: Viewable by org members, manageable by host
CREATE POLICY "Users can view org game sessions" ON game_sessions
  FOR SELECT USING (
    quiz_id IN (SELECT id FROM quizzes)
  );

CREATE POLICY "BCBAs can create game sessions" ON game_sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('bcba', 'admin'))
  );

CREATE POLICY "Hosts can update their sessions" ON game_sessions
  FOR UPDATE USING (host_id = auth.uid());

-- Game participants: Anyone can join (for guest players)
CREATE POLICY "Anyone can view participants" ON game_participants
  FOR SELECT USING (true);

CREATE POLICY "Anyone can join games" ON game_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants can update themselves" ON game_participants
  FOR UPDATE USING (
    user_id = auth.uid() OR
    game_session_id IN (SELECT id FROM game_sessions WHERE host_id = auth.uid())
  );

-- Question responses: Participants and hosts can manage
CREATE POLICY "Users can view responses" ON question_responses
  FOR SELECT USING (
    game_session_id IN (SELECT id FROM game_sessions)
  );

CREATE POLICY "Anyone can submit responses" ON question_responses
  FOR INSERT WITH CHECK (true);

-- Leaderboard: Viewable by org members
CREATE POLICY "Users can view org leaderboard" ON leaderboard_entries
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "System can update leaderboard" ON leaderboard_entries
  FOR ALL USING (true);

-- Player registry: BCBAs can manage
CREATE POLICY "Users can view player registry" ON player_registry
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "BCBAs can manage player registry" ON player_registry
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('bcba', 'admin'))
  );

-- Nickname mappings: BCBAs can manage
CREATE POLICY "Users can view nickname mappings" ON nickname_mappings
  FOR SELECT USING (
    player_id IN (SELECT id FROM player_registry)
  );

CREATE POLICY "BCBAs can manage nickname mappings" ON nickname_mappings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('bcba', 'admin'))
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'rbt')
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for game tables
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE game_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE question_responses;
