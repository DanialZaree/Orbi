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
  <div className="border-border-color bg-surface animate-fade-in bg-dark-secondary-bg relative w-full max-w-md rounded-2xl border p-8">
    <button
      onClick={toggleModal}
      className="text-secondary-text absolute top-4 right-4 cursor-pointer hover:text-white"
      aria-label="close login form"
    >
      <X size={20} />
    </button>
    <h2 className="mb-6 text-center text-2xl font-bold text-white">
      Create Account
    </h2>
    <button
      onClick={() => googleLoginHandler()}
      disabled={isLoading}
      className="group bg-dark-third-bg hover:bg-surface-hover flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg p-3 text-white disabled:opacity-50"
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
      <p className="mt-4 text-center text-sm text-red-500">
        {error || localError}
      </p>
    )}

    <div className="my-6 flex w-full flex-row items-center">
      <hr className="border-border-color w-full border-t" />
      <span className="text-secondary-text px-3 text-sm">OR</span>
      <hr className="border-border-color w-full border-t" />
    </div>

    {/* --- Sign Up Form --- */}
    <form onSubmit={handleRequestOtp} className="space-y-4">
      <div>
        <label
          htmlFor="email-signup"
          className="text-secondary-text mb-2 block text-left text-sm"
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
          className="border-border-color placeholder:text-secondary-text w-full rounded-lg border p-3 text-white focus:border-blue-600 focus:outline-none"
        />
      </div>
      <div className="relative">
        <label
          htmlFor="password-signup"
          className="text-secondary-text mb-2 block text-left text-sm"
        >
          Password
        </label>
        <button
          type="button"
          onClick={toggleShowPassword}
          className="text-secondary-text absolute top-7/10 right-4 z-10 -translate-y-1/2 cursor-pointer"
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
          className="border-border-color placeholder:text-secondary-text w-full rounded-lg border p-3 tracking-widest text-white focus:border-blue-600 focus:outline-none"
        />
      </div>
      <div className="relative">
        <label
          htmlFor="confirm-password-signup"
          className="text-secondary-text mb-2 block text-left text-sm"
        >
          Confirm Password
        </label>
        <button
          type="button"
          onClick={toggleShowConfirmPassword}
          className="text-secondary-text absolute top-7/10 right-4 z-10 -translate-y-1/2 cursor-pointer"
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
          className={`placeholder:text-secondary-text w-full rounded-lg border p-3 tracking-widest focus:border-blue-600 focus:outline-none ${
            localError === "Passwords do not match."
              ? "border-red-500" // Red border on mismatch
              : "border-border-color" // Default border
          }`}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer rounded-lg bg-blue-600 p-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading && email ? "Sending OTP..." : "Sign Up"}
      </button>
    </form>

    {/* --- Footer Link --- */}
    <div className="mt-4 space-x-1 text-center">
      <span className="text-secondary-text text-sm">
        Already have an account?
      </span>
      <button
        onClick={() => switchTo("signIn")}
        className="cursor-pointer text-sm font-bold text-blue-500 hover:underline"
      >
        Sign In
      </button>
    </div>
  </div>
);

export default SignUpForm;
