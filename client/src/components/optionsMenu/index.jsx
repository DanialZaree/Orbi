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
    console.log("Rename clicked");
    onClose();
  };
  const handleDelete = () => {
    console.log("Delete clicked");
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 z-10 w-48 p-1 border rounded-lg shadow-xl top-10 bg-dark-third-bg border-border-color"
      role="menu"
      aria-orientation="vertical"
    >
      <ul className="flex flex-col gap-2 text-secondary-text">
        <li>
          <button
            onClick={handlePin}
            className="flex items-center w-full gap-3 px-4 py-2 text-sm text-left rounded-lg cursor-pointer hover:bg-dark-secondary-bg hover:text-white "
          >
            <Pin size={16} />
            <span>Pin</span>
          </button>
        </li>
        <li>
          <button
            onClick={handleRemove}
            className="flex items-center w-full gap-3 px-4 py-2 text-sm text-left rounded-lg cursor-pointer hover:bg-dark-secondary-bg hover:text-white"
          >
            <Pencil size={16} />
            <span>Rename</span>
          </button>
        </li>
        <li>
          <button
            onClick={onDelete}
            className="box-border flex items-center w-full gap-3 px-4 py-2 text-sm text-left text-red-500 border border-transparent rounded-lg cursor-pointer hover:border bg-red-950/20 hover:border-red-500"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
