import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import { db, schema } from "../db/index.js";
import { eq } from "drizzle-orm";

let io: Server;

export function setupSocketIO(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`Socket connected: ${user.userId}`);

    // Join user's personal room for notifications
    socket.join(`user:${user.userId}`);

    // Join conversation room
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Send message via socket
    socket.on("send_message", async (data: { conversationId: string; text: string }) => {
      try {
        const [msg] = await db.insert(schema.messages).values({
          conversationId: data.conversationId,
          senderId: user.userId,
          text: data.text.trim(),
        }).returning();

        const [sender] = await db.select({ name: schema.users.name, avatarUrl: schema.users.avatarUrl })
          .from(schema.users).where(eq(schema.users.id, user.userId));

        const message = {
          id: msg.id,
          sender: sender.name,
          senderAvatar: sender.avatarUrl,
          senderId: msg.senderId,
          text: msg.text,
          time: msg.createdAt,
          isSystem: false,
        };

        // Broadcast to all in the conversation
        io.to(`conv:${data.conversationId}`).emit("new_message", {
          conversationId: data.conversationId,
          message,
        });
      } catch (err) {
        console.error("Socket send_message error:", err);
      }
    });

    // Pool spot update
    socket.on("join_pool_room", (poolId: string) => {
      socket.join(`pool:${poolId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${user.userId}`);
    });
  });

  return io;
}

export function getIO() { return io; }

export function emitToUser(userId: string, event: string, data: any) {
  if (io) io.to(`user:${userId}`).emit(event, data);
}

export function emitToPool(poolId: string, event: string, data: any) {
  if (io) io.to(`pool:${poolId}`).emit(event, data);
}
