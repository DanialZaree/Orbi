import {ChevronLeft} from "lucide-react";

export default function TopNav({ isSideOpen, openHandle ,activeChatTitle}) {
  return (
    <div className="md:hidden absolute top-0  z-10 w-full h-16 grid grid-cols-1 items-center  px-4
      bg-[#11141808] 
      shadow-[0_4px_30px_rgba(0,0,0,0.1)] 
      backdrop-blur-sm 
      border 
      border-[#1114180a]">
      <button
        onClick={openHandle}
        className="border-border-color  text-secondary-text hover:bg-dark-third-bg  cursor-pointer rounded-lg border p-2 transition-colors hover:text-white
                   col-start-1 row-start-1 justify-self-start"
        aria-label="Collapse sidebar"
      >
        <ChevronLeft
          size={20}
          className={`transition-transform duration-300 ${
            !isSideOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className="col-start-1 row-start-1 justify-self-center font-semibold text-white truncate px-16"> 
        {activeChatTitle}
      </div>
    </div>
  );
}