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
    <div className="border-border-color bg-surface animate-fade-in bg-dark-secondary-bg relative w-full max-w-md rounded-2xl border p-8">
      {/* --- Close Button --- */}
      <button
        onClick={toggleModal}
        className="text-secondary-text absolute top-4 right-4 cursor-pointer hover:text-white"
        aria-label="close login form"
      >
        <X size={20} />
      </button>

      {/* --- Back Button --- */}
      <button
        onClick={() => switchTo("signUp")}
        className="text-secondary-text absolute top-4 left-4 cursor-pointer hover:text-white"
        aria-label="go back to sign up"
      >
        <ArrowLeft size={20} />
      </button>

      <h2 className="mb-4 text-center text-2xl font-bold text-white">
        Verify Your Email
      </h2>
      <p className="text-secondary-text mb-6 text-center text-sm">
        We sent a code to <br />
        <span className="text-sm font-bold text-white">{email}</span>
      </p>

      {/* --- Error Display --- */}
      {(error || localError) && (
        <p className="mb-4 text-center text-sm text-red-500">
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
              <InputOTPSlot index={0} className={"h-12 w-12 text-xl"} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={1} className={"h-12 w-12 text-xl"} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={2} className={"h-12 w-12 text-xl"} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} className={"h-12 w-12 text-xl"} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="mt-4 space-x-1 text-center">
          <span className="text-secondary-text text-sm">
            Didn't get the code?
          </span>
          <button
            onClick={handleResendOtp}
            disabled={isLoading}
            className="cursor-pointer text-sm font-bold text-blue-500 hover:underline disabled:opacity-50"
          >
            Resend
          </button>
        </div>
        <button
          type="submit"
          disabled={isLoading || otp.length < 4} // Disable if OTP isn't filled
          className="w-full cursor-pointer rounded-lg bg-blue-600 p-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Verify Account"}
        </button>
      </form>

      {/* --- Resend Link --- */}
    </div>
  );
};

export default OtpForm;
