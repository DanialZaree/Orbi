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
  <div className="bg-dark-secondary-bg border-border-color bg-surface animate-fade-in relative w-full max-w-md rounded-2xl border p-8">
    <div
      onClick={toggleModal}
      className="text-secondary-text absolute top-4 right-4 cursor-pointer hover:text-white"
      aria-label="close login form"
    >
      <X size={20} />
    </div>
    <h2 className="mb-6 text-center text-2xl font-bold text-white">Sign In</h2>

    {/* --- Google Button --- */}
    <button
      onClick={() => googleLoginHandler()}
      disabled={isLoading}
      className="group bg-dark-third-bg hover:bg-hover-bg/70 flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg p-3 disabled:opacity-50"
    >
      {isLoading && !email ? ( // Only show loading for Google
        "Signing in..."
      ) : (
        <>
          <FcGoogle size={24} />{" "}
          <span className="text-secondary-text group-hover:text-white">
            Sign In with Google
          </span>
        </>
      )}
    </button>

    {/* --- Error Display --- */}
    {(error || localError) && (
      <p className="mt-4 text-center text-sm text-red-500">
        {error || localError}
      </p>
    )}

    {/* --- OR Divider --- */}
    <div className="text-secondary-text my-6 flex w-full flex-row items-center">
      <hr className="border-border-color w-full border-t" />
      <span className="text-secondary-text px-3 text-sm">OR</span>
      <hr className="border-border-color w-full border-t" />
    </div>

    {/* --- Email/Pass Form --- */}
    {/* Use the handleSignIn from props */}
    <form onSubmit={handleSignIn} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="text-secondary-text mb-2 block text-left text-sm"
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
          className="border-border-color placeholder:text-secondary-text w-full rounded-lg border p-3 text-white focus:border-blue-600 focus:outline-none"
        />
      </div>
      <div className="relative">
        <label
          htmlFor="password"
          className="text-secondary-text mb-2 flex justify-between text-sm"
        >
          <span>Password</span>
          <span className="cursor-pointer text-blue-500 hover:underline">
            Forget Password
          </span>
        </label>
        <button
          type="button"
          onClick={toggleShowPassword} // Use toggle from props
          className="text-secondary-text absolute top-7/10 right-4 z-10 -translate-y-1/2 cursor-pointer"
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
          className="border-border-color placeholder:text-secondary-text w-full rounded-lg border p-3 tracking-widest text-white focus:border-blue-600 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer rounded-lg bg-blue-600 p-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading && email ? "Signing In..." : "Sign In"}
      </button>
    </form>

    <div className="mt-4 space-x-1 text-center">
      <span className="text-secondary-text text-sm">
        Don't have an account?
      </span>
      <button
        onClick={() => switchTo("signUp")}
        className="cursor-pointer text-sm font-bold text-blue-500 hover:underline"
      >
        Sign Up
      </button>
    </div>
  </div>
);

export default SignInForm;
