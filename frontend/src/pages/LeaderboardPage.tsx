import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface LeaderboardEntry {
  clerk_user_id: string;
  current_streak: number;
  duel_wins: number;
  guild_name: string | null;
}

function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/leaderboard`)
      .then((res) => res.json())
      .then(setEntries);
  }, []);

  return (
    <main>
      <p>
        <Link to="/">Back to map</Link>
      </p>
      <h1>Leaderboard</h1>
      <p>Ranked by duel wins, then streak</p>

      {entries === null && <p>Loading...</p>}

      {entries && entries.length === 0 && <p>No players yet.</p>}

      {entries && entries.length > 0 && (
        <table data-testid="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Duel Wins</th>
              <th>Streak</th>
              <th>Guild</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.clerk_user_id}>
                <td>{i + 1}</td>
                <td>{entry.clerk_user_id.slice(0, 14)}...</td>
                <td>{entry.duel_wins}</td>
                <td>{entry.current_streak}</td>
                <td>{entry.guild_name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default LeaderboardPage;
