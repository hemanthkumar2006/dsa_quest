import { Link, useParams } from "react-router-dom";
import problems from "../data/problems.json";
import regions from "../data/regions.json";
import type { Problem, Region } from "../types";

function LevelListPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const region = (regions as Region[]).find((r) => r.id === regionId);
  const levels = (problems as Problem[])
    .filter((p) => p.region === regionId)
    .sort((a, b) => a.level_index - b.level_index);

  if (!region) {
    return (
      <main>
        <p>Region not found.</p>
        <Link to="/">Back to map</Link>
      </main>
    );
  }

  return (
    <main>
      <p>
        <Link to="/">Back to map</Link>
      </p>
      <h1>{region.name}</h1>
      <p>{region.pattern}</p>
      <ol>
        {levels.map((problem) => (
          <li key={problem.id}>
            <Link to={`/region/${regionId}/problem/${problem.id}`}>
              {problem.title}
            </Link>
            {" — "}
            {problem.difficulty}
          </li>
        ))}
      </ol>
    </main>
  );
}

export default LevelListPage;
