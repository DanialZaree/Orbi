import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import LoginView from "./components/LoginView";
import Welcome from "./components/Welcome";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./App.css";

function App() {
  const { authToken } = useAuth();

  return (
    <div className="relative flex h-screen font-sans text-white bg-dark-bg">
      {/* Conditionally render Sidebar and Profile (as ChatInterface) */}
      <Sidebar />

      {/* Main content area that is always visible */}
      <main className="flex flex-col items-center flex-1 font-sans">
        {/* Conditionally render Login Button */}
        <LoginView />

        {/* The Welcome message is always in the center */}
        <div className="flex items-center justify-center flex-1 font-sans">
          {/* <Welcome /> */}
          <ChatWindow />
        </div>

        {/* The Chat Input is always at the bottom */}
        <ChatInput />
      </main>
    </div>
  );
}

export default App;
