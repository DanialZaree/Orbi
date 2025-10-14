  import { useAuth } from "../../context/AuthContext.jsx";
import { User, ChevronRight, X, Sparkles, Lock, Mail, Brain, LogOut } from "lucide-react";
  
 export default function SettingsPanel({ user, logout, onClose }) {
  return (
    <div className="flex flex-col w-full max-w-2xl border rounded-2xl border-border-color bg-dark-secondary-bg animate-fade-in">
      <div className="flex flex-row items-center justify-between w-full p-2 px-5 border-b border-border-color">
        <nav className="flex items-center">
          <div className="flex items-center text-secondary-text">
            <span className="font-normal text-muted-foreground ">Setting</span>
            <ChevronRight size={18} className="mt-1" />
          </div>
          <div className="flex items-center">
            <span className="font-bold">
              <h2 className="p-0 font-medium text-center text-white">Profile</h2>
            </span>
          </div>
        </nav>
        <button
          onClick={onClose}
          className="cursor-pointer text-secondary-text hover:text-white"
          aria-label="close settings panel"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-row">
        <div className="w-1/3 p-5 border-r border-border-color">
          <ul className="flex flex-col flex-1 gap-2 text-white">
            <li>
              <button className="flex flex-row items-center w-full gap-3 px-3 py-2 text-left cursor-pointer bg-hover-bg/70 rounded-xl">
                <User size={16} />
                Profile
              </button>
            </li>
            <li>
              <button
                disabled={true}
                className="flex flex-row items-center w-full gap-3 px-3 py-2 text-left disabled:opacity-50 disabled:cursor-not-allowed text-secondary-text"
              >
                <Sparkles size={16} />
                Premium
              </button>
            </li>
            <div className="h-px my-2 bg-border-color"></div>
            <li>
              <button className="flex flex-row items-center w-full gap-3 px-3 py-2 text-left cursor-pointer hover:bg-hover-bg/70 rounded-xl">
                <Brain size={16} />
                Memory
              </button>
            </li>
            <li>
              <button className="flex flex-row items-center w-full gap-3 px-3 py-2 text-left cursor-pointer hover:bg-hover-bg/70 rounded-xl">
                <Lock size={16} />
                Privacy
              </button>
            </li>
            <li>
              <button className="flex flex-row items-center w-full gap-3 px-3 py-2 text-left cursor-pointer hover:bg-hover-bg/70 rounded-xl">
                <Mail size={16} />
                Contact Us
              </button>
            </li>
            <li className="mt-10">
              <button
                onClick={logout}
                className="box-border flex flex-row items-center w-full gap-3 px-3 py-2 text-red-500 border border-transparent cursor-pointer bg-red-950/20 hover:border hover:border-red-500 rounded-xl"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </li>
          </ul>
        </div>
        <div className="flex items-center justify-center w-2/3 p-5">
          {user ? (
            <div className="flex flex-col items-center gap-4 text-center">
              {user.picture && (
                <img
                  src={user.picture}
                  alt="User Profile"
                  className="object-cover w-24 h-24 border-2 rounded-full border-blue-500"
                />
              )}
              <h3 className="text-xl font-bold text-white">{user.name || "User Name"}</h3>
              <p className="text-sm text-secondary-text">{user.email || "user@example.com"}</p>
            </div>
          ) : (
            <p className="text-secondary-text">Loading profile...</p>
          )}
        </div>
      </div>
    </div>
  );
}
