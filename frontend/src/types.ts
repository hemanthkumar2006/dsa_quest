export interface Region {
  id: string;
  order: number;
  name: string;
  pattern: string;
  available: boolean;
}

export interface Hint {
  cost: number;
  text: string | null;
}

export interface Problem {
  id: string;
  title: string;
  region: string;
  primary_pattern: string;
  secondary_patterns: string[];
  difficulty: "easy" | "medium" | "hard";
  source_sheet: string;
  source_url: string;
  level_index: number;
  is_boss: boolean;
  companies_tags: string[];
  statement: string;
  hints: Hint[];
  srs_interval_days: number[];
  estimated_time_minutes: number;
  gradable?: boolean;
  sample_input?: string;
  sample_output?: string;
  starter_code?: Record<string, string>;
}
