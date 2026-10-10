import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isSendingMedia: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set({ users: res.data });
        } catch (error) {
          console.error("Error in getUsers:", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/messages/conversations");
          set({ conversations: res.data });
        } catch (error) {
          console.error("Error in getConversations:", error.message);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getMessages: async (userId) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          // ignore the response if the user already switched to another chat
          if (get().activeConversationId === userId) set({ messages: res.data });
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const conversationId = get().activeConversationId;
        if (!conversationId) return false;

        try {
          const res = await axiosInstance.post(`/messages/send/${conversationId}`, messageData);

          if (get().activeConversationId === conversationId) {
            set((state) => ({ messages: [...state.messages, res.data], composerText: "" }));
          }
          get().getConversations();
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
          return false;
        }
      },

      // One listener for the whole chat page: appends to the open chat, and for any
      // other chat shows a toast and refreshes the sidebar order.
      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.on("newMessage", (newMessage) => {
          const { activeConversationId, messages, users, conversations } = get();
          const senderId = String(newMessage.senderId);

          if (senderId === String(activeConversationId)) {
            if (!messages.some((m) => m._id === newMessage._id)) {
              set({ messages: [...messages, newMessage] });
            }
          } else {
            const sender = users.find((u) => u._id === senderId) || conversations.find((u) => u._id === senderId);
            toast(`${sender?.fullName ?? "Someone"}: ${newMessage.text || "sent a photo or video"}`, {
              icon: "💬",
            });
            // the sender might be brand new to us
            if (!sender) get().getUsers();
          }

          get().getConversations();
        });

        // after a dropped connection, catch up on anything we missed
        socket.io.off("reconnect");
        socket.io.on("reconnect", () => {
          get().getConversations();
          const id = get().activeConversationId;
          if (id) get().getMessages(id);
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.io.off("reconnect");
      },

      setActiveConversationId: (activeConversationId) => {
        set({ activeConversationId, messages: [], composerText: "" });
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText) => set({ composerText }),
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      sendTextMessage: async () => {
        const text = get().composerText.trim();
        if (!get().activeConversationId || !text) return false;

        return get().sendMessage({ text });
      },

      sendMediaMessage: async (file) => {
        if (!get().activeConversationId || !file) return false;

        const formData = new FormData();
        formData.append("media", file);

        set({ isSendingMedia: true });
        try {
          return await get().sendMessage(formData);
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "bytechat-storage",
      partialize: (state) => ({ isSoundEnabled: state.isSoundEnabled }),
    },
  ),
);
