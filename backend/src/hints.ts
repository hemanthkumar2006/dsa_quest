import { pool } from "./db";
import { getProblemById } from "./problems";

export interface RevealResult {
  ok: true;
  text: string;
  cost: number;
  hintsRevealed: number;
  currency: number;
}

export interface RevealError {
  ok: false;
  error: string;
}

export async function getHintsRevealedCount(
  clerkUserId: string,
  problemId: string
): Promise<number> {
  const result = await pool.query<{ hints_revealed: number }>(
    `SELECT hints_revealed FROM hint_reveals WHERE clerk_user_id = $1 AND problem_id = $2`,
    [clerkUserId, problemId]
  );
  return result.rows[0]?.hints_revealed ?? 0;
}

export async function revealNextHint(
  clerkUserId: string,
  problemId: string
): Promise<RevealResult | RevealError> {
  const problem = await getProblemById(problemId);
  if (!problem) {
    return { ok: false, error: "Problem not found" };
  }

  const hintsRevealed = await getHintsRevealedCount(clerkUserId, problemId);
  const nextHint = problem.hints[hintsRevealed];
  if (!nextHint) {
    return { ok: false, error: "No more hints for this problem" };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userResult = await client.query<{ currency: number }>(
      `SELECT currency FROM users WHERE clerk_user_id = $1 FOR UPDATE`,
      [clerkUserId]
    );
    const currency = userResult.rows[0]?.currency ?? 0;

    if (currency < nextHint.cost) {
      await client.query("ROLLBACK");
      return { ok: false, error: "Not enough currency for this hint" };
    }

    const updatedUser = await client.query<{ currency: number }>(
      `UPDATE users SET currency = currency - $2 WHERE clerk_user_id = $1 RETURNING currency`,
      [clerkUserId, nextHint.cost]
    );

    await client.query(
      `INSERT INTO hint_reveals (clerk_user_id, problem_id, hints_revealed)
       VALUES ($1, $2, 1)
       ON CONFLICT (clerk_user_id, problem_id)
       DO UPDATE SET hints_revealed = hint_reveals.hints_revealed + 1`,
      [clerkUserId, problemId]
    );

    await client.query("COMMIT");

    return {
      ok: true,
      // getProblemById returns raw, unredacted rows, so text is always present here.
      text: nextHint.text as string,
      cost: nextHint.cost,
      hintsRevealed: hintsRevealed + 1,
      currency: updatedUser.rows[0].currency,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
