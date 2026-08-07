import homeVideo from "../../assets/green.webm";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Welcome() {
  const { authToken, openAuthModal } = useAuth();

  return (
    <div className="self-center text-center px-4">
      <video
        src={homeVideo}
        width="720"
        autoPlay
        loop
        muted
        playsInline
        className="mx-auto"
      ></video>
      <h1 className="mb-2 text-4xl font-bold">Welcome to Orbi</h1>
      <p className="text-lg text-secondary-text mb-6">Your AI-powered chat assistant.</p>
      
      {!authToken && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal("signUp")}
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg cursor-pointer"
          >
            Create Free Account
          </button>
          <button
            onClick={() => openAuthModal("signIn")}
            className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}
