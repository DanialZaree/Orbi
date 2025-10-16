import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import SettingsPanel from "../SettingPanel";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { User, X, Eye, EyeOff } from "lucide-react";

export default function LoginView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("signIn");

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setView("signIn");
  };

  const { authToken, login, logout, isLoading, error, user } = useAuth();

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

  return (
    <>
      <div
        onClick={toggleModal}
        className={`px-3 py-2 w-full flex items-center gap-1.5 justify cursor-pointer border-white/30  ${authToken && user ? "text-white/70  hover:text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        aria-label="Open user menu"
      >
        {authToken && user ? (
          <>
            <img
              src={
                `https://ui-avatars.com/api/?name=${user.name}&background=random`
              }
              alt={user.name}
              className="w-5 h-5 rounded-full"
            />
            <span className="truncate">{user.name}</span>
          </>
        ) : (
          <>
            <User size={20} />
            <span className="truncate">Sign In</span>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center bg-background/10 backdrop-blur-sm">
          {authToken ? (
            <SettingsPanel user={user} logout={logout} onClose={toggleModal} />
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
