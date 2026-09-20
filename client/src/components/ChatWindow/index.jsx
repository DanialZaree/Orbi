import { useEffect, useRef, memo } from "react";
import ChatBubble from "../ChatBubble";
import { SpinnerCustom } from "../ui/spinner";
import homeVideo from "../../assets/green.webm";

function ChatWindow({ messages, isLoading, onRegenerate }) {
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [messages]);

  if (isLoading && (!messages || messages.length === 0)) {
    return (
      <div className="text-text-muted flex h-full items-center justify-center">
        <SpinnerCustom />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 overflow-y-auto p-3 md:p-6 pt-12">
      <div className="mx-auto w-full space-y-6 md:max-w-2xl">
        {messages?.map((msg, index) => {
          const isLast = index === messages.length - 1;
          return (
            <ChatBubble
              key={msg._id || `${msg.role}-${index}`}
              message={msg}
              isLastMessage={isLast}
              onRegenerate={isLast ? onRegenerate : undefined}
            />
          );
        })}
        {isLoading && messages?.length > 0 && (
          <div className="text-secondary-text flex items-center text-left">
            <video
              src={homeVideo}
              width="65"
              autoPlay
              loop
              muted
              playsInline
            />
            <span className="animate-pulse ml-2">Orbi is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default memo(ChatWindow);
