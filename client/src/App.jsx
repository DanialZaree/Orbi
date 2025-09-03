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
    <div className="flex h-screen bg-dark-bg   text-white relative font-sans">
      {/* Conditionally render Sidebar and Profile (as ChatInterface) */}
      {authToken && <ChatInterface />}

      {/* Main content area that is always visible */}
      <main className="flex-1 flex flex-col items-center font-sans">
        {/* Conditionally render Login Button */}
        {!authToken && <LoginView />}

        {/* The Welcome message is always in the center */}
        <div className="flex-1 flex items-center justify-center font-sans">
          <Welcome />
        </div>

        {/* The Chat Input is always at the bottom */}        
          <ChatInput />
      </main>
    </div>
  );
}

export default App;