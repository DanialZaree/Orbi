import { useEffect, useRef } from "react";
import ChatBubble from "../ChatBubble";
import { SpinnerCustom } from "../ui/spinner";
import homeVideo from "../../assets/green.webm";

// 1. Added onRegenerate to the props
export default function ChatWindow({ messages, isLoading, onRegenerate }) {
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
      className="w-full flex-1 overflow-y-auto p-3 md:p-6 pt-12"
    >
      <div className="mx-auto w-full space-y-6 md:max-w-2xl">
        {messages &&
          messages.map((msg, index) => (
            <ChatBubble
              key={index}
              message={msg}
              // 2. Determine if this is the last message
              isLastMessage={index === messages.length - 1}
              // 3. Pass the function ONLY to the last message
              onRegenerate={
                index === messages.length - 1 ? onRegenerate : undefined
              }
            />
          ))}
        {isLoading && messages && messages.length > 0 && (
          <div className="text-secondary-text flex items-center text-left">
            <video
              src={homeVideo}
              width="65"
              autoPlay
              loop
              muted
              playsInline
            ></video>
            <span className="animate-pulse"> ORBI is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
