import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import apiClient from "./services/api.js";
import { useLocation, useRoute, Switch, Route } from "wouter";

import Sidebar from "./components/Sidebar";
import LoginView from "./components/LoginView";
import Welcome from "./components/Welcome";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import NotFound from "./components/NotFound";

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit per file
    if (file.size > MAX_SIZE) {
      return reject(
        new Error(`File "${file.name}" exceeds the 10MB limit.`),
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
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/:chatId");

  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatNotFound, setChatNotFound] = useState(false);

  // Keep track of active object URLs to prevent memory leaks across sessions
  const activeBlobUrlsRef = useRef(new Set());

  const clearBlobUrls = useCallback(() => {
    activeBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    activeBlobUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => clearBlobUrls();
  }, [clearBlobUrls]);

  // Fetch initial chat list for authenticated users
  useEffect(() => {
    if (!authToken) {
      setChatHistory([]);
      return;
    }
    let isMounted = true;
    apiClient
      .get("/chat")
      .then((res) => {
        if (isMounted && res.data?.chats) {
          setChatHistory(res.data.chats);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch initial chat history:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [authToken]);

  // Load a chat by ID
  const handleSelectChat = useCallback(
    async (chatId) => {
      if (!chatId) return;
      setActiveChatId(chatId);
      setIsLoading(true);
      setChatNotFound(false);
      clearBlobUrls();

      try {
        const response = await apiClient.get(`/chat/${chatId}`);
        const loadedMessages = (response.data.chat?.messages || []).map((msg) => ({
          ...msg,
          _id: msg._id || generateId(),
        }));
        setMessages(loadedMessages);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
        setChatNotFound(true);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    },
    [clearBlobUrls],
  );

  // Sync route param with activeChatId
  useEffect(() => {
    if (match && params?.chatId) {
      if (params.chatId !== activeChatId) {
        handleSelectChat(params.chatId);
      }
    } else if (!match && activeChatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  }, [match, params?.chatId, activeChatId, handleSelectChat]);

  const handleNewChat = useCallback(() => {
    clearBlobUrls();
    setActiveChatId(null);
    setMessages([]);
    setChatNotFound(false);
    setLocation("/");
  }, [clearBlobUrls, setLocation]);

  // Handle regenerating the last AI response
  const handleRegenerate = useCallback(async () => {
    if (isLoading || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "user") return;

    // Save previous state for rollback on error
    const previousMessages = [...messages];
    const newMessages = messages.slice(0, -1);
    setMessages(newMessages);
    setIsLoading(true);

    try {
      if (activeChatId) {
        await apiClient.delete(`/chat/${activeChatId}/last`);
      }

      // Find the last user prompt
      const promptMsg = [...newMessages].reverse().find((m) => m.role === "user");
      let textContent = "";
      if (promptMsg) {
        if (typeof promptMsg.content === "string") {
          textContent = promptMsg.content;
        } else if (Array.isArray(promptMsg.content)) {
          textContent = promptMsg.content
            .filter((block) => block.type === "text")
            .map((block) => block.value)
            .join("\n");
        }
      }

      const response = await apiClient.post("/chat", {
        message: textContent,
        chatId: activeChatId,
        skipUserSave: true,
      });

      const botMessage = {
        _id: generateId(),
        role: "assistant",
        content: response.data.response,
        animate: true,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Regeneration Error:", error);
      // Rollback to previous message list and display error
      setMessages([
        ...previousMessages,
        {
          _id: generateId(),
          role: "assistant",
          content: [{ type: "text", value: "Failed to regenerate response. Please try again." }],
          animate: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, activeChatId, isLoading]);

  // Handle sending a new message with text and optional files
  const handleSendMessage = useCallback(
    async ({ text, files = [] }) => {
      const filePreviews = files.map((file) => {
        let type = "file";
        if (file.type.startsWith("image/")) type = "image";
        if (file.type.startsWith("video/")) type = "video";

        const previewUrl = URL.createObjectURL(file);
        activeBlobUrlsRef.current.add(previewUrl);

        return {
          type,
          value: previewUrl,
          fileName: file.name,
        };
      });

      // Assemble unified user message matching server schema
      const userContent = [
        ...filePreviews,
        ...(text.trim() ? [{ type: "text", value: text }] : []),
      ];

      if (userContent.length === 0) return;

      const optimisticUserMessage = {
        _id: generateId(),
        role: "user",
        content: userContent,
      };

      setMessages((prev) => [...prev, optimisticUserMessage]);
      setIsLoading(true);

      try {
        const imageFiles = files.filter((f) => f.type.startsWith("image/"));
        const videoFiles = files.filter((f) => f.type.startsWith("video/"));
        const docFiles = files.filter(
          (f) => !f.type.startsWith("image/") && !f.type.startsWith("video/"),
        );

        const [imageDataUris, videoDataUris, docDataObjs] = await Promise.all([
          Promise.all(imageFiles.map(fileToDataUri)),
          Promise.all(videoFiles.map(fileToDataUri)),
          Promise.all(
            docFiles.map(async (file) => ({
              name: file.name,
              value: await fileToDataUri(file),
            })),
          ),
        ]);

        const response = await apiClient.post("/chat", {
          message: text,
          chatId: activeChatId,
          images: imageDataUris,
          videos: videoDataUris,
          documents: docDataObjs,
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
          _id: generateId(),
          role: "assistant",
          content: response.data.response,
          animate: true,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        const errorText =
          error.response?.data?.message ||
          error.message ||
          "Sorry, I couldn't get a response. Please try again.";

        const errorMessage = {
          _id: generateId(),
          role: "assistant",
          content: [{ type: "text", value: errorText }],
          animate: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeChatId, setLocation],
  );

  return (
    <div className="bg-dark-bg relative flex h-full font-sans text-white">
      {/* Root Modal Portal */}
      <LoginView hideTriggerButton={true} />

      <Sidebar
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setLocation(`/${id}`);
          handleSelectChat(id);
        }}
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
                    onRegenerate={handleRegenerate}
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
              disabled={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
