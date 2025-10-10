import { useState, useEffect } from "react";

export default function RenameModal({
  isOpen,
  onClose,
  onConfirm,
  currentName,
}) {
  const [newName, setNewName] = useState("");

  // When the modal opens, pre-fill the input with the current chat name
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (newName && newName.trim()) {
      onConfirm(newName);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
  };
  return (
    <div
      className={
        "absolute inset-0 z-[2] flex items-center justify-center bg-background/10 backdrop-blur-sm"
      }
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full max-w-sm p-5 text-center border rounded-2xl border-border-color bg-dark-secondary-bg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold text-white">Rename Chat</h2>
        <label className="sr-only" htmlFor="chat-name">
          Chat Name
        </label>
        <input
          className="w-full px-4 py-2 mb-6 text-base border rounded-xl border-border-color placeholder:text-secondary-text focus:ring-0 focus:outline-0 focus:border-blue-600"
          id="chat-name"
          name="chat-name"
          placeholder="Enter new chat name..."
          type="text"
          value={newName} // Use the 'newName' state variable
          onChange={(e) => setNewName(e.target.value)} // Update the 'newName' state
          autoFocus
          onKeyDown={handleKeyDown}
        />
        <div className="flex justify-center gap-4">
          <button
            onClick={onclose}
            className="flex-1 px-4 py-2 font-medium border cursor-pointer rounded-xl border-border-color text-secondary-text hover:bg-dark-third-bg hover:text-white"
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 text-blue-500 border border-transparent cursor-pointer rounded-xl bg-blue-950/20 hover:border hover:border-blue-500"
            onClick={handleConfirm}
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}
