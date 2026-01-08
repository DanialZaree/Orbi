import { useAuth } from "../../context/AuthContext.jsx";
import {
  User,
  ChevronRight,
  X,
  Sparkles,
  Lock,
  Mail,
  Brain,
  LogOut,
} from "lucide-react";

export default function SettingsPanel({ user, logout, onClose }) {
  return (
    <div className="border-border-color bg-dark-secondary-bg animate-fade-in flex w-full max-w-2xl flex-col rounded-2xl border">
      <div className="border-border-color flex w-full flex-row items-center justify-between border-b p-2 px-5">
        <nav className="flex items-center">
          <div className="text-secondary-text flex items-center">
            <span className="text-muted-foreground font-normal">Setting</span>
            <ChevronRight size={18} className="mt-1" />
          </div>
          <div className="flex items-center">
            <span className="font-bold">
              <h2 className="p-0 text-center font-medium text-white">
                Profile
              </h2>
            </span>
          </div>
        </nav>
        <button
          onClick={onClose}
          className="text-secondary-text cursor-pointer hover:text-white"
          aria-label="close settings panel"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-row">
        <div className="border-border-color w-1/3 border-r p-5">
          <ul className="flex flex-1 flex-col gap-2 text-white">
            <li>
              <button className="bg-hover-bg/70 flex w-full cursor-pointer flex-row items-center gap-3 rounded-xl px-3 py-2 text-left">
                <User size={16} />
                Profile
              </button>
            </li>
            <li>
              <button
                disabled={true}
                className="text-secondary-text flex w-full flex-row items-center gap-3 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles size={16} />
                Premium
              </button>
            </li>
            <div className="bg-border-color my-2 h-px"></div>
            <li>
              <button className="hover:bg-hover-bg/70 flex w-full cursor-pointer flex-row items-center gap-3 rounded-xl px-3 py-2 text-left">
                <Brain size={16} />
                Memory
              </button>
            </li>
            <li>
              <button className="hover:bg-hover-bg/70 flex w-full cursor-pointer flex-row items-center gap-3 rounded-xl px-3 py-2 text-left">
                <Lock size={16} />
                Privacy
              </button>
            </li>
            <li>
              <button className="hover:bg-hover-bg/70 flex w-full cursor-pointer flex-row items-center gap-3 rounded-xl px-3 py-2 text-left">
                <Mail size={16} />
                Contact Us
              </button>
            </li>
            <li className="mt-10">
              <button
                onClick={logout}
                className="box-border flex w-full cursor-pointer flex-row items-center gap-3 rounded-xl border border-transparent bg-red-950/20 px-3 py-2 text-red-500 hover:border hover:border-red-500"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </li>
          </ul>
        </div>
        <div className="flex w-2/3 items-center justify-center p-5">
          {user ? (
            <div className="flex flex-col items-center gap-4 text-center">
              {user.picture && (
                <img
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt="User Profile"
                  className="h-24 w-24 rounded-full border-2 border-blue-500 object-cover"
                />
              )}
              <h3 className="text-xl font-bold text-white">
                {user.name || "User Name"}
              </h3>
              <p className="text-secondary-text text-sm">
                {user.email || "user@example.com"}
              </p>
            </div>
          ) : (
            <p className="text-secondary-text">Loading profile...</p>
          )}
        </div>
      </div>
    </div>
  );
}
