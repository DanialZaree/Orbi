import { useRef, useState, useEffect, useCallback, memo } from "react";
import { Plus, X, ArrowUp, File, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const MAX_FILES = 4;

function ChatInput({ onSendMessage, disabled = false }) {
  const { authToken, openAuthModal } = useAuth();
  const isAuthenticated = !!authToken;

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const filesRef = useRef(files);
  filesRef.current = files;

  // Auto-resize textarea smoothly with content
  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 180);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > 180 ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [text, adjustTextareaHeight]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      filesRef.current.forEach((fw) => {
        if (fw.preview) URL.revokeObjectURL(fw.preview);
      });
    };
  }, []);

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleFiles = useCallback((incomingFiles) => {
    const newFiles = Array.from(incomingFiles);
    setFiles((prevFiles) => {
      const remainingSlots = MAX_FILES - prevFiles.length;
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

  const handleFileChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handlePaste = (e) => {
    if (!isAuthenticated) {
      openAuthModal("signUp");
      return;
    }
    if (e.clipboardData?.files?.length > 0) {
      e.preventDefault();
      handleFiles(e.clipboardData.files);
    }
  };

  const handleAddClick = () => {
    if (!isAuthenticated) {
      openAuthModal("signUp");
      return;
    }
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles[indexToRemove];
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!isAuthenticated) {
      openAuthModal("signUp");
      return;
    }
    if (disabled) return;

    const trimmed = text.trim();
    if (trimmed || files.length > 0) {
      onSendMessage({ text: trimmed, files: files.map((fw) => fw.file) });
      setText("");
      files.forEach((fw) => {
        if (fw.preview) URL.revokeObjectURL(fw.preview);
      });
      setFiles([]);

      // Reset textarea height to default 1 line
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Respect IME composition (e.g. Persian, Chinese, Japanese typing)
      if (e.nativeEvent?.isComposing) return;
      e.preventDefault();
      handleSubmit();
    }
  };

  const isFileLimitReached = files.length >= MAX_FILES;
  const isSendDisabled =
    disabled || !isAuthenticated || (!text.trim() && files.length === 0);

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 mx-auto mt-auto w-full self-end py-2 sm:py-3"
    >
      {!isAuthenticated && (
        <div className="mx-auto mb-2.5 flex max-w-3xl items-center justify-between rounded-xl border border-blue-500/30 bg-blue-950/50 px-3.5 py-2 backdrop-blur-md text-xs sm:text-sm text-blue-100 shadow-lg">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-400 shrink-0" />
            <span>Sign in or create an account to chat with Orbi AI</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal("signIn")}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("signUp")}
              className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-xs cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-3xl flex-row items-end gap-2 px-2 sm:px-4">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={handleAddClick}
          disabled={disabled || (isAuthenticated && isFileLimitReached)}
          title={
            !isAuthenticated
              ? "Sign up to attach files"
              : isFileLimitReached
              ? "File limit reached (max 4)"
              : "Attach media or files"
          }
          className="border-border-color bg-dark-secondary-bg mb-1 flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border text-secondary-text shadow-xs transition-colors hover:bg-dark-third-bg hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Attach files"
        >
          <Plus className="h-5 w-5" />
        </button>

        {/* Input & Preview Wrapper */}
        <div
          onPaste={handlePaste}
          className={`border-border-color bg-dark-secondary-bg flex min-h-[48px] w-full flex-col rounded-3xl border px-3 py-1.5 shadow-md transition-colors ${
            disabled ? "opacity-75" : "focus-within:border-blue-500/60"
          }`}
        >
          {/* File Previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2 pt-1">
              {files.map((fileWrapper, index) => (
                <div
                  key={`${fileWrapper.file.name}-${index}`}
                  className="group relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-lg border border-border-color bg-dark-third-bg"
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
                    <div className="flex h-full w-full flex-col items-center justify-center p-1">
                      <File size={18} className="text-blue-400" />
                      <span className="mt-1 w-full truncate px-1 text-center text-[9px] text-gray-200">
                        {fileWrapper.file.name}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    disabled={disabled}
                    className="absolute right-1 top-1 z-10 cursor-pointer rounded-full bg-black/70 p-1 text-white opacity-90 transition hover:bg-black"
                    aria-label="Remove file"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text Area and Send Action */}
          <div className="flex w-full flex-row items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={
                disabled
                  ? "Orbi is thinking..."
                  : isAuthenticated
                  ? "Ask Orbi anything... (Shift+Enter for new line)"
                  : "Ask Orbi... (Sign in to chat)"
              }
              className="placeholder:text-secondary-text max-h-[180px] w-full resize-none bg-transparent py-2 text-sm leading-relaxed text-white focus:outline-none disabled:cursor-not-allowed"
              id="chat-input"
              name="chat-input"
            />

            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />

            <div className="flex shrink-0 items-center pb-1">
              <button
                type="submit"
                disabled={isSendDisabled}
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:opacity-40"
                aria-label="Send message"
                title={disabled ? "Waiting for response" : "Send message (Enter)"}
              >
                {disabled ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default memo(ChatInput);
