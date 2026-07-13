import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Problem } from "../types";
import CodeSubmitPanel from "../components/CodeSubmitPanel";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function ProblemDetailPage() {
  const { regionId, problemId } = useParams<{
    regionId: string;
    problemId: string;
  }>();
  const [problem, setProblem] = useState<Problem | null | undefined>(undefined);

  useEffect(() => {
    if (!problemId) return;
    setProblem(undefined);
    fetch(`${API_URL}/api/problems/${encodeURIComponent(problemId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProblem(data));
  }, [problemId]);

  if (problem === undefined) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  if (!problem) {
    return (
      <main>
        <p>Problem not found.</p>
        <Link to={`/region/${regionId}`}>Back to level list</Link>
      </main>
    );
  }

  return (
    <main>
      <p>
        <Link to={`/region/${regionId}`}>Back to level list</Link>
      </p>
      <h1>{problem.title}</h1>
      <p>
        Difficulty: {problem.difficulty} · Pattern: {problem.primary_pattern}
      </p>
      <p style={{ whiteSpace: "pre-wrap" }}>{problem.statement}</p>
      {problem.sample_input && problem.sample_output && (
        <div>
          <p>Example</p>
          <pre>Input:{"\n"}{problem.sample_input}</pre>
          <pre>Output:{"\n"}{problem.sample_output}</pre>
        </div>
      )}
      <p>
        <a href={problem.source_url} target="_blank" rel="noreferrer">
          View original on {problem.source_sheet}
        </a>
      </p>
      <CodeSubmitPanel problem={problem} />
    </main>
  );
}

export default ProblemDetailPage;
