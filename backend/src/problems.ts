import { pool } from "./db";

export interface DbProblem {
  id: string;
  title: string;
  region: string;
  primary_pattern: string;
  secondary_patterns: string[];
  difficulty: string;
  source_sheet: string;
  source_url: string;
  level_index: number;
  is_boss: boolean;
  companies_tags: string[];
  statement: string;
  hints: { cost: number; text: string | null }[];
  srs_interval_days: number[];
  estimated_time_minutes: number;
  gradable: boolean;
  sample_input: string | null;
  sample_output: string | null;
  starter_code: Record<string, string> | null;
  test_cases: { input: string; expected_output: string }[] | null;
}

export async function getProblemsByRegion(region: string): Promise<DbProblem[]> {
  const result = await pool.query<DbProblem>(
    `SELECT * FROM problems WHERE region = $1 ORDER BY level_index`,
    [region]
  );
  return result.rows;
}

export async function getProblemById(id: string): Promise<DbProblem | null> {
  const result = await pool.query<DbProblem>(
    `SELECT * FROM problems WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getRandomGradableProblemId(): Promise<string | null> {
  const result = await pool.query<{ id: string }>(
    `SELECT id FROM problems WHERE gradable = true ORDER BY random() LIMIT 1`
  );
  return result.rows[0]?.id ?? null;
}

/**
 * Hints are paid, progressive reveals — strip text for hints beyond what
 * this user has already unlocked so the API response doesn't leak them for free.
 */
export function redactHints<T extends DbProblem>(
  problem: T,
  hintsRevealed: number
): T {
  return {
    ...problem,
    hints: problem.hints.map((hint, i) => ({
      cost: hint.cost,
      text: i < hintsRevealed ? hint.text : null,
    })),
  } as T;
}
