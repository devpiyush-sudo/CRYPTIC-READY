import express from "express";
import http from "http";
import { Server } from "socket.io";
import { verifyToken } from "@clerk/express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"].filter(Boolean);

const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });

// online users: userId -> Set of socket ids (one user can have several tabs/devices)
const userSocketMap = new Map();

export function getReceiverSocketIds(userId) {
  return [...(userSocketMap.get(String(userId)) ?? [])];
}

function emitOnlineUsers() {
  io.emit("getOnlineUsers", [...userSocketMap.keys()]);
}

// Only let a socket in if it presents a valid Clerk session token.
// Without this anyone could claim any userId and read that user's messages.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const user = await User.findOne({ clerkId: payload.sub }).select("_id");
    if (!user) return next(new Error("User not found"));

    socket.data.userId = String(user._id);
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const { userId } = socket.data;

  if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
  userSocketMap.get(userId).add(socket.id);

  emitOnlineUsers();

  socket.on("disconnect", () => {
    const sockets = userSocketMap.get(userId);
    sockets?.delete(socket.id);
    if (sockets?.size === 0) userSocketMap.delete(userId);
    emitOnlineUsers();
  });
});

export { app, server, io };
