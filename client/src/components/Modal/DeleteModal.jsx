export default function DeleteModal({ isOpen, onClose, onConfirm, children }) {
  if (!isOpen) return null;
  return (
    <div
      className="bg-background/10 absolute inset-0 z-[2] flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="border-border-color bg-dark-secondary-bg flex w-full max-w-sm flex-col rounded-2xl border p-5 text-center"
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
            className="border-border-color text-secondary-text hover:bg-dark-third-bg flex-1 cursor-pointer rounded-xl border px-4 py-2 font-medium hover:text-white"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl border border-transparent bg-red-950/20 px-4 py-2 text-red-500 hover:border hover:border-red-500"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
