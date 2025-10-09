import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import {
  User,
  ChevronRight,
  X,
  Sparkles,
  Lock,
  Mail,
  Brain,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("signIn"); // 'signIn' or 'signUp'

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setView("signIn"); // Always reset to 'Sign In' view when opening/closing
  };

  // --- IMPORTANT CHANGE HERE: Destructure 'user' from useAuth ---
  const { authToken, login, logout, isLoading, error, user } = useAuth();
  // --- END IMPORTANT CHANGE ---

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: (codeResponse) => login(codeResponse.code),
    onError: () => console.error("Google Login Failed"),
  });

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // --- Sub-component for the Sign In form ---
  const SignInForm = () => (
    <div className="relative w-full max-w-md p-8 border bg-dark-secondary-bg rounded-2xl border-border-color bg-surface animate-fade-in">
      <button
        onClick={toggleModal}
        className="absolute cursor-pointer right-4 top-4 text-secondary-text hover:text-white"
        aria-label="close login form"
      >
        <X size={20} />
      </button>
      <h2 className="mb-6 text-2xl font-bold text-center text-white">
        Sign In
      </h2>
      <button
        onClick={() => googleLogin()}
        disabled={isLoading}
        className="flex items-center justify-center w-full gap-3 p-3 rounded-lg cursor-pointer bg-dark-third-bg hover:bg-hover-bg/70 disabled:opacity-50"
      >
        {isLoading ? (
          "Signing in..."
        ) : (
          <>
            {" "}
            <FcGoogle size={24} /> <span>Sign In with Google</span>{" "}
          </>
        )}
      </button>
      {error && (
        <p className="mt-4 text-sm text-center text-red-500">{error}</p>
      )}
      <div className="flex flex-row items-center w-full my-6 text-secondary-text">
        <hr className="w-full border-t border-border-color" />
        <span className="px-3 text-sm text-secondary-text">OR</span>
        <hr className="w-full border-t border-border-color" />
      </div>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm text-secondary-text "
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="w-full p-3 text-white border rounded-lg border-border-color placeholder:text-secondary-text focus:outline-none focus:border-blue-600"
          />
        </div>
        <div className="relative">
          <label
            htmlFor="password"
            className="flex justify-between mb-2 text-sm text-secondary-text"
          >
            <span>Password</span>{" "}
            <span className="text-blue-500 cursor-pointer hover:underline">
              Forget Password
            </span>
          </label>
          <button
            onClick={toggleShowPassword}
            className="absolute z-10 -translate-y-1/2 cursor-pointer text-secondary-text right-4 top-2/3"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full p-3 tracking-widest text-white border rounded-lg border-border-color placeholder:text-secondary-text focus:outline-none focus:border-blue-600"
          />
        </div>
        <button className="w-full p-3 font-bold text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700">
          Sign In
        </button>
      </div>
      <div className="mt-4 space-x-1 text-center">
        <span className="text-sm text-secondary-text">
          Don't have an account?
        </span>
        <button
          onClick={() => setView("signUp")}
          className="text-sm font-bold text-blue-500 cursor-pointer hover:underline"
        >
          Sign Up
        </button>
      </div>
    </div>
  );

  // --- Sub-component for the Sign Up form ---
  const SignUpForm = () => (
    <div className="relative w-full max-w-md p-8 border rounded-2xl border-border-color bg-surface animate-fade-in bg-dark-secondary-bg">
      <button
        onClick={toggleModal}
        className="absolute cursor-pointer right-4 top-4 text-secondary-text hover:text-white"
        aria-label="close login form"
      >
        <X size={20} />
      </button>
      <h2 className="mb-6 text-2xl font-bold text-center text-white">
        Create Account
      </h2>
      <button
        onClick={() => googleLogin()}
        disabled={isLoading}
        className="flex items-center justify-center w-full gap-3 p-3 text-white rounded-lg cursor-pointer bg-dark-third-bg bg-border hover:bg-surface-hover disabled:opacity-50"
      >
        {isLoading ? (
          "Signing in..."
        ) : (
          <>
            {" "}
            <FcGoogle size={24} /> <span>Sign Up with Google</span>{" "}
          </>
        )}
      </button>
      {error && (
        <p className="mt-4 text-sm text-center text-red-500">{error}</p>
      )}
      <div className="flex flex-row items-center w-full my-6">
        <hr className="w-full border-t border-border-color" />
        <span className="px-3 text-sm text-secondary-text">OR</span>
        <hr className="w-full border-t border-border-color" />
      </div>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email-signup"
            className="block mb-2 text-sm text-secondary-text"
          >
            Email
          </label>
          <input
            id="email-signup"
            type="email"
            placeholder="you@example.com"
            className="w-full p-3 text-white border rounded-lg border-border-color placeholder:text-secondary-text focus:outline-none focus:border-blue-600"
          />
        </div>
        <div className="relative">
          <label
            htmlFor="password-signup"
            className="block mb-2 text-sm text-secondary-text"
          >
            Password
          </label>
          <button
            onClick={toggleShowPassword}
            className="absolute z-10 -translate-y-1/2 cursor-pointer right-4 top-2/3 text-secondary-text"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <input
            id="password-signup"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full p-3 tracking-widest text-white border rounded-lg bg-background border-border-color placeholder:text-secondary-text focus:outline-none focus:border-blue-600"
          />
        </div>
        <div className="relative">
          <label
            htmlFor="confirm-password-signup"
            className="block mb-2 text-sm text-secondary-text"
          >
            Confirm Password
          </label>
          <button
            onClick={toggleShowConfirmPassword}
            className="absolute z-10 -translate-y-1/2 cursor-pointer right-4 top-2/3 text-secondary-text"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <input
            id="confirm-password-signup"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full p-3 tracking-widest border rounded-lg text-secondary-text bg-background border-border-color placeholder:text-secondary-text focus:outline-none focus:border-blue-600"
          />
        </div>
        <button className="w-full p-3 font-bold text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700">
          Sign Up
        </button>
      </div>
      <div className="mt-4 space-x-1 text-center">
        <span className="text-sm text-secondary-text">
          Already have an account?
        </span>
        <button
          onClick={() => setView("signIn")}
          className="text-sm font-bold text-blue-500 cursor-pointer hover:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );

  // --- Sub-component for the Settings Panel ---
  const SettingsPanel = () => (
    <div className="flex flex-col w-full max-w-2xl border rounded-2xl border-border-color bg-dark-secondary-bg">
      <div className="flex flex-row items-center justify-between w-full p-2 px-5 border-b border-border-color">
        <div className="space-y-1.5 text-center flex flex-row justify-between items-center gap-2 ">
          <nav className="flex items-center">
            <div className="flex items-center text-secondary-text">
              <span className="font-normal text-muted-foreground ">
                Setting
              </span>
              <ChevronRight size={18} className="mt-1" />
            </div>
            <div className="flex items-center">
              <span className="font-bold">
                <h2 className="p-0 font-medium text-center">Profile</h2>
              </span>
            </div>
          </nav>
        </div>
        <button
          onClick={toggleModal}
          className="cursor-pointer text-secondary-text hover:text-white"
          aria-label="close login form"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-row">
        <div className="w-1/3 p-5">
          <div className="w-full overflow-auto">
            <ul className="flex flex-col flex-1 gap-2">
              <li>
                <button className="flex flex-row items-center w-full gap-2 px-3 py-2 cursor-pointer bg-dark-third-bg hover:bg-hover-bg/70 rounded-xl">
                  <User size={16} />
                  Profile
                </button>
              </li>
              <li>
                <button
                  disabled={true}
                  className="flex flex-row items-center w-full gap-2 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover-bg rounded-xl text-secondary-text disabled:hover:bg-transparent"
                >
                  <Sparkles size={16} />
                  Premium
                </button>
              </li>
              <div className="h-px bg-border-color"></div>
              <li>
                <button className="flex flex-row items-center w-full gap-2 px-3 py-2 cursor-pointer hover:bg-hover-bg rounded-xl">
                  <Brain size={16} />
                  Memory
                </button>
              </li>
              <li>
                <button className="flex flex-row items-center w-full gap-2 px-3 py-2 cursor-pointer hover:bg-hover-bg rounded-xl">
                  <Lock size={16} />
                  Privacy
                </button>
              </li>
              <li>
                <button className="flex flex-row items-center w-full gap-2 px-3 py-2 cursor-pointer hover:bg-hover-bg rounded-xl">
                  <Lock size={16} />
                  About Us
                </button>
              </li>
              <li>
                <button className="flex flex-row items-center w-full gap-2 px-3 py-2 cursor-pointer hover:bg-hover-bg rounded-xl">
                  <Mail size={16} />
                  Contact Us
                </button>
              </li>
              <li className="mt-10">
                <button
                  onClick={logout}
                  className="box-border flex flex-row items-center w-full gap-2 px-3 py-2 text-red-500 border border-transparent cursor-pointer bg-red-950/20 hover:border hover:border-red-500 rounded-xl"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </li>
            </ul>
          </div>
        </div>
        {/* --- IMPORTANT CHANGE HERE: Display user profile information --- */}
        <div className="w-2/3 p-5">
          {user ? (
            <div className="flex flex-col items-center gap-4 text-center h-full justify-center">
              {user.picture && (
                <img
                  src={user.picture}
                  alt="User Profile"
                  className="w-24 h-24 rounded-full border-2 border-blue-500 object-cover"
                />
              )}
              <h3 className="text-xl font-bold text-white">{user.name || "User Name"}</h3>
              <p className="text-sm text-secondary-text">{user.email || "user@example.com"}</p>
              {/* You can add more profile details here if your 'user' object has them */}
            </div>
          ) : (
            <p className="text-secondary-text">User profile not available.</p>
          )}
        </div>
        {/* --- END IMPORTANT CHANGE --- */}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={toggleModal}
        className="absolute z-10 flex items-center justify-center w-10 h-10 border border-solid rounded-full cursor-pointer right-4 top-4 border-white/30 text-white/70 hover:bg-white/10 hover:text-white"
        aria-label="Open user menu"
      >
        <User />
      </button>

      {isModalOpen && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center bg-background/10 backdrop-blur-sm">
          {authToken ? (
            <SettingsPanel />
          ) : view === "signIn" ? (
            <SignInForm />
          ) : (
            <SignUpForm />
          )}
        </div>
      )}
    </>
  );
}