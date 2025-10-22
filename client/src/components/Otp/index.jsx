import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"; // Your shadcn/ui import
import { X, ArrowLeft } from "lucide-react";

// This component now accepts props from LoginView
const OtpForm = ({
  toggleModal,
  handleVerifyOtp,
  otp,
  setOtp,
  email,
  isLoading,
  error,
  localError,
  switchTo,
  handleResendOtp,
}) => {
  return (
    <div className="relative w-full max-w-md p-8 border rounded-2xl border-border-color bg-surface animate-fade-in bg-dark-secondary-bg">
      {/* --- Close Button --- */}
      <button
        onClick={toggleModal}
        className="absolute cursor-pointer right-4 top-4 text-secondary-text hover:text-white"
        aria-label="close login form"
      >
        <X size={20} />
      </button>

      {/* --- Back Button --- */}
      <button
        onClick={() => switchTo("signUp")}
        className="absolute cursor-pointer left-4 top-4 text-secondary-text hover:text-white"
        aria-label="go back to sign up"
      >
        <ArrowLeft size={20} />
      </button>

      <h2 className="mb-4 text-2xl font-bold text-center text-white">
        Verify Your Email
      </h2>
      <p className="mb-6 text-sm text-center text-secondary-text">
        We sent a code to <br />
        <span className="font-bold text-sm text-white">{email}</span>
      </p>

      {/* --- Error Display --- */}
      {(error || localError) && (
        <p className="mb-4 text-sm text-center text-red-500">
          {error || localError}
        </p>
      )}

      {/* --- OTP Form --- */}
      <form onSubmit={handleVerifyOtp} className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={4}
            pattern="^[0-9]+$"
            value={otp}
            onChange={(value) => setOtp(value)}
            className={"caret-white"}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className={"w-12 h-12 text-xl"}/>
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={1} className={"w-12 h-12 text-xl"}/>
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={2} className={"w-12 h-12 text-xl"}/>
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} className={"w-12 h-12 text-xl"}/>
            </InputOTPGroup>
          </InputOTP>
        </div>

      <div className="mt-4 space-x-1 text-center">
        <span className="text-sm text-secondary-text">
          Didn't get the code?
        </span>
        <button
          onClick={handleResendOtp}
          disabled={isLoading}
          className="text-sm font-bold text-blue-500 cursor-pointer hover:underline disabled:opacity-50"
        >
          Resend
        </button>
      </div>
        <button
          type="submit"
          disabled={isLoading || otp.length < 4} // Disable if OTP isn't filled
          className="w-full p-3 font-bold text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Verify Account"}
        </button>
      </form>

      {/* --- Resend Link --- */}
    </div>
  );
};

export default OtpForm;
