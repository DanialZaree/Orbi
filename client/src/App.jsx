import React from 'react';
import { useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const { authToken } = useAuth(); // Use the hook to get the token

  return (
    <div className="app-container">
      {authToken ? <ChatInterface /> : <LoginView />}
    </div>
  );
}

export default App;
