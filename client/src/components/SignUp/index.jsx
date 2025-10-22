import { FcGoogle } from "react-icons/fc";
import { X, Eye, EyeOff } from "lucide-react";

// Accept all the props from LoginView
const SignUpForm = ({
  toggleModal,
  googleLoginHandler,
  handleRequestOtp,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  toggleShowPassword,
  showConfirmPassword,
  toggleShowConfirmPassword,
  isLoading,
  error,
  localError,
  switchTo,
}) => (
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
      onClick={() => googleLoginHandler()}
      disabled={isLoading}
      className="group flex items-center justify-center w-full gap-3 p-3 text-white rounded-lg cursor-pointer bg-dark-third-bg hover:bg-surface-hover disabled:opacity-50"
    >
      {isLoading && !email ? (
        "Signing in..."
      ) : (
        <>
          <FcGoogle size={24} />{" "}
          <span className="text-secondary-text group-hover:text-white">
            Sign Up with Google
          </span>
        </>
      )}
    </button>

    {/* --- Error Display --- */}
    {/* --- UPDATED: Will not show the password mismatch error text --- */}
    {(error || (localError && localError !== "Passwords do not match.")) && (
      <p className="mt-4 text-sm text-center text-red-500">
        {error || localError}
      </p>
    )}

    <div className="flex flex-row items-center w-full my-6">
      <hr className="w-full border-t border-border-color" />
      <span className="px-3 text-sm text-secondary-text">OR</span>
      <hr className="w-full border-t border-border-color" />
    </div>

    {/* --- Sign Up Form --- */}
    <form onSubmit={handleRequestOtp} className="space-y-4">
      <div>
        <label
          htmlFor="email-signup"
          className="block mb-2 text-sm text-secondary-text text-left"
        >
          Email
        </label>
        <input
          id="email-signup"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 text-white border rounded-lg border-border-color placeholder:text-secondary-text focus:outline-none focus:border-blue-600"
        />
      </div>
      <div className="relative">
        <label
          htmlFor="password-signup"
          className="block mb-2 text-sm text-secondary-text text-left"
        >
          Password
        </label>
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute z-10 -translate-y-1/2 cursor-pointer right-4 top-7/10 text-secondary-text"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <input
          id="password-signup"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 tracking-widest text-white border rounded-lg border-border-color placeholder:text-secondary-text focus:outline-none focus:border-blue-600"
        />
      </div>
      <div className="relative">
        <label
          htmlFor="confirm-password-signup"
          className="block mb-2 text-sm text-secondary-text text-left"
        >
          Confirm Password
        </label>
        <button
          type="button"
          onClick={toggleShowConfirmPassword}
          className="absolute z-10 -translate-y-1/2 cursor-pointer right-4 top-7/10 text-secondary-text"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <input
          id="confirm-password-signup"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          // --- UPDATED: Conditionally adds red border ---
          className={`w-full p-3 tracking-widest border rounded-lg placeholder:text-secondary-text focus:outline-none focus:border-blue-600 ${
            localError === "Passwords do not match."
              ? "border-red-500" // Red border on mismatch
              : "border-border-color" // Default border
          }`}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full p-3 font-bold text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading && email ? "Sending OTP..." : "Sign Up"}
      </button>
    </form>

    {/* --- Footer Link --- */}
    <div className="mt-4 space-x-1 text-center">
      <span className="text-sm text-secondary-text">
        Already have an account?
      </span>
      <button
        onClick={() => switchTo("signIn")}
        className="text-sm font-bold text-blue-500 cursor-pointer hover:underline"
      >
        Sign In
      </button>
    </div>
  </div>
);

export default SignUpForm;