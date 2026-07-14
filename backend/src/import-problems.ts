import "dotenv/config";
import { readFileSync } from "fs";
import { join, resolve } from "path";
import { pool } from "./db";

interface ImportProblem {
  id: string;
  title: string;
  region: string;
  primary_pattern: string;
  secondary_patterns?: string[];
  difficulty: string;
  source_sheet: string;
  source_url: string;
  level_index: number;
  is_boss?: boolean;
  companies_tags?: string[];
  statement: string;
  hints?: { cost: number; text: string }[];
  srs_interval_days?: number[];
  estimated_time_minutes: number;
  gradable?: boolean;
  sample_input?: string | null;
  sample_output?: string | null;
  starter_code?: Record<string, string> | null;
  test_cases?: { input: string; expected_output: string }[] | null;
}

const REQUIRED_FIELDS: (keyof ImportProblem)[] = [
  "id",
  "title",
  "region",
  "primary_pattern",
  "difficulty",
  "source_sheet",
  "source_url",
  "level_index",
  "statement",
  "estimated_time_minutes",
];

function validate(p: Partial<ImportProblem>, index: number): string | null {
  for (const field of REQUIRED_FIELDS) {
    if (p[field] === undefined || p[field] === null || p[field] === "") {
      return `row ${index} (id: ${p.id ?? "?"}) is missing required field "${field}"`;
    }
  }
  return null;
}

/**
 * Bulk-imports problems into Postgres from a JSON file matching DESIGN.md
 * Section 7.2's schema (plus this project's statement/gradable/test_cases
 * extensions). Existing problems (matched by id) are updated in place.
 *
 * Usage: npm run import -- path/to/problems.json
 * With no path given, defaults to seedData/problems.json.
 */
async function importProblems() {
  const filePath = resolve(process.argv[2] ?? join(__dirname, "seedData", "problems.json"));
  const raw = readFileSync(filePath, "utf8");
  const rows: Partial<ImportProblem>[] = JSON.parse(raw);

  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const validationError = validate(row, i);
    if (validationError) {
      errors.push(validationError);
      continue;
    }
    const p = row as ImportProblem;

    try {
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
          p.secondary_patterns ?? [],
          p.difficulty,
          p.source_sheet,
          p.source_url,
          p.level_index,
          p.is_boss ?? false,
          p.companies_tags ?? ["general"],
          p.statement,
          JSON.stringify(p.hints ?? []),
          p.srs_interval_days ?? [1, 3, 7, 21],
          p.estimated_time_minutes,
          p.gradable ?? false,
          p.sample_input ?? null,
          p.sample_output ?? null,
          p.starter_code ? JSON.stringify(p.starter_code) : null,
          p.test_cases ? JSON.stringify(p.test_cases) : null,
        ]
      );
      imported++;
    } catch (err) {
      errors.push(`row ${i} (id: ${p.id}): ${(err as Error).message}`);
    }
  }

  console.log(`Imported ${imported}/${rows.length} problems from ${filePath}`);
  if (errors.length > 0) {
    console.log(`${errors.length} row(s) failed:`);
    for (const e of errors) console.log(`  - ${e}`);
  }

  await pool.end();
  if (errors.length > 0) process.exit(1);
}

importProblems().catch((err) => {
  console.error(err);
  process.exit(1);
});
