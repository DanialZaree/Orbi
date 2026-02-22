import { useRef, useState, useEffect, useCallback } from "react";
import { Mic, Plus, X, ArrowUp, File } from "lucide-react";

// --- ADDED: Receive onSendMessage and disabled props from the parent component (App.jsx) ---
export default function ChatInput({ onSendMessage, disabled }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileinputref = useRef(null);
  const maxFiles = 4;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    return () => {
      files.forEach((fileWrapper) => {
        if (fileWrapper.preview) {
          URL.revokeObjectURL(fileWrapper.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback((e) => {
    setText(e.target.value);
  }, []);

  const handleFiles = useCallback((incomingFiles) => {
    const newFiles = Array.from(incomingFiles);
    setFiles((prevFiles) => {
      const remainingSlots = maxFiles - prevFiles.length;
      if (remainingSlots <= 0) return prevFiles;
      const filesToAdd = newFiles.slice(0, remainingSlots).map((file) => {
        const isMedia =
          file.type.startsWith("image/") || file.type.startsWith("video/");
        return {
          file,
          preview: isMedia ? URL.createObjectURL(file) : null,
        };
      });
      return [...prevFiles, ...filesToAdd];
    });
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
      e.target.value = "";
    },
    [handleFiles],
  );

  const handlePaste = useCallback(
    (e) => {
      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        handleFiles(e.clipboardData.files);
      }
    },
    [handleFiles],
  );

  const handleAddClick = useCallback(() => {
    if (fileinputref.current) {
      fileinputref.current.click();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleRemoveFile = useCallback((indexToRemove) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles[indexToRemove];
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter((_, index) => index !== indexToRemove);
    });
  }, []);

  // --- ADDED: Function to handle form submission ---
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the page from reloading
    // Check if there is text or files to send, and if the input is not disabled
    if ((text.trim() || files.length > 0) && !disabled) {
      // Call the onSendMessage function passed from App.jsx with the text and files
      onSendMessage({ text, files: files.map((fw) => fw.file) });
      // Clear the inputs after sending
      setText("");
      setFiles([]);
    }
  };

  const isFileLimitReached = files.length >= maxFiles;

  return (
<form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="sticky bottom-0 mx-auto mt-auto w-full self-end py-4"
    >
      <div className="mx-auto flex max-w-3xl flex-row items-end gap-2 px-2 sm:px-4">
        
        <button
          type="button"
          onClick={handleAddClick}
          disabled={isFileLimitReached}
          className="border-border-color bg-dark-secondary-bg mb-1 flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 text-white/70 transition-colors hover:bg-dark-third-bg hover:text-white"
          aria-label="Add file"
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <div
          onPaste={handlePaste}
          className="border-border-color bg-dark-secondary-bg flex min-h-12 w-full flex-col rounded-4xl border-2 px-2 py-1 pr-0"
        >
          <div
            className={`flex flex-col p-2 ${files.length === 0 ? "hidden" : ""}`}
          >
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((fileWrapper, index) => (
                  <div
                    key={`${fileWrapper.file.name}-${index}`}
                    className="group relative h-16 w-16 overflow-hidden rounded-lg"
                  >
                    {fileWrapper.preview &&
                      fileWrapper.file.type.startsWith("image/") && (
                        <img
                          src={fileWrapper.preview}
                          alt={fileWrapper.file.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    {fileWrapper.preview &&
                      fileWrapper.file.type.startsWith("video/") && (
                        <video
                          src={fileWrapper.preview}
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      )}
                    {!fileWrapper.preview && (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-700 p-1">
                        <File size={20} className="text-white/70" />
                        <span className="mt-1 w-full truncate break-all px-1 text-center text-[10px] leading-tight text-white">
                          {fileWrapper.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute right-1 top-1 z-10 cursor-pointer rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      aria-label="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex w-full flex-row items-center gap-2 pb-1 pl-2 pr-1 pt-1">
            <textarea
              className="placeholder:text-secondary-text wrap-break-word max-h-40 w-full resize-none bg-transparent leading-6 text-white focus:outline-none"
              placeholder="Ask ChatGPT"
              onChange={handleChange}
              value={text}
              ref={textareaRef}
              rows={1}
              name="chat-input"
              id="chat-input"
            ></textarea>

            <input
              type="file"
              multiple
              ref={fileinputref}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*"
            />

            <div className="flex shrink-0 items-center gap-3 pr-1">
              
              <button
                type="submit"
                className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-blue-600 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
                disabled={disabled}
              >
                <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
