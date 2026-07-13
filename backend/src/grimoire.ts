import { pool } from "./db";

export interface GrimoireEntry {
  pattern: string;
  problem_id: string;
  unlocked_at: string;
}

export async function recordGrimoireEntry(
  clerkUserId: string,
  pattern: string,
  problemId: string
): Promise<{ isNew: boolean }> {
  const result = await pool.query(
    `INSERT INTO grimoire (clerk_user_id, pattern, problem_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (clerk_user_id, pattern) DO NOTHING
     RETURNING id`,
    [clerkUserId, pattern, problemId]
  );

  return { isNew: (result.rowCount ?? 0) > 0 };
}

export async function getGrimoire(clerkUserId: string): Promise<GrimoireEntry[]> {
  const result = await pool.query<GrimoireEntry>(
    `SELECT pattern, problem_id, unlocked_at
     FROM grimoire WHERE clerk_user_id = $1
     ORDER BY unlocked_at`,
    [clerkUserId]
  );
  return result.rows;
}
