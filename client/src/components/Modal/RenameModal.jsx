import { useState } from "react";

export default function RenameModal() {
  const [close, setClose] = useState(false);
  const [chatName, setChatName] = useState("Getting Started with AI");

  const handleChange = (e) => {
    setChatName(e.target.value);
  };

  const handleClose = () => {
    setClose(true);
  };
  return (
    <div
      className={
        "absolute inset-0 z-[2] flex items-center justify-center bg-background/10 backdrop-blur-sm" +
        (close ? " hidden" : "")
      }
    >
      <div className="flex flex-col w-full max-w-sm p-5 text-center border rounded-2xl border-border-color bg-dark-secondary-bg">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Rename Chat
        </h2>
        <label className="sr-only" htmlFor="chat-name">
          Chat Name
        </label>
        <input
          onChange={handleChange}
          className="w-full px-4 py-2 mb-6 text-base border rounded-xl border-border-color placeholder:text-secondary-text focus:ring-0 focus:outline-0 focus:border-blue-600"
          id="chat-name"
          name="chat-name"
          placeholder="Enter new chat name..."
          type="text"
          value={chatName}
        />
        <div className="flex justify-center gap-4">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 font-medium border cursor-pointer rounded-xl border-border-color text-secondary-text hover:bg-dark-third-bg hover:text-white"
          >
            Cancel
          </button>
          <button className="flex-1 px-4 py-2 text-blue-500 border border-transparent cursor-pointer rounded-xl bg-blue-950/20 hover:border hover:border-blue-500">
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}
