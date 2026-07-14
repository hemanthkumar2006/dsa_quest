import { pool } from "./db";

export const SOLVE_CURRENCY_REWARD = 10;

export interface StreakState {
  current_streak: number;
  longest_streak: number;
  last_solved_date: string | null;
  currency: number;
}

export async function recordSolve(
  clerkUserId: string,
  problemId: string
): Promise<StreakState> {
  const result = await pool.query<StreakState>(
    `INSERT INTO users (clerk_user_id, current_streak, longest_streak, last_solved_date, currency)
     VALUES ($1, 1, 1, CURRENT_DATE, $2)
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
       last_solved_date = CURRENT_DATE,
       currency = users.currency + $2
     RETURNING current_streak, longest_streak, last_solved_date, currency`,
    [clerkUserId, SOLVE_CURRENCY_REWARD]
  );

  await pool.query(
    `INSERT INTO solves (clerk_user_id, problem_id) VALUES ($1, $2)`,
    [clerkUserId, problemId]
  );

  return result.rows[0];
}

/**
 * Called only from the duel-win branch of /api/submit, which always runs
 * after recordSolve() for the same request — so the user row is guaranteed
 * to already exist here.
 */
export async function incrementDuelWins(clerkUserId: string): Promise<void> {
  await pool.query(
    `UPDATE users SET duel_wins = duel_wins + 1 WHERE clerk_user_id = $1`,
    [clerkUserId]
  );
}

export async function getStreak(clerkUserId: string): Promise<StreakState> {
  const result = await pool.query<StreakState>(
    `SELECT current_streak, longest_streak, last_solved_date, currency
     FROM users WHERE clerk_user_id = $1`,
    [clerkUserId]
  );

  return (
    result.rows[0] ?? {
      current_streak: 0,
      longest_streak: 0,
      last_solved_date: null,
      currency: 0,
    }
  );
}
