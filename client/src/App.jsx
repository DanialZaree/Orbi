import { useState, useCallback } from "react"; // 1. Import useCallback
import { useAuth } from "./context/AuthContext.jsx";
import apiClient from "./services/api.js";

import Sidebar from "./components/Sidebar";
import LoginView from "./components/LoginView";
import Welcome from "./components/Welcome";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

export default function App() {
  const { authToken } = useAuth();

  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // --- Optimized Functions ---

  // 2. Wrap handlers in useCallback
  const handleSelectChat = useCallback(async (chatId) => {
    setActiveChatId(chatId);
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/chat/${chatId}`);
      setMessages(response.data.chat.messages);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty array: this function never needs to be re-created

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    setMessages([]);
  }, []); // Empty array: this function also never needs to be re-created

  const handleSendMessage = useCallback(async ({ text, files }) => {
    console.log("Sending files:", files);
    const userMessage = { role: "user", content: [{ type: "text", value: text }] };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiClient.post("/chat", {
        message: text,
        chatId: activeChatId,
        history: messages, // Pass the history before the new user message
      });

      if (!activeChatId) {
        setActiveChatId(response.data.chatId);
        const historyResponse = await apiClient.get("/chat");
        setChatHistory(historyResponse.data.chats);
      }

      const botMessage = { role: "assistant", content: response.data.response };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { role: "assistant", content: [{ type: "text", value: "Sorry, I couldn't get a response. Please try again." }] };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, messages]); // Dependency array: re-create this function only if activeChatId or messages change

  return (
    <div className="relative flex h-screen font-sans text-white bg-dark-bg">
      {authToken && (
        <Sidebar
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
      )}

      <main className="relative flex flex-col flex-1 h-full font-sans">
        <LoginView />

        <div className="flex flex-col items-center flex-1 w-full max-w-3xl mx-auto overflow-hidden">
          <div className="flex-1 max-w-3xl py-4 overflow-y-auto chatwindow">
            {messages.length > 0 || activeChatId ? (
              <ChatWindow messages={messages} isLoading={isLoading} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Welcome />
              </div>
            )}
          </div>
          
          <div className="w-full shrink-0">
            <ChatInput onSendMessage={handleSendMessage} disabled={!authToken || isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}