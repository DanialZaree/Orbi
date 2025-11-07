import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import orbi from "../../assets/orbi.png";
import apiClient from "../../services/api";
import OptionsMenu from "../optionsMenu";
import DeleteModal from "../Modal/DeleteModal";
import RenameModal from "../Modal/RenameModal";
import LoginView from "../LoginView";
import {
  EllipsisVertical,
  ChevronLeft,
  MessageSquare,
  Plus,
} from "lucide-react";

// --- ADDED: Receive props from App.jsx to handle routing ---
export default function Sidebar({
  onSelectChat,
  onNewChat,
  activeChatId,
  chatHistory,
  setChatHistory,
}) {
  const [isSideOpen, setIsSideOpen] = useState(true);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openHandle = () => {
    setIsSideOpen(!isSideOpen);
  };

  // --- PROBLEM FIX: Renamed for clarity ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- PROBLEM FIX: Added state for the Rename functionality ---
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);

  // // This useEffect will fetch the initial chat history
  // useEffect(() => {
  //   const fetchChatHistory = async () => {
  //     try {
  //       const response = await apiClient.get("/chat");
  //       if (response.data.success) {
  //         setChatHistory(response.data.chats);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch chat history:", error);
  //     }
  //   };
  //   fetchChatHistory();
  // }, [setChatHistory]); // Dependency array ensures this runs when the setter is available

  const handleOptionsToggle = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleDeleteRequest = (chat) => {
    setItemToDelete(chat);
    setIsModalOpen(true);
    setOpenMenuIndex(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      // 1. Call the new DELETE API endpoint on the backend
      await apiClient.delete(`/chat/${itemToDelete._id}`);

      // 2. Update the UI instantly by removing the chat from the list
      setChatHistory((prevChats) =>
        prevChats.filter((chat) => chat._id !== itemToDelete._id)
      );

      // 3. If the deleted chat was the active one, navigate to the "new chat" screen
      if (activeChatId === itemToDelete._id) {
        onNewChat();
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      // Optionally, show an error notification to the user
    } finally {
      // 4. Close the modal and clear the state
      setIsModalOpen(false);
      setItemToDelete(null);
    }
  };
  const handleRenameRequest = (chat) => {
    setItemToRename(chat);
    setIsRenameModalOpen(true);
    setOpenMenuIndex(null);
  };
  // --- PROBLEM FIX: Added handler to confirm and execute the rename ---
  const handleConfirmRename = async (newTitle) => {
    if (
      !itemToRename ||
      newTitle.trim() === "" ||
      newTitle === itemToRename.title
    ) {
      setIsRenameModalOpen(false);
      setItemToRename(null);
      return;
    }
    try {
      await apiClient.patch(`/chat/${itemToRename._id}/rename`, { newTitle });
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat._id === itemToRename._id ? { ...chat, title: newTitle } : chat
        )
      );
    } catch (error) {
      console.error("Failed to rename chat:", error);
    } finally {
      setIsRenameModalOpen(false);
      setItemToRename(null);
    }
  };
  return (
    <>
      <aside
        className={`flex-col h-full border-r bg-dark-secondary-bg border-border-color shrink-0
               transition-all duration-300 ease-in-out ${
                 isSideOpen ? "w-72" : "w-18"
               } hidden md:flex`}
      >
        <div className="flex items-center h-16 gap-2 overflow-hidden border-b border-border-color shrink-0">
          <img src={orbi} alt="Orbi Logo" className="h-10 ml-4 shrink-0" />
          <span
            className={`text-2xl font-bold whitespace-nowrap transition-opacity ease-in-out ${
              isSideOpen
                ? "opacity-100 duration-200 delay-200"
                : "opacity-0 duration-100"
            }`}
          >
            Orbi
          </span>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <nav className="p-4">
            <button
              onClick={onNewChat}
              className={`flex items-center w-full gap-3 p-2 overflow-hidden text-sm border rounded-lg cursor-pointer text-secondary-text border-border-color hover:text-white hover:bg-dark-third-bg
               transition-all duration-300 ease-in-out
               ${!isSideOpen ? "justify-start" : "justify-center"}`}
            >
              <Plus size={20} className="shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-300 ease-in-out ${
                  isSideOpen ? "max-w-xs opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                New Chat
              </span>
            </button>
            <div
              className={`transition-opacity ease-in-out ${
                isSideOpen
                  ? "opacity-100 duration-200 delay-200"
                  : "opacity-0 duration-100"
              }`}
            >
              <h3 className="px-3 mt-6 mb-2 text-xs font-semibold uppercase text-secondary-text whitespace-nowrap">
                HISTORY
              </h3>
              <ul className="space-y-2">
                {chatHistory.map((chat, index) => (
                  <li key={chat._id} className="relative">
                    <Link
                      href={`/${chat._id}`}
                      onClick={() => onSelectChat(chat._id)}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer group 
                        ${
                          activeChatId === chat._id
                            ? " text-white bg-dark-third-bg"
                            : "text-secondary-text hover:bg-dark-third-bg hover:text-white"
                        }`}
                    >
                      <MessageSquare size={20} className="shrink-0" />
                      <span className="truncate">{chat.title}</span>
                      <button
                        onClick={(e) => handleOptionsToggle(e, index)}
                        className="hidden ml-auto cursor-pointer group-hover:block hover:text-white"
                        aria-label="Chat options"
                      >
                        <EllipsisVertical size={20} />
                      </button>
                    </Link>
                    {openMenuIndex === index && (
                      <OptionsMenu
                        onClose={() => setOpenMenuIndex(null)}
                        onDelete={() => handleDeleteRequest(chat)}
                        onRename={() => handleRenameRequest(chat)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        <div className="flex justify-between gap-3 p-4 mt-auto border-t border-border-color shrink-0">
          <div
            className={`flex items-center w-full gap-3  text-sm font-bold border rounded-lg cursor-pointer text-secondary-text border-border-color hover:text-white hover:bg-dark-third-bg
                    transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap ${
                      isSideOpen ? "grow" : "grow-0 opacity-0"
                    }`}
            aria-label="Send Feedback"
          >
            <LoginView />
          </div>
          <button
            onClick={openHandle}
            className="p-2 ml-auto transition-colors border rounded-lg cursor-pointer border-border-color text-secondary-text hover:text-white hover:bg-dark-third-bg"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform duration-300 ${
                !isSideOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </aside>
      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        chatName={itemToDelete?.title}
      />
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onConfirm={handleConfirmRename}
        currentName={itemToRename?.title}
      />
    </>
  );
}
