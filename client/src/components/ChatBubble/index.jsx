import { Bot } from "lucide-react";

export default function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-center gap-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex items-center justify-center ">
          <Bot size={20} />
        </div>
      )}
      <div
        className={`max-w-xl md:max-w-2xl px-4 py-3 rounded-2xl rounded-tr-xs ${
          isUser ? "bg-blue-600" : "bg-surface"
        }`}
      >
        {message.content.map((block, index) => (
          <p key={index} className="whitespace-pre-wrap">
            {block.value}
          </p>
        ))}
      </div>
    </div>
  );
}
