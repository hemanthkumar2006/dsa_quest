import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { pool } from "./db";
import { runOnPiston } from "./piston";
import { PISTON_LANGUAGE_VERSIONS } from "./languages";
import { recordSolve, getStreak } from "./streak";
import { getProblemsByRegion, getProblemById } from "./problems";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(503).json({ status: "error", message: (err as Error).message });
  }
});

app.get("/api/problems", async (req, res) => {
  const region = req.query.region;
  if (typeof region !== "string") {
    res.status(400).json({ error: "region query param is required" });
    return;
  }
  const problems = await getProblemsByRegion(region);
  res.json(problems);
});

app.get("/api/problems/:id", async (req, res) => {
  const problem = await getProblemById(req.params.id);
  if (!problem) {
    res.status(404).json({ error: `Problem ${req.params.id} not found` });
    return;
  }
  res.json(problem);
});

app.post("/api/submit", async (req, res) => {
  const { problemId, language, code } = req.body ?? {};

  if (!problemId || !language || !code) {
    res.status(400).json({ error: "problemId, language, and code are required" });
    return;
  }

  const pistonLanguage = PISTON_LANGUAGE_VERSIONS[language];
  if (!pistonLanguage) {
    res.status(400).json({ error: `Unsupported language: ${language}` });
    return;
  }

  const problem = await getProblemById(problemId);
  const testCases = problem?.test_cases;
  if (!testCases) {
    res.status(404).json({ error: `No test cases for problem ${problemId}` });
    return;
  }

  try {
    const results = await Promise.all(
      testCases.map(async (tc) => {
        const result = await runOnPiston(
          pistonLanguage.language,
          pistonLanguage.version,
          code,
          tc.input
        );
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

    const allPassed = results.every((r) => r.passed);

    const { userId } = getAuth(req);
    let streak: Awaited<ReturnType<typeof recordSolve>> | null = null;
    if (allPassed && userId) {
      streak = await recordSolve(userId, problemId);
    }

    res.json({ overall: allPassed ? "pass" : "fail", results, streak });
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

app.get("/api/streak", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const streak = await getStreak(userId);
  res.json(streak);
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
