import { runOnPiston } from "./piston";

export interface TestResult {
  passed: boolean;
  status: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
}

export async function gradeSubmission(
  language: { language: string; version: string },
  code: string,
  testCases: { input: string; expected_output: string }[]
): Promise<{ results: TestResult[]; allPassed: boolean }> {
  const results = await Promise.all(
    testCases.map(async (tc) => {
      const result = await runOnPiston(language.language, language.version, code, tc.input);
      const actual = (result.run.stdout ?? "").trim();
      const expected = tc.expected_output.trim();
      const compileFailed = !!result.compile && result.compile.code !== 0;
      return {
        passed: !compileFailed && result.run.code === 0 && actual === expected,
        status: compileFailed ? "Compile Error" : result.run.code === 0 ? "Ran" : "Runtime Error",
        stdout: result.run.stdout,
        stderr: result.run.stderr,
        compile_output: result.compile?.stderr ?? null,
      };
    })
  );
  return { results, allPassed: results.every((r) => r.passed) };
}
