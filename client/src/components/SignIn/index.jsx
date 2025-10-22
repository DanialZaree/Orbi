import { FcGoogle } from "react-icons/fc";
import { X, Eye, EyeOff } from "lucide-react";

// Accept all the props from LoginView
const SignInForm = ({
  toggleModal,
  googleLoginHandler,
  handleSignIn,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  toggleShowPassword,
  isLoading,
  error,
  localError,
  switchTo,
}) => (
  <div className="relative w-full max-w-md p-8 border bg-dark-secondary-bg rounded-2xl border-border-color bg-surface animate-fade-in">
    <div
      onClick={toggleModal}
      className="absolute cursor-pointer right-4 top-4 text-secondary-text hover:text-white"
      aria-label="close login form"
    >
      <X size={20} />
    </div>
    <h2 className="mb-6 text-2xl font-bold text-center text-white">Sign In</h2>

    {/* --- Google Button --- */}
    <button
      onClick={() => googleLoginHandler()}
      disabled={isLoading}
      className="group flex items-center justify-center w-full gap-3 p-3 rounded-lg cursor-pointer bg-dark-third-bg hover:bg-hover-bg/70 disabled:opacity-50"
    >
      {isLoading && !email ? ( // Only show loading for Google
        "Signing in..."
      ) : (
        <>
          <FcGoogle size={24} /> <span className="text-secondary-text group-hover:text-white">Sign In with Google</span>
        </>
      )}
    </button>

    {/* --- Error Display --- */}
    {(error || localError) && (
      <p className="mt-4 text-sm text-center text-red-500">
        {error || localError}
      </p>
    )}

    {/* --- OR Divider --- */}
    <div className="flex flex-row items-center w-full my-6 text-secondary-text">
      <hr className="w-full border-t border-border-color" />
      <span className="px-3 text-sm text-secondary-text">OR</span>
      <hr className="w-full border-t border-border-color" />
    </div>

    {/* --- Email/Pass Form --- */}
    {/* Use the handleSignIn from props */}
    <form onSubmit={handleSignIn} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block mb-2 text-sm text-secondary-text text-left"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email} // Use email from props
          onChange={(e) => setEmail(e.target.value)} // Use setEmail from props
          required
          className="w-full p-3 text-white border rounded-lg border-border-color placeholder:text-secondary-text focus:outline-none focus:border-blue-600"
        />
      </div>
      <div className="relative">
        <label
          htmlFor="password"
          className="flex justify-between mb-2 text-sm text-secondary-text"
        >
          <span>Password</span>
          <span className="text-blue-500 cursor-pointer hover:underline">
            Forget Password
          </span>
        </label>
        <button
          type="button"
          onClick={toggleShowPassword} // Use toggle from props
          className="absolute z-10 -translate-y-1/2 cursor-pointer text-secondary-text right-4 top-7/10"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <input
          id="password"
          type={showPassword ? "text" : "password"} // Use state from props
          placeholder="••••••••"
          value={password} // Use password from props
          onChange={(e) => setPassword(e.target.value)} // Use setPassword from props
          required
          className="w-full p-3 tracking-widest text-white border rounded-lg border-border-color placeholder:text-secondary-text focus:outline-none focus:border-blue-600"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full p-3 font-bold text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading && email ? "Signing In..." : "Sign In"}
      </button>
    </form>

    <div className="mt-4 space-x-1 text-center">
      <span className="text-sm text-secondary-text">
        Don't have an account?
      </span>
      <button
        onClick={() => switchTo("signUp")}
        className="text-sm font-bold text-blue-500 cursor-pointer hover:underline"
      >
        Sign Up
      </button>
    </div>
  </div>
);

export default SignInForm;