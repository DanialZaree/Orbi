import { useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import ChatInterface from './components/ChatInterface';
import Welcome from './components/Welcome';
import ChatInput from './components/ChatInput';
import './App.css';

function App() {
  const { authToken } = useAuth();

  return (
    <div className="relative flex h-screen font-sans text-white bg-dark-bg">
      {/* Conditionally render Sidebar and Profile (as ChatInterface) */}
      {authToken && <ChatInterface />}

      {/* Main content area that is always visible */}
      <main className="flex flex-col items-center flex-1 font-sans">
        {/* Conditionally render Login Button */}
        {!authToken && <LoginView />}

        {/* The Welcome message is always in the center */}
        <div className="flex items-center justify-center flex-1 font-sans">
          <Welcome />
        </div>

        {/* The Chat Input is always at the bottom */}        
          <ChatInput />
      </main>
    </div>
  );
}

export default App;