import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface DueReview {
  problem_id: string;
  next_review_date: string;
  interval_index: number;
  title: string;
  region: string;
  difficulty: string;
  primary_pattern: string;
}

function ReviewPage() {
  const { getToken, isSignedIn } = useAuth();
  const [due, setDue] = useState<DueReview[] | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setDue([]);
      return;
    }
    (async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/review`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDue(await res.json());
      }
    })();
  }, [isSignedIn, getToken]);

  return (
    <main>
      <p>
        <Link to="/">Back to map</Link>
      </p>
      <h1>Review — Spaced Repetition Dungeon</h1>

      {!isSignedIn && <p>Sign in to see problems due for review.</p>}

      {isSignedIn && due === null && <p>Loading...</p>}

      {isSignedIn && due !== null && due.length === 0 && (
        <p>Nothing due today — solve more problems to build up your review queue.</p>
      )}

      {due && due.length > 0 && (
        <ul data-testid="review-list">
          {due.map((entry) => (
            <li key={entry.problem_id}>
              <Link to={`/region/${entry.region}/problem/${entry.problem_id}`}>
                {entry.title}
              </Link>
              {" — "}
              {entry.primary_pattern} · due {entry.next_review_date}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default ReviewPage;
