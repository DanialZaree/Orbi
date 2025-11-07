import { useEffect, useRef } from "react";
import { Pin, Trash2, Pencil } from "lucide-react"; // Example icons

export default function OptionsMenu({ onClose, onDelete, onRename, onPin }) {
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

  return (
    <div
      ref={menuRef}
      className="bg-dark-third-bg border-border-color absolute top-10 right-0 z-10 w-48 rounded-lg border p-1 shadow-xl"
      role="menu"
      aria-orientation="vertical"
    >
      <ul className="text-secondary-text flex flex-col gap-2">
        <li>
          <button
            onClick={onPin}
            className="hover:bg-dark-secondary-bg flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:text-white"
          >
            <Pin size={16} />
            <span>Pin</span>
          </button>
        </li>
        <li>
          <button
            onClick={onRename}
            className="hover:bg-dark-secondary-bg flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:text-white"
          >
            <Pencil size={16} />
            <span>Rename</span>
          </button>
        </li>
        <li>
          <button
            onClick={onDelete}
            className="box-border flex w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-red-950/20 px-4 py-2 text-left text-sm text-red-500 hover:border hover:border-red-500"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
