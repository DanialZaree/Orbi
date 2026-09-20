import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import SettingsPanel from "../SettingPanel";
import { useGoogleLogin } from "@react-oauth/google";
import { User } from "lucide-react";
import SignInForm from "../SignIn";
import SignUpForm from "../SignUp";
import OtpForm from "../Otp";

export default function LoginView({ hideTriggerButton = false, hideModal = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState(null);

  const {
    authToken,
    login,
    logout,
    isLoading,
    error,
    user,
    emailLogin,
    requestOTP,
    verifyAndRegister,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalView,
    setAuthModalView,
  } = useAuth();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setLocalError(null);
  };

  const toggleModal = () => {
    if (isAuthModalOpen) {
      closeAuthModal();
    } else {
      openAuthModal(authToken ? "signIn" : "signUp");
    }
    resetForm();
  };

  const switchTo = (newView) => {
    setAuthModalView(newView);
    setLocalError(null);
    if (newView !== "verifyOtp") {
      setPassword("");
      setConfirmPassword("");
    }
  };

  const googleLoginHandler = useGoogleLogin({
    flow: "auth-code",
    onSuccess: (codeResponse) => login(codeResponse.code),
    onError: () => setLocalError("Google login failed. Please try again."),
  });

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }
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
      const response = await requestOTP(email);
      if (response && response.success) {
        switchTo("verifyOtp"); // FIX: replaced undefined setView with switchTo
      }
    } catch (authError) {
      console.error("OTP Request Failed:", authError);
    }
  };

  const handleResendOtp = async () => {
    setLocalError(null);
    setOtp("");
    try {
      await requestOTP(email);
    } catch (authError) {
      console.error("OTP Resend Failed:", authError);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!otp || otp.length < 4) {
      setLocalError("Please enter the complete verification code.");
      return;
    }
    await verifyAndRegister(email, password, otp);
  };

  return (
    <>
      {!hideTriggerButton && (
        <button
          type="button"
          onClick={toggleModal}
          className={`flex w-full cursor-pointer items-center gap-1.5 border-white/30 px-3 py-2 text-left ${
            authToken && user
              ? "text-white/70 hover:text-white"
              : "bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
          }`}
          aria-label="Open user menu"
        >
          {authToken && user ? (
            <>
              <img
                src={
                  user.picture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`
                }
                alt={user.name || "User"}
                className="h-5 w-5 rounded-full object-cover"
              />
              <span className="truncate">{user.name || "Profile"}</span>
            </>
          ) : (
            <>
              <User size={20} />
              <span className="truncate font-medium">Sign In / Sign Up</span>
            </>
          )}
        </button>
      )}

      {/* Render modal only if not disabled via hideModal */}
      {!hideModal && isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60">
          {authToken && user ? (
            <SettingsPanel user={user} logout={logout} onClose={toggleModal} />
          ) : authModalView === "signIn" ? (
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
          ) : authModalView === "signUp" ? (
            <SignUpForm
              toggleModal={toggleModal}
              googleLoginHandler={googleLoginHandler}
              handleRequestOtp={handleRequestOtp}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
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
            <OtpForm
              toggleModal={toggleModal}
              handleVerifyOtp={handleVerifyOtp}
              otp={otp}
              setOtp={setOtp}
              email={email}
              isLoading={isLoading}
              error={error}
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
