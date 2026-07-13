import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface StreakState {
  current_streak: number;
  longest_streak: number;
  last_solved_date: string | null;
  currency: number;
}

function StreakBadge() {
  const { getToken, isSignedIn } = useAuth();
  const [streak, setStreak] = useState<StreakState | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setStreak(null);
      return;
    }

    (async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/streak`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStreak(await res.json());
      }
    })();
  }, [isSignedIn, getToken]);

  if (!isSignedIn || !streak) return null;

  return (
    <p data-testid="streak-badge">
      Streak: {streak.current_streak} day{streak.current_streak === 1 ? "" : "s"} (longest:{" "}
      {streak.longest_streak}) · Currency: {streak.currency}
    </p>
  );
}

export default StreakBadge;
