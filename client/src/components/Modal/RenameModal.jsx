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
        "bg-background/10 absolute inset-0 z-[2] flex items-center justify-center backdrop-blur-sm"
      }
      onClick={onClose}
    >
      <div
        className="border-border-color bg-dark-secondary-bg flex w-full max-w-sm flex-col rounded-2xl border p-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold text-white">Rename Chat</h2>
        <label className="sr-only" htmlFor="chat-name">
          Chat Name
        </label>
        <input
          className="border-border-color placeholder:text-secondary-text mb-6 w-full rounded-xl border px-4 py-2 text-base focus:border-blue-600 focus:ring-0 focus:outline-0"
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
            className="border-border-color text-secondary-text hover:bg-dark-third-bg flex-1 cursor-pointer rounded-xl border px-4 py-2 font-medium hover:text-white"
          >
            Cancel
          </button>
          <button
            className="flex-1 cursor-pointer rounded-xl border border-transparent bg-blue-950/20 px-4 py-2 text-blue-500 hover:border hover:border-blue-500"
            onClick={handleConfirm}
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}
