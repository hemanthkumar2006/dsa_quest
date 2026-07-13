CREATE TABLE IF NOT EXISTS users (
  clerk_user_id TEXT PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_solved_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solves (
  id SERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL REFERENCES users(clerk_user_id),
  problem_id TEXT NOT NULL,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  region TEXT NOT NULL,
  primary_pattern TEXT NOT NULL,
  secondary_patterns TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL,
  source_sheet TEXT NOT NULL,
  source_url TEXT NOT NULL,
  level_index INTEGER NOT NULL,
  is_boss BOOLEAN NOT NULL DEFAULT false,
  companies_tags TEXT[] NOT NULL DEFAULT '{}',
  statement TEXT NOT NULL,
  hints JSONB NOT NULL DEFAULT '[]',
  srs_interval_days INTEGER[] NOT NULL DEFAULT '{}',
  estimated_time_minutes INTEGER NOT NULL,
  gradable BOOLEAN NOT NULL DEFAULT false,
  sample_input TEXT,
  sample_output TEXT,
  starter_code JSONB,
  test_cases JSONB
);

CREATE TABLE IF NOT EXISTS grimoire (
  id SERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL REFERENCES users(clerk_user_id),
  pattern TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clerk_user_id, pattern)
);
