import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { useAuth } from "@clerk/clerk-react";
import type { Problem } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type Status = "idle" | "connecting" | "waiting" | "matched" | "finished";

interface MatchedEvent {
  duelId: string;
  problemId: string;
}

interface DuelResultEvent {
  duelId: string;
  winner: string;
}

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
] as const;

const DEFAULT_STARTER_CODE: Record<string, string> = {
  javascript: "function solve() {\n  \n}\n",
  python: "def solve():\n    pass\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n\n}\n",
  java: "class Solution {\n    void solve() {\n\n    }\n}\n",
};

type OpponentStatus = "idle" | "typing" | "submitted";

function DuelPage() {
  const { getToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [match, setMatch] = useState<MatchedEvent | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [result, setResult] = useState<DuelResultEvent | null>(null);
  const [opponentStatus, setOpponentStatus] = useState<OpponentStatus>("idle");
  const typingClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingEmit = useRef(0);

  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>(DEFAULT_STARTER_CODE.javascript);
  const [submitting, setSubmitting] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<"pass" | "fail" | null>(null);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!match) return;
    fetch(`${API_URL}/api/problems/${match.problemId}`)
      .then((res) => res.json())
      .then((data: Problem) => {
        setProblem(data);
        const starter = data.starter_code?.[language] ?? DEFAULT_STARTER_CODE[language];
        setCode(starter);
      });
  }, [match]); // eslint-disable-line react-hooks/exhaustive-deps

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
    socket.on("duel:result", (event: DuelResultEvent) => {
      setResult(event);
      setStatus("finished");
    });
    socket.on("duel:opponent_typing", () => {
      setOpponentStatus("typing");
      if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
      typingClearTimer.current = setTimeout(() => setOpponentStatus("idle"), 2000);
    });
    socket.on("duel:opponent_submitted", () => {
      if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
      setOpponentStatus("submitted");
    });
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value ?? "");
    if (!match || !socketRef.current) return;
    const now = Date.now();
    if (now - lastTypingEmit.current > 500) {
      lastTypingEmit.current = now;
      socketRef.current.emit("duel:typing", { duelId: match.duelId });
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(problem?.starter_code?.[newLanguage] ?? DEFAULT_STARTER_CODE[newLanguage]);
  };

  const handleSubmit = async () => {
    if (!match || !socketRef.current) return;
    setSubmitting(true);
    setLastOutcome(null);
    socketRef.current.emit("duel:submitted", { duelId: match.duelId });
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/submit`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          problemId: match.problemId,
          language,
          code,
          duelId: match.duelId,
          socketId: socketRef.current.id,
        }),
      });
      const data = await res.json();
      setLastOutcome(data.overall);
    } finally {
      setSubmitting(false);
    }
  };

  const youWon = result && socketRef.current && result.winner === socketRef.current.id;

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

      {(status === "matched" || status === "finished") && match && problem && (
        <div>
          <p data-testid="duel-status">
            Duel ID: {match.duelId} — vs. an opponent, first correct submission wins
          </p>
          <h2>{problem.title}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{problem.statement}</p>

          <label htmlFor="duel-language-select">Language: </label>
          <select
            id="duel-language-select"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={status === "finished"}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
          <Editor
            height="300px"
            language={language}
            value={code}
            onChange={handleCodeChange}
            options={{ readOnly: status === "finished" }}
          />
          {status === "matched" && opponentStatus !== "idle" && (
            <p data-testid="opponent-status">
              {opponentStatus === "typing" ? "Opponent is typing..." : "Opponent submitted their solution!"}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || status === "finished"}
          >
            {submitting ? "Grading..." : "Submit"}
          </button>

          {lastOutcome && status !== "finished" && (
            <p data-testid="duel-submit-outcome">Your submission: {lastOutcome}</p>
          )}

          {status === "finished" && result && (
            <p data-testid="duel-result">{youWon ? "You won!" : "Opponent won."}</p>
          )}
        </div>
      )}
    </main>
  );
}

export default DuelPage;
