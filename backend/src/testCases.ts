export interface TestCase {
  input: string;
  expected_output: string;
}

export const testCasesByProblemId: Record<string, TestCase[]> = {
  "arr-002": [
    { input: "4\n2 7 11 15\n9", expected_output: "0 1" },
    { input: "3\n3 2 4\n6", expected_output: "1 2" },
    { input: "2\n3 3\n6", expected_output: "0 1" },
  ],
};

export const PISTON_LANGUAGE_VERSIONS: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "20.11.1" },
  python: { language: "python", version: "3.12.0" },
  cpp: { language: "c++", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
};
