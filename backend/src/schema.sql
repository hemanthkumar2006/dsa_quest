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
