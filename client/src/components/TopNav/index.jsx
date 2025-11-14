export default function TopNav({ isSideOpen, openHandle }) {
  return (
    <div className="md:none absolute top-4 left-4 z-10">
      <button
        onClick={openHandle}
        className="border-border-color text-secondary-text hover:bg-dark-third-bg ml-auto cursor-pointer rounded-lg border p-2 transition-colors hover:text-white"
        aria-label="Collapse sidebar"
      >
        <ChevronLeft
          size={20}
          className={`transition-transform duration-300 ${
            !isSideOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}
