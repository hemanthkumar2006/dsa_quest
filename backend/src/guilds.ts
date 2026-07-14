import { pool } from "./db";

export interface Guild {
  id: number;
  name: string;
  created_by: string;
  created_at: string;
}

export interface GuildMember {
  clerk_user_id: string;
  current_streak: number;
  duel_wins: number;
  joined_at: string;
}

export async function createGuild(name: string, creatorUserId: string): Promise<Guild> {
  const result = await pool.query<Guild>(
    `INSERT INTO guilds (name, created_by) VALUES ($1, $2) RETURNING *`,
    [name, creatorUserId]
  );
  await joinGuild(result.rows[0].id, creatorUserId);
  return result.rows[0];
}

export async function joinGuild(guildId: number, userId: string): Promise<void> {
  await pool.query(
    `INSERT INTO guild_members (guild_id, clerk_user_id)
     VALUES ($1, $2)
     ON CONFLICT (clerk_user_id) DO UPDATE SET guild_id = EXCLUDED.guild_id, joined_at = now()`,
    [guildId, userId]
  );
}

export async function listGuilds(): Promise<(Guild & { member_count: number })[]> {
  const result = await pool.query<Guild & { member_count: number }>(
    `SELECT g.*, COUNT(gm.clerk_user_id)::int AS member_count
     FROM guilds g
     LEFT JOIN guild_members gm ON gm.guild_id = g.id
     GROUP BY g.id
     ORDER BY g.created_at`
  );
  return result.rows;
}

export async function getMyGuild(
  userId: string
): Promise<{ guild: Guild; members: GuildMember[] } | null> {
  const guildResult = await pool.query<Guild>(
    `SELECT g.* FROM guilds g
     JOIN guild_members gm ON gm.guild_id = g.id
     WHERE gm.clerk_user_id = $1`,
    [userId]
  );
  const guild = guildResult.rows[0];
  if (!guild) return null;

  const membersResult = await pool.query<GuildMember>(
    `SELECT u.clerk_user_id, u.current_streak, u.duel_wins, gm.joined_at
     FROM guild_members gm
     JOIN users u ON u.clerk_user_id = gm.clerk_user_id
     WHERE gm.guild_id = $1
     ORDER BY gm.joined_at`,
    [guild.id]
  );

  return { guild, members: membersResult.rows };
}

export interface LeaderboardEntry {
  clerk_user_id: string;
  current_streak: number;
  duel_wins: number;
  guild_name: string | null;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const result = await pool.query<LeaderboardEntry>(
    `SELECT u.clerk_user_id, u.current_streak, u.duel_wins, g.name AS guild_name
     FROM users u
     LEFT JOIN guild_members gm ON gm.clerk_user_id = u.clerk_user_id
     LEFT JOIN guilds g ON g.id = gm.guild_id
     ORDER BY u.duel_wins DESC, u.current_streak DESC`
  );
  return result.rows;
}
