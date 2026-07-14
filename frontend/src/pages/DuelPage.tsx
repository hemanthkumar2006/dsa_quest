import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io, type Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type Status = "idle" | "connecting" | "waiting" | "matched";

interface MatchedEvent {
  duelId: string;
  problemId: string;
}

function DuelPage() {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [match, setMatch] = useState<MatchedEvent | null>(null);
  const [region, setRegion] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!match) return;
    fetch(`${API_URL}/api/problems/${match.problemId}`)
      .then((res) => res.json())
      .then((data) => setRegion(data.region));
  }, [match]);

  const findMatch = () => {
    setStatus("connecting");
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("duel:join_queue");
    });
    socket.on("duel:waiting", () => {
      setStatus("waiting");
    });
    socket.on("duel:matched", (event: MatchedEvent) => {
      setStatus("matched");
      setMatch(event);
    });
  };

  return (
    <main>
      <p>
        <Link to="/">Back to map</Link>
      </p>
      <h1>Duel</h1>

      {status === "idle" && (
        <button type="button" onClick={findMatch}>
          Find Match
        </button>
      )}

      {status === "connecting" && <p>Connecting...</p>}
      {status === "waiting" && <p data-testid="duel-status">Waiting for opponent...</p>}

      {status === "matched" && match && (
        <div data-testid="duel-matched">
          <p>Matched! Duel ID: {match.duelId}</p>
          {region && (
            <p>
              <Link to={`/region/${region}/problem/${match.problemId}`}>
                Go to problem: {match.problemId}
              </Link>
            </p>
          )}
        </div>
      )}
    </main>
  );
}

export default DuelPage;
