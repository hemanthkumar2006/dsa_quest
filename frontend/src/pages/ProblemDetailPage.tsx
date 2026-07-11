import { Link, useParams } from "react-router-dom";
import problems from "../data/problems.json";
import type { Problem } from "../types";
import CodeSubmitPanel from "../components/CodeSubmitPanel";

function ProblemDetailPage() {
  const { regionId, problemId } = useParams<{
    regionId: string;
    problemId: string;
  }>();
  const problem = (problems as Problem[]).find((p) => p.id === problemId);

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
      <p>{problem.statement}</p>
      <p>
        <a href={problem.source_url} target="_blank" rel="noreferrer">
          View original on {problem.source_sheet}
        </a>
      </p>
      <CodeSubmitPanel />
    </main>
  );
}

export default ProblemDetailPage;
