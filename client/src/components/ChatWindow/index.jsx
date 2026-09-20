import { useEffect, useRef, useState, useCallback, memo } from "react";
import ChatBubble from "../ChatBubble";
import { SpinnerCustom } from "../ui/spinner";
import homeVideo from "../../assets/green.webm";
import { ArrowDown } from "lucide-react";

function ChatWindow({ messages, isLoading, onRegenerate }) {
  const containerRef = useRef(null);
  const bottomSentinelRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isAutoScrollActiveRef = useRef(true);

  // Check if user is scrolled up
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isAtBottom = distanceFromBottom < 100;

    isAutoScrollActiveRef.current = isAtBottom;
    setShowScrollBottom(!isAtBottom);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (bottomSentinelRef.current) {
      bottomSentinelRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  }, []);

  // Auto-scroll when messages update or loading state changes if user is at the bottom
  useEffect(() => {
    if (isAutoScrollActiveRef.current) {
      scrollToBottom(true);
    }
  }, [messages, isLoading, scrollToBottom]);

  // Keep observing content size changes (e.g. while AI typewriter animates)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (isAutoScrollActiveRef.current) {
        container.scrollTop = container.scrollHeight;
      }
    });

    const contentWrapper = container.firstElementChild;
    if (contentWrapper) {
      observer.observe(contentWrapper);
    }

    return () => observer.disconnect();
  }, []);

  if (isLoading && (!messages || messages.length === 0)) {
    return (
      <div className="text-secondary-text flex h-full flex-col items-center justify-center gap-3">
        <SpinnerCustom />
        <span className="text-sm font-medium animate-pulse">Loading conversation...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative w-full flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-6 pt-12"
    >
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {messages?.map((msg, index) => {
          const isLast = index === messages.length - 1;
          return (
            <ChatBubble
              key={msg._id || `${msg.role}-${index}`}
              message={msg}
              isLastMessage={isLast}
              onRegenerate={isLast ? onRegenerate : undefined}
            />
          );
        })}

        {isLoading && messages?.length > 0 && (
          <div className="flex items-center gap-3 py-2 text-secondary-text animate-fade-in">
            <video
              src={homeVideo}
              width="48"
              height="48"
              autoPlay
              loop
              muted
              playsInline
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="flex items-center gap-2 py-1 text-sm text-secondary-text">
              <span>Orbi is thinking</span>
              <span className="flex items-center gap-1 pt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomSentinelRef} className="h-2" />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-24 right-6 md:right-12 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-dark-secondary-bg border border-border-color text-secondary-text shadow-xl transition-all duration-200 hover:bg-dark-third-bg hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Scroll to bottom"
          title="Scroll to bottom"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
}

export default memo(ChatWindow);
