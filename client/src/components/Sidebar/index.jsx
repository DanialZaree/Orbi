import { useState } from "react";
import orbi from "../../assets/orbi.png";
import { Plus } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { EllipsisVertical, ChevronLeft } from "lucide-react";

export default function Sidebar() {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const handleOptions = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOptionsOpen(!isOptionsOpen);
  };
  return (
    <aside className="flex flex-col border-r w-72 bg-dark-secondary-bg border-border-color shrink-0">
      <div className="flex items-center h-16 gap-2 border-b border-border-color">
        <img src={orbi} alt="Orbi Logo" className="h-10 ml-4" />
        <span className="text-2xl font-bold">Orbi</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4">
          <button className="flex items-center justify-center w-full gap-3 px-3 py-2 text-sm border rounded-lg cursor-pointer text-secondary-text border-border-color hover:text-white hover:bg-dark-third-bg">
            <Plus size={20} />
            New Chat
          </button>
          <h3 className="px-3 mt-6 mb-2 text-xs font-semibold uppercase text-secondary-text">
            HISTORY
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                className="flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg cursor-pointer text-secondary-text bg-dark-third-bg hover:bg-dark-third-bg"
                href=""
              >
                <MessageSquare size={20} />
                <span className="text-white truncate">best 2024 food</span>
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg cursor-pointer text-secondary-text hover:bg-dark-third-bg"
                href=""
              >
                <MessageSquare size={20} />
                <span className="truncate ">worst cars 2024 food</span>
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg cursor-pointer group text-secondary-text hover:bg-dark-third-bg"
                href=""
              >
                <MessageSquare size={20} />
                <span className="truncate ">tracking gps card</span>
                <button
                  onClick={handleOptions}
                  className="hidden ml-auto cursor-pointer group-hover:block hover:text-white"
                >
                  <EllipsisVertical size={20} />
                </button>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="p-4 mt-auto border-t border-border-color">
        <div className="flex items-center gap-2 mb-2">
          <button className="flex items-center w-full gap-3 px-3 py-2 ml-auto text-sm font-bold border rounded-lg cursor-pointer hover:text-white hover:bg-dark-third-bg border-border-color text-secondary-text" aria-label="Send Feedback">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"   
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
              <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
            </svg>{" "}
            Send Feedback
          </button>
          <button className="p-2 ml-auto border rounded-lg cursor-pointer border-border-color text-secondary-text hover:text-white hover:bg-dark-third-bg" aria-label="Collapse sidebar">
            <ChevronLeft size={20}/>
          </button>
        </div>
        <p className="px-3 text-xs text-center text-secondary-text">
          Your chat will be deleted after 30 days.
        </p>
      </div>
    </aside>
  );
}
