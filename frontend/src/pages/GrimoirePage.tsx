import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface GrimoireEntry {
  pattern: string;
  problem_id: string;
  unlocked_at: string;
}

function GrimoirePage() {
  const { getToken, isSignedIn } = useAuth();
  const [entries, setEntries] = useState<GrimoireEntry[] | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setEntries([]);
      return;
    }
    (async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/grimoire`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEntries(await res.json());
      }
    })();
  }, [isSignedIn, getToken]);

  return (
    <main>
      <p>
        <Link to="/">Back to map</Link>
      </p>
      <h1>Pattern Grimoire</h1>

      {!isSignedIn && <p>Sign in to start collecting patterns.</p>}

      {isSignedIn && entries === null && <p>Loading...</p>}

      {isSignedIn && entries !== null && entries.length === 0 && (
        <p>No patterns unlocked yet — solve a problem to add your first entry.</p>
      )}

      {entries && entries.length > 0 && (
        <ul data-testid="grimoire-list">
          {entries.map((entry) => (
            <li key={entry.pattern}>
              <strong>{entry.pattern}</strong> — unlocked via {entry.problem_id}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default GrimoirePage;
