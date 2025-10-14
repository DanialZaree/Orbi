import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import apiClient from "./services/api.js";
import { useLocation, useRoute } from "wouter";
import Sidebar from "./components/Sidebar";
import Welcome from "./components/Welcome";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

export default function App() {
  const { authToken } = useAuth();
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/:chatId");

  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (authToken) {
      const fetchHistory = async () => {
        try {
          const response = await apiClient.get("/chat");
          setChatHistory(response.data.chats);
        } catch (error) {
          console.error("Failed to fetch initial chat history:", error);
        }
      };
      fetchHistory();
    }
  }, [authToken]);

  useEffect(() => {
    if (match && params.chatId) {
      if (params.chatId !== activeChatId) {
        handleSelectChat(params.chatId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, params?.chatId]);


  const handleSelectChat = useCallback(async (chatId) => {
    if (!chatId) return;
    setActiveChatId(chatId);
    setLocation(`/${chatId}`);
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/chat/${chatId}`);
      setMessages(response.data.chat.messages);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setLocation]);

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    setMessages([]);
    setLocation("/");
  }, [setLocation]);

  const handleSendMessage = useCallback(async ({ text, files }) => {
    const userMessage = { role: "user", content: [{ type: "text", value: text }] };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiClient.post("/chat", {
        message: text,
        chatId: activeChatId,
        history: messages,
      });

      const newChatId = response.data.chatId;
      
      // --- THIS IS THE FIX: Check for the newChat object from the backend ---
      if (response.data.newChat) {
        setActiveChatId(newChatId);
        setLocation(`/${newChatId}`);
        // Use the AI-generated title from the backend response
        setChatHistory(prevHistory => [response.data.newChat, ...prevHistory]);
      }

      const botMessage = { role: "assistant", content: response.data.response };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { role: "assistant", content: [{ type: "text", value: "Sorry, I couldn't get a response." }] };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, messages, setLocation]);

  return (
    <div className="relative flex h-screen font-sans text-white bg-dark-bg">
        <Sidebar
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
      <main className="relative flex flex-col flex-1 h-full font-sans">

        <div className="flex flex-col items-center flex-1 w-full max-w-3xl mx-auto overflow-hidden">
          <div className="flex-1 w-full max-w-3xl py-4 overflow-y-auto chatwindow">
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