import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface Guild {
  id: number;
  name: string;
  created_by: string;
  created_at: string;
  member_count: number;
}

interface GuildMember {
  clerk_user_id: string;
  current_streak: number;
  duel_wins: number;
  joined_at: string;
}

function GuildsPage() {
  const { getToken, isSignedIn } = useAuth();
  const [guilds, setGuilds] = useState<Guild[] | null>(null);
  const [myGuild, setMyGuild] = useState<{ guild: Guild; members: GuildMember[] } | null>(null);
  const [newGuildName, setNewGuildName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadGuilds = () => {
    fetch(`${API_URL}/api/guilds`)
      .then((res) => res.json())
      .then(setGuilds);
  };

  const loadMyGuild = async () => {
    if (!isSignedIn) return;
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/guilds/me`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) setMyGuild(await res.json());
  };

  useEffect(() => {
    loadGuilds();
    loadMyGuild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const handleCreate = async () => {
    setError(null);
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/guilds`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ name: newGuildName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not create guild");
      return;
    }
    setNewGuildName("");
    loadGuilds();
    loadMyGuild();
  };

  const handleJoin = async (guildId: number) => {
    const token = await getToken();
    await fetch(`${API_URL}/api/guilds/${guildId}/join`, {
      method: "POST",
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    loadGuilds();
    loadMyGuild();
  };

  return (
    <main>
      <p>
        <Link to="/">Back to map</Link>
      </p>
      <h1>Guilds</h1>

      {!isSignedIn && <p>Sign in to create or join a guild.</p>}

      {isSignedIn && myGuild && (
        <div data-testid="my-guild">
          <h2>Your guild: {myGuild.guild.name}</h2>
          <ul>
            {myGuild.members.map((m) => (
              <li key={m.clerk_user_id}>
                {m.clerk_user_id} — streak {m.current_streak}, duel wins {m.duel_wins}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isSignedIn && !myGuild && (
        <div>
          <input
            value={newGuildName}
            onChange={(e) => setNewGuildName(e.target.value)}
            placeholder="Guild name"
            aria-label="guild name"
          />
          <button type="button" onClick={handleCreate}>
            Create Guild
          </button>
          {error && <p data-testid="guild-error">{error}</p>}
        </div>
      )}

      <h2>All Guilds</h2>
      <ul data-testid="guild-list">
        {guilds?.map((g) => (
          <li key={g.id}>
            {g.name} ({g.member_count} members)
            {isSignedIn && !myGuild && (
              <button type="button" onClick={() => handleJoin(g.id)}>
                Join
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default GuildsPage;
