  import { useState, useEffect } from 'react'
  import reactLogo from './assets/react.svg'
  import viteLogo from '/vite.svg'
  import './App.css'

  export default function App() {
    const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch('http://localhost:5000/api/endpoint')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Data received:', data);
        setMessage(data.message); // ✅ Now setMessage exists
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        setMessage('Failed to fetch data.');
      });
  }, []);

    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <h1 className="text-5xl font-bold">
          {message}
        </h1>
      </div>
    )
  }

