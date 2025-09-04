import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
// Import the hook instead of the component
import { useGoogleLogin } from '@react-oauth/google'; 
import { FcGoogle } from "react-icons/fc";

export default function LoginView() {
  const { login } = useAuth();

  // This hook gives us a function to trigger the Google login popup
  const googleLogin = useGoogleLogin({
    // We use the 'auth-code' flow, which is more secure
    flow: 'auth-code', 
    onSuccess: (codeResponse) => {
      // The successful response gives us a one-time code
      // We send this code to our backend
      login(codeResponse.code);
    },
    onError: () => {
      console.error("Google Login Failed");
    },
  });

  return (
    <div className="absolute inset-0 z-[2] flex items-center justify-center bg-background/10 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border-color bg-dark-secondary-bg p-8">
        <h2 className="mb-6 text-center text-2xl font-bold">Sign In</h2>
        
        {/* This is YOUR custom button */}
        <button
          onClick={() => googleLogin()} // Trigger the hook's function on click
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-border px-4 py-3 text-white  bg-dark-third-bg hover:bg-hover-bg"
        >
          <FcGoogle size={24} />
          <span>Sign In with Google</span>
        </button>
      </div>
    </div>
  );
}