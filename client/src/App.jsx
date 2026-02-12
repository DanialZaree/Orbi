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

  // --- UPDATED REGENERATE FUNCTION ---
  // This version deletes the bad response from the DB so it doesn't return on refresh.
  const handleRegenerate = useCallback(async () => {
    if (isLoading || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "user") return;

    console.log("Regenerating... Deleting old AI message.");

    // 1. Remove Old AI Message from UI
    setMessages((prev) => {
      const newHistory = [...prev];
      newHistory.pop();
      return newHistory;
    });
    setIsLoading(true);

    try {
      // 2. Delete Old AI Message from DB
      if (activeChatId) {
        await apiClient.delete(`/chat/${activeChatId}/last`);
      }

      // 3. Get the original User Prompt
      const promptMsg = messages[messages.length - 2];

      let textContent = "";
      if (typeof promptMsg.content === "string") {
        textContent = promptMsg.content;
      } else if (Array.isArray(promptMsg.content)) {
        textContent = promptMsg.content
          .filter((block) => block.type === "text")
          .map((block) => block.value)
          .join("\n");
      }

      // 4. Send Request with 'skipUserSave: true'
      // This prevents the "Duplicate User Text" issue
      const response = await apiClient.post("/chat", {
        message: textContent,
        chatId: activeChatId,
        skipUserSave: true, // <--- ADD THIS LINE
      });

      const botMessage = {
        role: "assistant",
        content: response.data.response,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Regeneration Error:", error);
      // ... error handling
    } finally {
      setIsLoading(false);
    }
  }, [messages, activeChatId, isLoading]);

  const handleSendMessage = useCallback(
    async ({ text, files }) => {
      const filePreviews = files.map((file) => ({
        type: file.type.startsWith("video/") ? "video" : "image",
        value: URL.createObjectURL(file),
      }));

      const newUIMessages = [];

      if (filePreviews.length > 0) {
        newUIMessages.push({
          role: "user",
          content: filePreviews,
        });
      }

      if (text.trim() !== "") {
        newUIMessages.push({
          role: "user",
          content: [{ type: "text", value: text }],
        });
      }

      if (newUIMessages.length === 0) return;

      setMessages((prevMessages) => [...prevMessages, ...newUIMessages]);
      setIsLoading(true);

      try {
        const imageFiles = files.filter((file) =>
          file.type.startsWith("image/"),
        );
        const videoFiles = files.filter((file) =>
          file.type.startsWith("video/"),
        );

        const imageDataUris = await Promise.all(
          imageFiles.map((file) => fileToDataUri(file)),
        );
        const videoDataUris = await Promise.all(
          videoFiles.map((file) => fileToDataUri(file)),
        );

        const response = await apiClient.post("/chat", {
          message: text,
          chatId: activeChatId,
          images: imageDataUris,
          videos: videoDataUris,
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

        const botMessage = {
          role: "assistant",
          content: response.data.response,
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
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
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
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
      <main className="relative flex h-full w-full flex-1 flex-col font-sans">
        <div className="mx-auto flex w-full flex-1 flex-col items-center overflow-hidden">
          <div className="chatwindow w-full flex-1 overflow-y-auto py-4">
            <Switch>
              <Route path="/:chatId">
                {chatNotFound ? (
                  <NotFound />
                ) : (
                  <ChatWindow
                    messages={messages}
                    isLoading={isLoading}
                    onRegenerate={handleRegenerate} // <--- PASSED HERE
                  />
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

          <div className="w-full shrink-0">
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
