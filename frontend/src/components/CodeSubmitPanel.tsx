import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useAuth } from "@clerk/clerk-react";
import type { Problem } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
] as const;

const DEFAULT_STARTER_CODE: Record<string, string> = {
  javascript: "function solve() {\n  \n}\n",
  python: "def solve():\n    pass\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n\n}\n",
  java: "class Solution {\n    void solve() {\n\n    }\n}\n",
};

interface TestResult {
  passed: boolean;
  status: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
}

interface SubmitResponse {
  overall: "pass" | "fail";
  results: TestResult[];
  streak: { current_streak: number; longest_streak: number } | null;
}

interface CodeSubmitPanelProps {
  problem: Problem;
}

function CodeSubmitPanel({ problem }: CodeSubmitPanelProps) {
  const { getToken } = useAuth();
  const starterFor = (lang: string) =>
    problem.starter_code?.[lang] ?? DEFAULT_STARTER_CODE[lang];

  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>(starterFor("javascript"));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(starterFor(newLanguage));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    console.log("Submitted code:", code);
    console.log("Selected language:", language);

    if (!problem.gradable) {
      return;
    }

    setSubmitting(true);
    setResult(null);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/submit`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ problemId: problem.id, language, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <label htmlFor="language-select">Language: </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.label}
          </option>
        ))}
      </select>
      <Editor
        height="300px"
        language={language}
        value={code}
        onChange={(value) => setCode(value ?? "")}
      />
      <button type="button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Grading..." : "Submit"}
      </button>

      {error && <p data-testid="submit-error">Error: {error}</p>}

      {result && (
        <div data-testid="submit-result">
          <p>
            Result: <strong>{result.overall}</strong>
          </p>
          <ol>
            {result.results.map((r, i) => (
              <li key={i}>
                Test {i + 1}: {r.passed ? "passed" : "failed"} ({r.status})
              </li>
            ))}
          </ol>
          {result.streak && (
            <p data-testid="streak-update">
              Streak: {result.streak.current_streak} day
              {result.streak.current_streak === 1 ? "" : "s"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CodeSubmitPanel;
