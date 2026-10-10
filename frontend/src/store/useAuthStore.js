import { create } from "zustand";
import { io } from "socket.io-client";
import { API_URL, axiosInstance } from "../lib/axios";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  clearAuth: () => {
    get().disconnectSocket();
    set({ authUser: null, isCheckingAuth: false, onlineUsers: [] });
  },

  connectSocket: () => {
    if (get().socket) return; // already connected / connecting

    const socket = io(API_URL || undefined, {
      // a fresh Clerk token is fetched on every (re)connect, so expired tokens never block us
      auth: async (cb) => {
        const token = await window.Clerk?.session?.getToken();
        cb({ token });
      },
    });

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));
    socket.on("connect_error", (err) => console.error("Socket connection error:", err.message));
  },

  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },
}));
