import { pool } from "./db";

export interface DueReview {
  problem_id: string;
  next_review_date: string;
  interval_index: number;
  title: string;
  region: string;
  difficulty: string;
  primary_pattern: string;
}

export async function scheduleAfterSolve(
  clerkUserId: string,
  problemId: string,
  srsIntervalDays: number[]
): Promise<void> {
  if (srsIntervalDays.length === 0) return;

  const existing = await pool.query<{ interval_index: number }>(
    `SELECT interval_index FROM srs_schedule WHERE clerk_user_id = $1 AND problem_id = $2`,
    [clerkUserId, problemId]
  );

  const nextIndex = existing.rows[0]
    ? Math.min(existing.rows[0].interval_index + 1, srsIntervalDays.length - 1)
    : 0;
  const daysAhead = srsIntervalDays[nextIndex];

  await pool.query(
    `INSERT INTO srs_schedule (clerk_user_id, problem_id, interval_index, next_review_date, last_reviewed_at)
     VALUES ($1, $2, $3, CURRENT_DATE + $4::int, now())
     ON CONFLICT (clerk_user_id, problem_id) DO UPDATE SET
       interval_index = EXCLUDED.interval_index,
       next_review_date = EXCLUDED.next_review_date,
       last_reviewed_at = now()`,
    [clerkUserId, problemId, nextIndex, daysAhead]
  );
}

export async function getDueReviews(clerkUserId: string): Promise<DueReview[]> {
  const result = await pool.query<DueReview>(
    `SELECT s.problem_id, s.next_review_date, s.interval_index,
            p.title, p.region, p.difficulty, p.primary_pattern
     FROM srs_schedule s
     JOIN problems p ON p.id = s.problem_id
     WHERE s.clerk_user_id = $1 AND s.next_review_date <= CURRENT_DATE
     ORDER BY s.next_review_date`,
    [clerkUserId]
  );
  return result.rows;
}
