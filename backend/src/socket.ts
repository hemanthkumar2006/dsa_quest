import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { joinQueue, leaveQueue, getDuel, getOpponentSocketId } from "./duel";

export function attachSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("ping", (message: string) => {
      io.emit("pong", { from: socket.id, message });
    });

    socket.on("duel:join_queue", async () => {
      const match = await joinQueue(socket.id);
      if (!match) {
        socket.emit("duel:waiting");
        return;
      }
      io.to(match.player1).to(match.player2).emit("duel:matched", {
        duelId: match.duelId,
        problemId: match.problemId,
      });
    });

    socket.on("duel:typing", async ({ duelId }: { duelId: string }) => {
      const duel = await getDuel(duelId);
      const opponent = duel && getOpponentSocketId(duel, socket.id);
      if (opponent) io.to(opponent).emit("duel:opponent_typing");
    });

    socket.on("duel:submitted", async ({ duelId }: { duelId: string }) => {
      const duel = await getDuel(duelId);
      const opponent = duel && getOpponentSocketId(duel, socket.id);
      if (opponent) io.to(opponent).emit("duel:opponent_submitted");
    });

    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      await leaveQueue(socket.id);
    });
  });

  return io;
}
