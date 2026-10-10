import { Fragment } from "react";
import useScrollToBottom from "../../hooks/useScrollToBottom";
import { MessageBubble } from "./MessageBubble";
import { NoConversationPlaceholder } from "./NoConversationPlaceholder";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useChatStore } from "../../store/useChatStore";
import { formatDayLabel } from "../../lib/utils";

export function MessageList() {
  const { activeConversation, activeConversationId } = useSelectedConversation();
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);

  const lastMessageId = activeConversation?.messages.at(-1)?.id;
  const messagesScrollRef = useScrollToBottom(activeConversationId, lastMessageId);

  if (!activeConversation) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <NoConversationPlaceholder />
      </div>
    );
  }

  const { messages } = activeConversation;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        ref={messagesScrollRef}
        className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-3 sm:py-4"
      >
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-muted">
            {isMessagesLoading ? "Loading messages..." : `Say hi to ${activeConversation.peer.name} 👋`}
          </p>
        ) : null}

        {messages.map((message, index) => {
          const label = formatDayLabel(message.createdAt);
          const previousLabel = index > 0 ? formatDayLabel(messages[index - 1].createdAt) : null;

          return (
            <Fragment key={message.id}>
              {label !== previousLabel ? (
                <p className="my-3 text-center text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
              ) : null}
              <MessageBubble message={message} />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
