import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import SettingsPanel from "../SettingPanel";
import { useGoogleLogin } from "@react-oauth/google";
import { User, X, Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";
import SignInForm from "../SignIn";
import SignUpForm from "../SignUp";
import OtpForm from "../Otp"; // Renamed from Otp to OtpForm for clarity

export default function LoginView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("signIn"); // 'signIn', 'signUp', 'verifyOtp'

  // --- Form State ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState(null);

  // --- Auth Context ---
  const {
    authToken,
    login, // Google login
    logout,
    isLoading,
    error, // Server error
    user,
    emailLogin, // Local login
    requestOTP,
    verifyAndRegister,
  } = useAuth();

  const wrappedSetPassword = (value) => {
    setPassword(value);
    if (localError === "Passwords do not match.") {
      setLocalError(null); // Clear the error on password change
    }
  };

  const wrappedSetConfirmPassword = (value) => {
    setConfirmPassword(value);
    if (localError === "Passwords do not match.") {
      setLocalError(null); // Clear the error on confirm password change
    }
  };

  // --- Modal Toggle ---
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    // Reset all state on open/close
    setView("signIn");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setLocalError(null);
  };

  // --- View Switching ---
  const switchTo = (newView) => {
    setView(newView);
    setLocalError(null);
    // Don't clear email/password when moving from signup to otp
    if (newView !== "verifyOtp") {
      setPassword("");
      setConfirmPassword("");
    }
  };

  // --- Google Login Handler ---
  const googleLoginHandler = useGoogleLogin({
    flow: "auth-code",
    onSuccess: (codeResponse) => login(codeResponse.code),
    onError: () => setLocalError("Google Login Failed. Please try again."),
  });

  // --- Password Visibility Toggles ---
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // --- Handlers ---
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }
    // This now calls the function from useAuth
    await emailLogin(email, password);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    try {
      // This now calls the function from useAuth
      const response = await requestOTP(email);
      if (response && response.success) {
        setView("verifyOtp"); // Move to next step
      }
    } catch (authError) {
      console.error("OTP Request Failed:", authError);
    }
  };

  // This is a new handler just for resending the OTP
  const handleResendOtp = async () => {
    setLocalError(null);
    setOtp(""); // Clear old OTP
    try {
      await requestOTP(email);
      // Optionally show a success message:
      // setLocalError("A new code has been sent.");
    } catch (authError) {
      console.error("OTP Resend Failed:", authError);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!otp || otp.length < 4) {
      // Or whatever your OTP length is
      setLocalError("Please enter the complete verification code.");
      return;
    }
    // This now calls the function from useAuth
    await verifyAndRegister(email, password, otp);
  };

  // --- MAIN RENDER ---

  return (
    <>
      <div
        onClick={toggleModal}
        className={`px-3 py-2 w-full flex items-center gap-1.5 justify cursor-pointer border-white/30 	${
          authToken && user
            ? "text-white/70 	hover:text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        aria-label="Open user menu"
      >
        {authToken && user ? (
          <>
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
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

      {/* --- Modal --- */}
      {isModalOpen && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center  backdrop-blur-sm">
          {authToken && user ? (
            <SettingsPanel user={user} logout={logout} onClose={toggleModal} />
          ) : view === "signIn" ? (
            // Pass all state and handlers as props
            <SignInForm
              toggleModal={toggleModal}
              googleLoginHandler={googleLoginHandler}
              handleSignIn={handleSignIn}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              toggleShowPassword={toggleShowPassword}
              isLoading={isLoading}
              error={error}
              localError={localError}
              switchTo={switchTo}
            />
          ) : view === "signUp" ? (
            // Pass all state and handlers as props
            <SignUpForm
              toggleModal={toggleModal}
              googleLoginHandler={googleLoginHandler}
              handleRequestOtp={handleRequestOtp}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={wrappedSetPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={wrappedSetConfirmPassword}
              showPassword={showPassword}
              toggleShowPassword={toggleShowPassword}
              showConfirmPassword={showConfirmPassword}
              toggleShowConfirmPassword={toggleShowConfirmPassword}
              isLoading={isLoading}
              error={error}
              localError={localError}
              switchTo={switchTo}
            />
          ) : (
            // view === 'verifyOtp'
            // Pass all state and handlers as props
            <OtpForm
              toggleModal={toggleModal}
              handleVerifyOtp={handleVerifyOtp}
              otp={otp}
              setOtp={setOtp}
              email={email}
              isLoading={isLoading}
              error={error}
              _
              localError={localError}
              switchTo={switchTo}
              handleResendOtp={handleResendOtp}
            />
          )}
        </div>
      )}
    </>
  );
}
