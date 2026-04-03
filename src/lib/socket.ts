import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api";
import { API_URL } from "@/constants";

let socket: Socket | null = null;

export function connectSocket() {
  if (socket?.connected) return socket;
  const token = getAccessToken();
  if (!token) return null;

  // In native apps, we need the full URL since there's no Vite proxy
  const opts: any = {
    auth: { token },
    transports: ["websocket", "polling"],
  };

  socket = API_URL ? io(API_URL, opts) : io(opts);

  socket.on("connect", () => console.log("Socket connected"));
  socket.on("disconnect", () => console.log("Socket disconnected"));

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
