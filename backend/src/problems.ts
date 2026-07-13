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
  hints: { cost: number; text: string }[];
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
