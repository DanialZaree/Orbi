import { useEffect, useRef } from 'react';
import ChatBubble from '../ChatBubble';

export default function ChatWindow({ messages, isLoading }) {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null); 

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading && (!messages || messages.length === 0)) {
    return <div className="flex items-center justify-center h-full text-text-muted">Loading chat...</div>;
  }

  return (
    <div ref={chatContainerRef} className="flex-1 w-full overflow-y-auto p-6 pt-12 ">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages && messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}
        {isLoading && messages && messages.length > 0 && (
          <div className="text-left text-secondary-text animate-pulse">ORBI is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}