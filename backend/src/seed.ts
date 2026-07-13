import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { pool } from "./db";

interface SeedProblem {
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

async function seed() {
  const raw = readFileSync(join(__dirname, "seedData", "problems.json"), "utf8");
  const problems: SeedProblem[] = JSON.parse(raw);

  for (const p of problems) {
    await pool.query(
      `INSERT INTO problems (
         id, title, region, primary_pattern, secondary_patterns, difficulty,
         source_sheet, source_url, level_index, is_boss, companies_tags,
         statement, hints, srs_interval_days, estimated_time_minutes,
         gradable, sample_input, sample_output, starter_code, test_cases
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         region = EXCLUDED.region,
         primary_pattern = EXCLUDED.primary_pattern,
         secondary_patterns = EXCLUDED.secondary_patterns,
         difficulty = EXCLUDED.difficulty,
         source_sheet = EXCLUDED.source_sheet,
         source_url = EXCLUDED.source_url,
         level_index = EXCLUDED.level_index,
         is_boss = EXCLUDED.is_boss,
         companies_tags = EXCLUDED.companies_tags,
         statement = EXCLUDED.statement,
         hints = EXCLUDED.hints,
         srs_interval_days = EXCLUDED.srs_interval_days,
         estimated_time_minutes = EXCLUDED.estimated_time_minutes,
         gradable = EXCLUDED.gradable,
         sample_input = EXCLUDED.sample_input,
         sample_output = EXCLUDED.sample_output,
         starter_code = EXCLUDED.starter_code,
         test_cases = EXCLUDED.test_cases`,
      [
        p.id,
        p.title,
        p.region,
        p.primary_pattern,
        p.secondary_patterns,
        p.difficulty,
        p.source_sheet,
        p.source_url,
        p.level_index,
        p.is_boss,
        p.companies_tags,
        p.statement,
        JSON.stringify(p.hints),
        p.srs_interval_days,
        p.estimated_time_minutes,
        p.gradable,
        p.sample_input,
        p.sample_output,
        p.starter_code ? JSON.stringify(p.starter_code) : null,
        p.test_cases ? JSON.stringify(p.test_cases) : null,
      ]
    );
  }

  console.log(`Seeded ${problems.length} problems.`);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
