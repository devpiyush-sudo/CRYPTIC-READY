import { useMediaQuery } from "./useMediaQuery";
import { formatMessageTime } from "../lib/utils";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// "John Doe" -> "JD"
export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Adapter: raw API shapes (user + messages) -> the view-model the chat UI renders.
function mapUserToConversation({ user, messages, authUser, onlineUsers }) {
  return {
    id: user._id,
    peer: {
      name: user.fullName,
      subtitle: user.email,
      isOnline: onlineUsers.includes(user._id),
      avatarUrl: user.profilePic,
      initials: getInitials(user.fullName),
    },
    messages: messages.map((message) => ({
      id: message._id,
      role: String(message.senderId) === String(authUser?._id) ? "me" : "them",
      text: message.text || "",
      time: formatMessageTime(message.createdAt),
      createdAt: message.createdAt,
      imageUrl: message.image,
      videoUrl: message.video,
    })),
  };
}

export function useSelectedConversation() {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const users = useChatStore((state) => state.users);
  const messages = useChatStore((state) => state.messages);

  const authUser = useAuthStore((state) => state.authUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const selectedUser = activeConversationId
    ? users.find((user) => user._id === activeConversationId) ||
      conversations.find((user) => user._id === activeConversationId)
    : null;

  const activeConversation = selectedUser
    ? mapUserToConversation({ user: selectedUser, messages, authUser, onlineUsers })
    : null;

  return { activeConversation, activeConversationId, isLargeScreen };
}
