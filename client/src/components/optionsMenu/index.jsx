import { useEffect, useRef } from "react";
import { Pin, Trash2, Pencil } from "lucide-react"; // Example icons

export default function OptionsMenu({ onClose, onDelete }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handlePin = () => {
    console.log("Pin clicked");
    onClose();
  };
  const handleRemove = () => {
    console.log("Remove clicked");
    onClose();
  };
  const handleDelete = () => {
    console.log("Delete clicked");
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute top-10 right-0 z-10 w-48 py-2 bg-dark-third-bg border border-border-color rounded-lg shadow-xl"
      role="menu"
      aria-orientation="vertical"
    >
      <ul className="text-secondary-text">
        <li>
          <button
            onClick={handlePin}
            className="flex items-center w-full cursor-pointer gap-3 px-4 py-2 text-sm text-left hover:bg-dark-secondary-bg hover:text-white"
          >
            <Pin size={16} />
            <span>Pin</span>
          </button>
        </li>
        <li>
          <button
            onClick={handleRemove}
            className="flex items-center w-full cursor-pointer gap-3 px-4 py-2 text-sm text-left hover:bg-dark-secondary-bg hover:text-white"
          >
            <Pencil size={16} />
            <span>Remove</span>
          </button>
        </li>
        <li>
          <button
            onClick={onDelete}
            className="flex items-center w-full gap-3 px-4 py-2 text-sm text-left text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
