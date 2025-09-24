import { useRef, useEffect } from 'react';
import ChatBubble from '../ChatBubble';


export default function ChatWindow({ messages, isLoading }) {
  const displayMessages = messages && messages.length > 0 ? messages : exampleMessages;
  const chatWindowRef = useRef(null); // Add a ref to access the chat window element

  useEffect(() => {
    // Scroll to the bottom after every render
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: 'smooth', // Optional: for smooth scrolling
      });
    }
  }, [displayMessages]); // Add displayMessages to the dependency array


  return (
    <div className="flex-1 max-w-3xl px-4 space-y-6 overflow-y-auto" ref={chatWindowRef}>
      {displayMessages.map((msg, index) => (
        <ChatBubble key={index} message={msg} />
      ))}

      {isLoading && <div className=" text-secondary-text">ORBI is typing...</div>}
    </div>
  );
}