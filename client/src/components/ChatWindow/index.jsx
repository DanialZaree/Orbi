import { useEffect, useRef } from 'react';
import ChatBubble from '../ChatBubble'; // Assuming you have a ChatBubble component

export default function ChatWindow({ messages, isLoading }) {
  // This ref will be a marker at the end of the message list
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // This effect runs every time the `messages` array changes, ensuring we scroll down
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle the case where the chat is loading for the first time
  if (isLoading && (!messages || messages.length === 0)) {
    return <div className="flex items-center justify-center h-full text-text-muted">Loading chat...</div>;
  }

  return (
    <div className="flex-1 w-full overflow-y-auto p-6 pt-12 ">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Use the messages prop directly. If it's empty, nothing will be rendered. */}
        {messages && messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}

        {/* Show a "thinking" indicator when the bot is replying */}
        {isLoading && messages && messages.length > 0 && (
          <div className="text-left text-secondary-text animate-pulse">ORBI is typing...</div>
        )}

        {/* This empty div is the target for our auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

