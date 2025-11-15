import { useEffect, useRef } from "react";
import ChatBubble from "../ChatBubble";
import { SpinnerCustom } from "../ui/spinner";

export default function ChatWindow({ messages, isLoading }) {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading && (!messages || messages.length === 0)) {
    return (
      <div className="text-text-muted flex h-full items-center justify-center">
        <SpinnerCustom /> 
      </div>
    );
  }

  return (
    <div
      ref={chatContainerRef}
      className="w-full flex-1 overflow-y-auto p-6 pt-12"
    >
      <div class="mx-auto md:max-w-2xl w-full space-y-6 ">
        {messages &&
          messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))}
        {isLoading && messages && messages.length > 0 && (
          <div className="text-secondary-text animate-pulse text-left">
            ORBI is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
