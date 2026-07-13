import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import regions from "../data/regions.json";
import type { Problem, Region } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function LevelListPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const region = (regions as Region[]).find((r) => r.id === regionId);
  const [levels, setLevels] = useState<Problem[] | null>(null);

  useEffect(() => {
    if (!regionId) return;
    setLevels(null);
    fetch(`${API_URL}/api/problems?region=${encodeURIComponent(regionId)}`)
      .then((res) => res.json())
      .then((data) => setLevels(data));
  }, [regionId]);

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
      {levels === null ? (
        <p>Loading...</p>
      ) : (
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
      )}
    </main>
  );
}

export default LevelListPage;
