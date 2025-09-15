import ChatBubble from '../ChatBubble'; // 1. Import your new Message component

export default function ChatWindow({ messages, isLoading }) {
  // Placeholder data for demonstration
  const exampleMessages = [
    { role: 'assistant', content: [{ type: 'text', value: 'Hello! How can I assist you today?' }] },
    { role: 'user', content: [{ type: 'text', value: 'Can you tell me a fun fact about space?' }] },
    { role: 'assistant', content: [{ type: 'text', value: 'Of course! Jupiter is so big that all the other planets in our solar system could fit inside it.' }] },
  ];

  // Use the messages prop if it's provided, otherwise use the example data
  const displayMessages = messages && messages.length > 0 ? messages : exampleMessages;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* 2. Map over the list of messages and render a Message component for each one */}
      {displayMessages.map((msg, index) => (
        <ChatBubble key={index} message={msg} />
      ))}

      {/* Optional: Show a "thinking" indicator while waiting for a response */}
      {isLoading && <p className="text-center text-text-muted">Assistant is thinking...</p>}
    </div>
  );
}