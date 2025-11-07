import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import apiClient from "./services/api.js";
import { useLocation, useRoute, Switch, Route } from "wouter";

import Sidebar from "./components/Sidebar";
import LoginView from "./components/LoginView";
import Welcome from "./components/Welcome";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import NotFound from "./components/NotFound";

function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return reject(
        new Error(`File ${file.name} is too large. Max size is 10MB.`),
      );
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const { authToken } = useAuth();
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/:chatId");

  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatNotFound, setChatNotFound] = useState(false);

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

  const handleSelectChat = useCallback(
    async (chatId) => {
      if (!chatId) return;
      setActiveChatId(chatId);
      setLocation(`/${chatId}`);
      setIsLoading(true);
      setChatNotFound(false);
      try {
        const response = await apiClient.get(`/chat/${chatId}`);
        setMessages(response.data.chat.messages);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
        setChatNotFound(true);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    },
    [setLocation],
  );

  useEffect(() => {
    if (match && params.chatId && params.chatId !== activeChatId) {
      handleSelectChat(params.chatId);
    }
  }, [match, params, activeChatId, handleSelectChat]);

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    setMessages([]);
    setLocation("/");
    setChatNotFound(false);
  }, [setLocation]);

  // --- THIS IS THE FIX: This function now splits images and text into separate messages ---
  const handleSendMessage = useCallback(
    async ({ text, files }) => {
      // 1. Create temporary "blob" URLs for the UI
      const filePreviews = files.map((file) => ({
        type: "image",
        value: URL.createObjectURL(file),
      }));

      // 2. Create a list of new messages to add to the UI
      const newUIMessages = [];

      // If there are images, create an image-only message
      if (filePreviews.length > 0) {
        newUIMessages.push({
          role: "user",
          content: filePreviews,
        });
      }

      // If there is text, create a text-only message
      if (text.trim() !== "") {
        newUIMessages.push({
          role: "user",
          content: [{ type: "text", value: text }],
        });
      }

      // 3. If there's nothing to send, do nothing.
      if (newUIMessages.length === 0) return;

      // 4. Add all new user messages to the state at once
      setMessages((prevMessages) => [...prevMessages, ...newUIMessages]);
      setIsLoading(true);

      try {
        // 5. Convert files to Base64 for the API
        const fileDataUris = await Promise.all(
          files.map((file) => fileToDataUri(file)),
        );

        // 6. Send the API request (this logic is the same)
        const response = await apiClient.post("/chat", {
          message: text,
          chatId: activeChatId,
          images: fileDataUris,
        });

        const newChatId = response.data.chatId;

        if (response.data.newChat) {
          setActiveChatId(newChatId);
          setLocation(`/${newChatId}`);
          setChatHistory((prevHistory) => [
            response.data.newChat,
            ...prevHistory,
          ]);
        }

        // 7. Add the bot's response as a new message
        const botMessage = {
          role: "assistant",
          content: response.data.response,
        };
        setMessages((prevMessages) => [
          ...prevMessages,
          ...newUIMessages,
          botMessage,
        ]);
      } catch (error) {
        console.error("Error sending message:", error);
        let errorMessageText =
          "Sorry, I couldn't get a response. Please try again.";
        if (error.message.includes("is too large")) {
          errorMessageText = error.message;
        }
        const errorMessage = {
          role: "assistant",
          content: [{ type: "text", value: errorMessageText }],
        };
        // 8. Add the error message as a new message
        setMessages((prevMessages) => [
          ...prevMessages,
          ...newUIMessages,
          errorMessage,
        ]);
      } finally {
        setIsLoading(false);
        // 9. Revoke the temporary blob URLs
        filePreviews.forEach((file) => URL.revokeObjectURL(file.value));
      }
    },
    [activeChatId, setLocation],
  );

  return (
    <div className="bg-dark-bg relative flex h-full font-sans text-white">
      <Sidebar
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />
      <main className="relative flex h-full flex-1 flex-col font-sans">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center overflow-hidden">
          <div className="chatwindow w-full max-w-3xl flex-1 overflow-y-auto py-4">
            <Switch>
              <Route path="/:chatId">
                {chatNotFound ? (
                  <NotFound />
                ) : (
                  <ChatWindow messages={messages} isLoading={isLoading} />
                )}
              </Route>
              <Route path="/">
                <div className="flex h-full items-center justify-center">
                  <Welcome />
                </div>
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </div>

          <div className="shrink-0 w-full">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={!authToken || isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
