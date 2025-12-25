import { useState, useEffect } from "react";
import { 
  Bot, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  ChevronDown, 
  RotateCcw 
} from "lucide-react";
import orbi from "../../assets/orbi.webp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import { createHighlighter } from "shiki/bundle/web";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// This function checks if the text contains characters from the Arabic script Unicode range.
function isRTL(text) {
  const rtlRegex = /[\u0600-\u06FF]/;
  return rtlRegex.test(text);
}

// --- Shiki Highlighter ---
const highlighterPromise = createHighlighter({
  themes: ["tokyo-night"],
  langs: [
    "javascript",
    "typescript",
    "python",
    "jsx",
    "tsx",
    "html",
    "css",
    "json",
    "markdown",
    "bash",
  ],
});

// --- ShikiCodeBlock Component ---
function ShikiCodeBlock({ code, lang }) {
  const [htmlBlock, setHtmlBlock] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    highlighterPromise.then(async (highlighter) => {
      try {
        if (!highlighter.getLoadedLanguages().includes(lang)) {
          await highlighter.loadLanguage(lang);
        }
        const html = highlighter.codeToHtml(code, {
          lang,
          theme: "tokyo-night",
        });
        if (isMounted) setHtmlBlock(html);
      } catch (error) {
        console.warn(
          `Shiki language "${lang}" not found. Falling back to plaintext.`,
        );
        if (isMounted) {
          const fallbackHtml = highlighter.codeToHtml(code, {
            lang: "plaintext",
            theme: "tokyo-night",
          });
          setHtmlBlock(fallbackHtml);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [code, lang]);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <details
      open
      className="group border-border-color group relative my-4 w-full overflow-hidden rounded-lg border"
    >
      <summary className="border-border-color flex items-center justify-between border-b bg-[#1a1b26] px-3 py-1.5">
        <div className="ajab flex items-center gap-2">
          <span className="text-secondary-text text-sm tracking-wide uppercase">
            {lang}
          </span>
          <ChevronDown
            size={20}
            className="text-secondary-text cursor-pointer transition-transform duration-200 group-open:rotate-180 hover:text-white"
          />
        </div>
        <button
          onClick={handleCopy}
          className="text-secondary-text hover:bg-dark-third-bg flex cursor-pointer items-center gap-1.5 rounded-xl p-2 text-sm transition hover:text-white"
        >
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
          {isCopied ? "Copied!" : "Copy"}
        </button>
      </summary>
      <div dangerouslySetInnerHTML={{ __html: htmlBlock }} />
    </details>
  );
}

export default function ChatBubble({ message, isLastMessage, onRegenerate }) {
  const isUser = message.role === "user";
  const [isMessageCopied, setIsMessageCopied] = useState(false);

  // Function to copy the entire message content
  const handleCopyMessage = () => {
    // Combine text from all blocks that contain text or code
    const allText = message.content
      ?.map((block) => {
        if (block.type === "text" || block.type === "code") {
          return block.value;
        }
        return ""; 
      })
      .join("\n");

    if (allText) {
      navigator.clipboard.writeText(allText).then(() => {
        setIsMessageCopied(true);
        setTimeout(() => setIsMessageCopied(false), 2000);
      });
    }
  };

  return (
    <div
      className={`flex w-full items-start gap-4 overflow-hidden max-sm:gap-1 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="bg-surface flex shrink-0 items-center justify-center rounded-full max-sm:hidden">
          <img src={orbi} alt="Orbi Logo" className="mt-2 h-8 max-sm:h-6" />
        </div>
      )}
      <div
        className={`relative max-w-[85%] rounded-2xl px-1 py-1 wrap-break-word ${
          isUser ? "rounded-br-xs bg-blue-700/55" : "bg-surface"
        }`}
      >
        {message.content?.map((block, index) => {
          // 1. Render Code Blocks
          if (block.type === "code") {
            return (
              <ShikiCodeBlock
                key={index}
                code={block.value}
                lang={block.language || "plaintext"}
              />
            );
          }

          // 2. Render Image Blocks
          if (block.type === "image") {
            if (
              typeof block.value === "string" &&
              block.value.startsWith("data:video/")
            ) {
              return (
                <video
                  key={index}
                  src={block.value}
                  controls
                  className="max-h-[450px] w-full max-w-[600px] rounded-lg object-contain max-sm:max-w-full"
                >
                  Your browser does not support the video tag.
                </video>
              );
            }
            return (
              <img
                key={index}
                src={block.value}
                alt="User uploaded content"
                className="max-h-[450px] max-w-[600px] rounded-lg object-contain max-sm:max-w-full"
              />
            );
          }
          if (block.type === "video") {
            return (
              <video
                key={index}
                src={block.value}
                controls
                className="max-h-[450px] max-w-[600px] rounded-lg object-contain max-sm:max-w-full"
              >
                Your browser does not support the video tag.
              </video>
            );
          }
          // 3. Render Text Blocks
          if (typeof block.value === "string" && block.value.trim() !== "") {
            const isRtlText = isRTL(block.value);
            return (
              <div
                key={index}
                className={`prose-sm prose prose-invert px-2 py-1`}
                dir={isRtlText ? "rtl" : "ltr"}
              >
                {!isUser && isLastMessage && typeof TextType !== "undefined" ? (
                  <TextType
                    text={block.value}
                    typingSpeed={20}
                    loop={false}
                    showCursor={true}
                    cursorCharacter="█"
                    className="prose prose-invert prose-sm"
                  />
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[
                      [
                        rehypeExternalLinks,
                        { target: "_blank", rel: ["noopener", "noreferrer"] },
                      ],
                      rehypeKatex,
                    ]}
                    components={{
                      p: ({ node, children }) => {
                        if (
                          node.children[0]?.type === "element" &&
                          node.children[0]?.properties?.className?.includes(
                            "math-display",
                          )
                        ) {
                          return (
                            <div className="my-4 flex justify-center">
                              {children}
                            </div>
                          );
                        }
                        return (
                          <p className="my-3 first:mt-0 last:mb-0">
                            {children}
                          </p>
                        );
                      },
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                        >
                          {props.children} <LinkIcon size={12} />
                        </a>
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="my-3 list-none pl-0" />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol {...props} className="my-3 list-none pl-0" />
                      ),
                    }}
                  >
                    {block.value}
                  </ReactMarkdown>
                )}
              </div>
            );
          }
          return null;
        })}

        {/* --- Action Buttons (Copy & Regenerate) --- */}
        {!isUser && (
          <div className=" flex items-center justify-start gap-2 mt-2">
            <button
              onClick={handleCopyMessage}
              className="text-secondary-text hover:bg-white/10 rounded-lg p-1.5 transition-colors hover:text-white cursor-pointer"
              title="Copy response"
            >
              {isMessageCopied ? (
                <Check size={16} className="text-gray-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
            
            {/* Logic change: Only show Regenerate if the prop is available */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="text-secondary-text hover:bg-white/10 rounded-lg p-1.5 transition-colors hover:text-white cursor-pointer"
                title="Regenerate response"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}