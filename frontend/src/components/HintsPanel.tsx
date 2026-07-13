import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { Hint } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface HintsPanelProps {
  problemId: string;
  hints: Hint[];
}

function HintsPanel({ problemId, hints }: HintsPanelProps) {
  const { getToken, isSignedIn } = useAuth();
  const [revealedHints, setRevealedHints] = useState<Hint[]>(hints);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (hints.length === 0) return null;

  const revealedCount = revealedHints.filter((h) => h.text !== null).length;
  const nextHint = revealedHints[revealedCount];

  const handleReveal = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${API_URL}/api/problems/${problemId}/hints/reveal`,
        {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not reveal hint");
        return;
      }
      setRevealedHints((prev) =>
        prev.map((hint, i) => (i === revealedCount ? { ...hint, text: data.text } : hint))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="hints-panel">
      <h2>Hints</h2>
      <ol>
        {revealedHints.map((hint, i) => (
          <li key={i}>
            {hint.text !== null ? hint.text : `Locked (cost: ${hint.cost})`}
          </li>
        ))}
      </ol>
      {!isSignedIn && <p>Sign in to unlock hints.</p>}
      {isSignedIn && nextHint && (
        <button type="button" onClick={handleReveal} disabled={loading}>
          {loading ? "Unlocking..." : `Reveal next hint (cost: ${nextHint.cost})`}
        </button>
      )}
      {error && <p data-testid="hint-error">{error}</p>}
    </div>
  );
}

export default HintsPanel;
