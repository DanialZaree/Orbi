import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import orbi from "../../assets/orbi.webp";
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
  const [isSideOpen, setIsSideOpen] = useState(false);
  const [isButtonRendered, setIsButtonRendered] = useState(isSideOpen);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- PROBLEM FIX: Renamed for clarity ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- PROBLEM FIX: Added state for the Rename functionality ---
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);

  const openHandle = () => {
    setIsSideOpen(!isSideOpen);
  };

  const handleOptionsToggle = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  useEffect(() => {
    let timer;
    if (isSideOpen) {
      setIsButtonRendered(true);
    } else {
      setOpenMenuIndex(null);
      timer = setTimeout(() => {
        setIsButtonRendered(false);
      }, 150);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [isSideOpen]);

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
        prevChats.filter((chat) => chat._id !== itemToDelete._id),
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
          chat._id === itemToRename._id ? { ...chat, title: newTitle } : chat,
        ),
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
      <div className="md:none absolute top-4 left-4 z-10">
        <button
          onClick={openHandle}
          className="border-border-color text-secondary-text hover:bg-dark-third-bg ml-auto cursor-pointer rounded-lg border p-2 transition-colors hover:text-white"
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
      <aside
        className={`bg-dark-secondary-bg border-border-color absolute z-20 flex h-full w-0 shrink-0 flex-col border-0 border-r transition-all duration-300 ease-in-out md:relative ${
          isSideOpen ? "w-72 " : "border-r-0 md:w-18"
        }`}
      >
        <div className="border-border-color flex h-16 shrink-0 items-center gap-2 overflow-hidden border-b">
          <img src={orbi} alt="Orbi Logo" className="ml-4 h-10 shrink-0" />
          <span
            className={`text-2xl font-bold whitespace-nowrap transition-opacity ease-in-out ${
              isSideOpen
                ? "opacity-100 delay-200 duration-200"
                : "opacity-0 duration-100"
            }`}
          >
            Orbi
          </span>
          <button
            onClick={openHandle}
            className="border-border-color text-secondary-text hover:bg-dark-third-bg m-4 ml-auto cursor-pointer rounded-lg border p-2 transition-colors hover:text-white"
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

        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <nav className="p-4">
            <button
              onClick={onNewChat}
              className={`text-secondary-text border-border-color hover:bg-dark-third-bg flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg border p-2 text-sm transition-all duration-300 ease-in-out hover:text-white ${!isSideOpen ? "justify-start" : "justify-center"}`}
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
                  ? "opacity-100 delay-200 duration-200"
                  : "opacity-0 duration-100"
              }`}
            >
              <h3 className="text-secondary-text mt-6 mb-2 px-3 text-xs font-semibold whitespace-nowrap uppercase">
                HISTORY
              </h3>
              <ul className="space-y-2">
                {chatHistory.map((chat, index) => (
                  <li key={chat._id} className="relative">
                    <Link
                      href={`/${chat._id}`}
                      onClick={() => onSelectChat(chat._id)}
                      className={`group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                        activeChatId === chat._id
                          ? " bg-dark-third-bg text-white"
                          : "text-secondary-text hover:bg-dark-third-bg hover:text-white"
                      }`}
                    >
                      <MessageSquare size={20} className="shrink-0" />
                      <span className="truncate">{chat.title}</span>
                      <button
                        onClick={(e) => handleOptionsToggle(e, index)}
                        className="ml-auto hidden cursor-pointer group-hover:block hover:text-white"
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
        <div
          className={`border-border-color mt-auto flex shrink-0 justify-between gap-3 p-4 ${!isSideOpen ? "border-0" : "border-t"}`}
        >
          {isButtonRendered && (
            <div
              className={`text-secondary-text border-border-color hover:bg-dark-third-bg flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg border text-sm font-bold whitespace-nowrap transition-all duration-200 ease-in-out hover:text-white ${
                isSideOpen ? "grow" : "grow-0 opacity-0"
              }`}
              aria-label="Send Feedback"
            >
              <LoginView />
            </div>
          )}

          <button
            onClick={openHandle}
            className="border-border-color text-secondary-text hover:bg-dark-third-bg ml-auto cursor-pointer rounded-lg border p-2 transition-colors hover:text-white max-md:hidden"
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
