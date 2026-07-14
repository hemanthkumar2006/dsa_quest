import { randomUUID } from "crypto";
import { redis } from "./redis";
import { getRandomGradableProblemId } from "./problems";

const QUEUE_KEY = "duel:queue";

export interface DuelMatch {
  duelId: string;
  problemId: string;
  player1: string;
  player2: string;
}

/**
 * Pairs the given socket with whoever is waiting in the queue. If no one is
 * waiting (or no gradable problem exists to assign), the socket is queued
 * and null is returned.
 */
export async function joinQueue(socketId: string): Promise<DuelMatch | null> {
  const waitingPlayer = await redis.lpop(QUEUE_KEY);

  if (!waitingPlayer || waitingPlayer === socketId) {
    await redis.rpush(QUEUE_KEY, socketId);
    return null;
  }

  const problemId = await getRandomGradableProblemId();
  if (!problemId) {
    await redis.rpush(QUEUE_KEY, waitingPlayer);
    return null;
  }

  const duelId = randomUUID();
  await redis.hset(`duel:${duelId}`, {
    player1: waitingPlayer,
    player2: socketId,
    problemId,
    status: "active",
    createdAt: Date.now(),
  });
  await redis.set(`duel:socket:${waitingPlayer}`, duelId);
  await redis.set(`duel:socket:${socketId}`, duelId);

  return { duelId, problemId, player1: waitingPlayer, player2: socketId };
}

export async function leaveQueue(socketId: string): Promise<void> {
  await redis.lrem(QUEUE_KEY, 0, socketId);
}

export interface DuelState {
  player1: string;
  player2: string;
  problemId: string;
  status: string;
  winner: string | null;
}

export async function getDuel(duelId: string): Promise<DuelState | null> {
  const data = await redis.hgetall(`duel:${duelId}`);
  if (!data.player1) return null;
  return {
    player1: data.player1,
    player2: data.player2,
    problemId: data.problemId,
    status: data.status,
    winner: data.winner ?? null,
  };
}

/**
 * Atomically claims the win for this duel. HSETNX only sets the field if it
 * doesn't already exist, so concurrent winning submissions from both players
 * can't both succeed — Redis executes each command sequentially.
 */
export async function tryDeclareWinner(
  duelId: string,
  socketId: string
): Promise<boolean> {
  const result = await redis.hsetnx(`duel:${duelId}`, "winner", socketId);
  return result === 1;
}
