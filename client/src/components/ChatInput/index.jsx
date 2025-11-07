import { useRef, useState, useEffect, useCallback } from "react";
import { Mic, Plus, X, Forward, File } from "lucide-react";

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
    // --- ADDED: Wrap everything in a form for proper submission handling ---
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="sticky bottom-0 mx-auto mt-auto max-w-3xl self-end py-4"
    >
      <div className="mx-auto max-w-3xl px-4">
        <div
          onPaste={handlePaste}
          className="border-border-color bg-dark-secondary-bg flex flex-col gap-2 rounded-2xl border-2 p-2 shadow-[0px_4px_10px_0px] shadow-blue-600/10"
        >
          <div
            className={`flex flex-col rounded-2xl p-2 ${
              files.length === 0 ? "hidden" : ""
            }`}
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
                      <div className="bg-surface flex h-full w-full flex-col items-center justify-center p-1">
                        <File />
                        <span className="mt-2 w-full truncate px-1 text-center text-xs leading-tight break-all text-white">
                          {fileWrapper.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 z-10 cursor-pointer rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      aria-label="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <textarea
            className="placeholder:text-secondary-text max-h-40 w-full resize-none bg-transparent px-3 py-2 leading-6 break-words text-white focus:outline-0"
            placeholder="Ask ORBI :)"
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddClick}
                disabled={isFileLimitReached}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Add file"
              >
                <Plus />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button" // --- ADDED: type="button" to prevent form submission ---
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 hover:text-white"
                aria-label="Use microphone"
                disabled={disabled}
              >
                <Mic />
              </button>
              <button
                type="submit" // --- ADDED: type="submit" to trigger form's onSubmit ---
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
                disabled={disabled}
              >
                <Forward size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
