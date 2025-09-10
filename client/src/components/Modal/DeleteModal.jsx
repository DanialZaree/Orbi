export default function DeleteModal({ isOpen, onClose, onConfirm, children }) {
  if (!isOpen) return null;
  return (
    <div
      className="absolute inset-0 z-[2] flex items-center justify-center bg-background/10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full max-w-sm p-5 text-center border rounded-2xl border-border-color bg-dark-secondary-bg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold text-white">
          Do you want to delete it?
        </h2>
        <p className="mb-6 text-[var(--secondary-text-color)]">
          This action cannot be undone.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border  border-border-color px-4 py-2 font-medium text-secondary-text hover:bg-dark-third-bg cursor-pointer hover:text-white"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl px-4 py-2 bg-red-950/20  text-red-500 border border-transparent cursor-pointer hover:border hover:border-red-500"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
