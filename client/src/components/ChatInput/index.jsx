import { useRef, useState, useEffect, useCallback } from "react";

export default function ChatInput() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileinputref = useRef(null);
  const maxFiles = 4;

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Cleanup object URLs on component unmount
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
      // Reset the input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFiles]
  );

  const handlePaste = useCallback(
    (e) => {
      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        handleFiles(e.clipboardData.files);
      }
    },
    [handleFiles]
  );

  const handleAddClick = useCallback(() => {
    if (fileinputref.current) {
      fileinputref.current.click();
    }
  }, []);

  const handleRemoveFile = useCallback((indexToRemove) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles[indexToRemove];
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter((_, index) => index !== indexToRemove);
    });
  }, []);

  const isFileLimitReached = files.length >= maxFiles;

  const FileIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-gray-400 flex-shrink-0"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
    </svg>
  );

  return (
    <footer className="w-full bottom-0 py-4 sticky">
      <div className="max-w-3xl mx-auto px-4">
        <div
          onPaste={handlePaste}
          className="flex flex-col gap-2 rounded-2xl p-2 border-2 border-border-color bg-dark-secondary-bg"
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
                    className="relative group w-16 h-16 rounded-lg overflow-hidden"
                  >
                    {fileWrapper.preview &&
                      fileWrapper.file.type.startsWith("image/") && (
                        <img
                          src={fileWrapper.preview}
                          alt={fileWrapper.file.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    {fileWrapper.preview &&
                      fileWrapper.file.type.startsWith("video/") && (
                        <video
                          src={fileWrapper.preview}
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      )}
                    {!fileWrapper.preview && (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1">
                        {FileIcon}
                        <span className="text-white text-xs text-center break-all leading-tight mt-2 w-full px-1 truncate">
                          {fileWrapper.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                      aria-label="Remove file"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <textarea
            className="leading-6 w-full resize-none focus:outline-0 bg-transparent text-white py-2 px-3 placeholder:text-secondary-text max-h-40 break-words"
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
                onClick={handleAddClick}
                disabled={isFileLimitReached}
                className="text-white/70 h-10 w-10 rounded-full hover:text-white flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add file"
              >
                <svg
                  className="h-6 w-6 "
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="text-white/70 h-10 w-10 rounded-full hover:text-white flex items-center justify-center cursor-pointer"
                aria-label="Use microphone"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="23"></line>
                </svg>
              </button>
              <button
                className=" bg-blue-600 hover:bg-blue-700 h-10 w-10 rounded-full flex items-center justify-center cursor-pointer"
                aria-label="Send message"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m5 12 7-7 7 7"></path>
                  <path d="M12 19V5"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}