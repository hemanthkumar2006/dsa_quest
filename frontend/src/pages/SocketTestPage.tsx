import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io, type Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface PongEvent {
  from: string;
  message: string;
}

function SocketTestPage() {
  const socketRef = useRef<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("hello");
  const [log, setLog] = useState<PongEvent[]>([]);

  useEffect(() => {
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setSocketId(socket.id ?? null);
    });
    socket.on("disconnect", () => {
      setConnected(false);
    });
    socket.on("pong", (event: PongEvent) => {
      setLog((prev) => [...prev, event]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendPing = () => {
    socketRef.current?.emit("ping", message);
  };

  return (
    <main>
      <p>
        <Link to="/">Back to map</Link>
      </p>
      <h1>Socket.IO Test</h1>
      <p data-testid="socket-status">
        {connected ? `Connected as ${socketId}` : "Disconnected"}
      </p>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        aria-label="ping message"
      />
      <button type="button" onClick={sendPing} disabled={!connected}>
        Send Ping
      </button>
      <ul data-testid="pong-log">
        {log.map((event, i) => (
          <li key={i}>
            from {event.from}: {event.message}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default SocketTestPage;
