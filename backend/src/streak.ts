import { pool } from "./db";

export interface StreakState {
  current_streak: number;
  longest_streak: number;
  last_solved_date: string | null;
}

export async function recordSolve(
  clerkUserId: string,
  problemId: string
): Promise<StreakState> {
  const result = await pool.query<StreakState>(
    `INSERT INTO users (clerk_user_id, current_streak, longest_streak, last_solved_date)
     VALUES ($1, 1, 1, CURRENT_DATE)
     ON CONFLICT (clerk_user_id) DO UPDATE SET
       current_streak = CASE
         WHEN users.last_solved_date = CURRENT_DATE THEN users.current_streak
         WHEN users.last_solved_date = CURRENT_DATE - INTERVAL '1 day' THEN users.current_streak + 1
         ELSE 1
       END,
       longest_streak = GREATEST(users.longest_streak, CASE
         WHEN users.last_solved_date = CURRENT_DATE THEN users.current_streak
         WHEN users.last_solved_date = CURRENT_DATE - INTERVAL '1 day' THEN users.current_streak + 1
         ELSE 1
       END),
       last_solved_date = CURRENT_DATE
     RETURNING current_streak, longest_streak, last_solved_date`,
    [clerkUserId]
  );

  await pool.query(
    `INSERT INTO solves (clerk_user_id, problem_id) VALUES ($1, $2)`,
    [clerkUserId, problemId]
  );

  return result.rows[0];
}

export async function getStreak(clerkUserId: string): Promise<StreakState> {
  const result = await pool.query<StreakState>(
    `SELECT current_streak, longest_streak, last_solved_date
     FROM users WHERE clerk_user_id = $1`,
    [clerkUserId]
  );

  return result.rows[0] ?? { current_streak: 0, longest_streak: 0, last_solved_date: null };
}
