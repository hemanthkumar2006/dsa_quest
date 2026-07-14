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
