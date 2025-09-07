import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { User } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { X } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { Lock } from 'lucide-react';
import { Mail } from 'lucide-react';
import { Brain } from 'lucide-react';
import { LogOut  } from 'lucide-react';

export default function LoginView() {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [closeModal, setCloseModal] = useState(true);

  const toggleCloseModal = () => {
    setCloseModal(!closeModal);
  };

  const { login } = useAuth();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: (codeResponse) => {
      login(codeResponse.code);
    },
    onError: () => {
      console.error("Google Login Failed");
    },
  });

  return (
    <>
      <button
        onClick={toggleCloseModal}
        className="absolute flex items-center justify-center w-10 h-10 border border-solid rounded-full cursor-pointer right-4 top-4 border-white/30 text-white/70 hover:bg-white/10 hover:text-white"
      >
            <User />
      </button>
      {/* <div
        className={
          "absolute inset-0 z-[2] flex items-center justify-center bg-background/10 backdrop-blur-sm" +
          (closeModal ? " hidden" : "")
        }
      >
        <div className="relative w-full max-w-md p-8 border rounded-2xl border-border-color bg-dark-secondary-bg">
          <button
            onClick={toggleCloseModal}
            className="absolute cursor-pointer right-4 top-4 text-secondary-text hover:text-white"
            aria-label="close login form"
          >
            <svg
              data-v-15b35c9e=""
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
          <h2 className="mb-6 text-2xl font-bold text-center">Sign In</h2>

          <button
            onClick={() => googleLogin()}
            className="flex items-center justify-center w-full gap-3 p-3 text-white rounded-lg cursor-pointer bg-border bg-dark-third-bg hover:bg-hover-bg/70"
          >
            <FcGoogle size={24} />
            <span>Sign In with Google</span>
          </button>
          <div className="flex flex-row items-center w-full my-6">
            <hr className="w-full border-t border-border-color" />
            <span className="px-3 text-sm text-secondary-text">OR</span>
            <hr className="w-full border-t border-border-color" />
          </div>
          <div className="space-y-4">
            <div className="">
              <label
                htmlFor="email"
                className="block mb-2 text-sm text-secondary-text"
              >
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full p-3 border rounded-lg bg-dark-bg border-border-color placeholder:text-secondary-text focus:ring focus:outline focus:outline-blue-600 focus:border-blue-600"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block mb-2 text-sm text-secondary-text"
              >
                Password
              </label>
              <button
                onClick={toggleShowPassword}
                aria-label={!showPassword ? "show password" : "hide password"}
                className="absolute z-10 -translate-y-1/2 cursor-pointer right-4 top-2/3 text-secondary-text"
              >
                {!showPassword ? (
                  <svg
                    className="w-5 h-5"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
                    <path d="m2 2 20 20"></path>
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full p-3 tracking-widest border rounded-lg placeholder:tracking-widest bg-dark-bg border-border-color placeholder:text-secondary-text focus:ring focus:outline focus:outline-blue-600 focus:border-blue-600"
              />
            </div>
            <button className="w-full p-3 font-bold text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700">
              Sign In
            </button>
          </div>
        </div>
      </div> */}
      <div
        className={
          "absolute inset-0 z-[2] flex items-center justify-center bg-background/10 backdrop-blur-sm" +
          (closeModal ? " hidden" : "")
        }
      >
        <div className="flex flex-col w-full max-w-2xl border rounded-2xl border-border-color bg-dark-secondary-bg">
          <div className="flex flex-row items-center justify-between w-full p-2 px-5 border-b border-border-color">
            <div className="space-y-1.5 text-center flex flex-row justify-between items-center gap-2 ">
              <nav className="flex items-center">
                <div className="flex items-center text-secondary-text">
                  <span className="font-normal text-muted-foreground ">
                    Setting
                  </span>
                  <ChevronRight size={18} className="mt-1" />
                </div>
                <div className="flex items-center">
                  <span className="font-bold">
                    <h2 className="p-0 font-medium text-center">Profile</h2>
                  </span>
                </div>
              </nav>
            </div>
            <button
              onClick={toggleCloseModal}
              className="cursor-pointer text-secondary-text hover:text-white"
              aria-label="close login form"
            >
              <X size={18}/>
            </button>
          </div>
          <div className="flex flex-row h-[75]">
            <div className="w-1/3 p-5">
              <div className="w-full overflow-auto">
                <ul className="flex flex-col flex-1 gap-2">
                  <li>
                    <button className="flex flex-row items-center w-full gap-2 px-3 py-2 cursor-pointer bg-dark-third-bg hover:bg-hover-bg/70 rounded-xl" ><User size={16} />Profile</button>
                  </li>
                  <li>
                    <button disabled={true} className="flex flex-row items-center w-full gap-2 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover-bg rounded-xl text-secondary-text disabled:hover:bg-transparent" ><Sparkles size={16} />Premium</button>
                  </li>
                  <div className="h-px bg-border-color"></div>
                  <li>
                    <button className="flex flex-row items-center w-full gap-2 px-3 py-2 cursor-pointer hover:bg-hover-bg rounded-xl" ><Brain size={16} />Memory</button>
                  </li>
                  <li>
                    <button className="flex flex-row items-center w-full gap-2 px-3 py-2 cursor-pointer hover:bg-hover-bg rounded-xl" ><Lock size={16} />Privacy</button>
                  </li>
                  <li>
                    <button className="flex flex-row items-center w-full gap-2 px-3 py-2 cursor-pointer hover:bg-hover-bg rounded-xl" ><Lock size={16} />About Us</button>
                  </li>
                  <li>
                    <button className="flex flex-row items-center w-full gap-2 px-3 py-2 cursor-pointer hover:bg-hover-bg rounded-xl" ><Mail size={16} />Contact Us</button>
                  </li>
                  <li className="mt-10">
                    <button className="box-border flex flex-row items-center w-full gap-2 px-3 py-2 text-red-500 border border-transparent cursor-pointer hover:border hover:border-red-500 rounded-xl" ><LogOut  size={16} />Log Out </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-2/3 p-5">a</div>
          </div>
        </div>
      </div>
    </>
  );
}
