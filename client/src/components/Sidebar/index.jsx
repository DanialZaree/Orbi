import { useState, useEffect, useRef } from "react";
// --- ADDED: Import the Link component for routing ---
import { Link } from "wouter";
import orbi from "../../assets/orbi.png";
import apiClient from "../../services/api";
import OptionsMenu from "../optionsMenu";
import DeleteModal from "../Modal/DeleteModal";
import {
  EllipsisVertical,
  ChevronLeft,
  MessageSquare,
  Plus,
} from "lucide-react";

// --- ADDED: Receive props from App.jsx to handle routing ---
export default function Sidebar({ onSelectChat, onNewChat, activeChatId, chatHistory, setChatHistory }) {
  const [isSideOpen, setIsSideOpen] = useState(true);
  const [isButtonRendered, setIsButtonRendered] = useState(isSideOpen);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // This useEffect will fetch the initial chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await apiClient.get("/chat");
        if (response.data.success) {
          setChatHistory(response.data.chats);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };
    fetchChatHistory();
  }, [setChatHistory]); // Dependency array ensures this runs when the setter is available

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

  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      setChatHistory((prevChats) =>
        prevChats.filter((chat) => chat._id !== itemToDelete._id)
      );
      // You would also add an API call here to delete from the database
    }
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <>
      <aside
        className={`flex flex-col h-screen border-r bg-dark-secondary-bg border-border-color shrink-0
               transition-all duration-300 ease-in-out ${
                 isSideOpen ? "w-72" : "w-18"
               }`}
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
                        ${activeChatId === chat._id 
                            ? ' text-white bg-dark-third-bg' 
                            : 'text-secondary-text hover:bg-dark-third-bg hover:text-white'
                        }`
                      }
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
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        <div className="flex justify-between gap-3 p-4 mt-auto border-t border-border-color shrink-0">
          {isButtonRendered && (
            <button
              className={`flex items-center w-full gap-3 px-3 py-2 text-sm font-bold border rounded-lg cursor-pointer text-secondary-text border-border-color hover:text-white hover:bg-dark-third-bg
                      transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap ${
                        isSideOpen ? "grow" : "grow-0 opacity-0"
                      }`}
              aria-label="Send Feedback"
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
              </svg>
              Send Feedback
            </button>
          )}

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
    </>
  );
}

