import { useState } from "react";

export default function DeleteModal() {
const [close, setClose] = useState(false);

const handleClose = () =>{
    setClose(!close);
}

  return (
    <div className={"absolute inset-0 z-[2] flex items-center justify-center bg-background/10 backdrop-blur-sm"+ (close ? " hidden" : "")}>
      <div className="flex flex-col w-full max-w-sm p-5 text-center border rounded-2xl border-border-color bg-dark-secondary-bg">
        <h2 class="mb-4 text-xl font-semibold text-white">
          Do you want to delete it?
        </h2>
        <p class="mb-6 text-[var(--secondary-text-color)]">
          This action cannot be undone.
        </p>
        <div class="flex justify-center gap-4">
          <button onClick={handleClose} class="flex-1 rounded-lg border  border-border-color px-4 py-2 font-medium text-secondary-text hover:bg-dark-third-bg cursor-pointer hover:text-white">
            No
          </button>
          <button class="flex-1 rounded-lg px-4 py-2  text-red-500 border border-transparent cursor-pointer hover:border hover:border-red-500">
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
