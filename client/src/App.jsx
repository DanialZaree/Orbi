import React from 'react';
import { useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import ChatInterface from './components/ChatInterface';
import Welcome from './components/Welcome';
import ChatInput from './components/ChatInput';
import './App.css';

function App() {
  const { authToken } = useAuth();

  return (
    <div className="flex h-screen bg-gray-800 text-white relative">
      {/* Conditionally render Sidebar and Profile (as ChatInterface) */}
      {authToken && <ChatInterface />}

      {/* Main content area that is always visible */}
      <main className="flex-1 flex flex-col items-center">
        {/* Conditionally render Login Button */}
        {!authToken && <LoginView />}

        {/* The Welcome message is always in the center */}
        <div className="flex-1 flex items-center justify-center">
          <Welcome />
        </div>

        {/* The Chat Input is always at the bottom */}
        <div className="w-full p-4">
          <ChatInput onSendMessage={() => {}} disabled={!authToken} />
        </div>
      </main>
    </div>
  );
}

export default App;