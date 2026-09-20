import { useState, useEffect, memo } from "react";
import {
  Copy,
  Check,
  Link as LinkIcon,
  ChevronDown,
  RotateCcw,
  File,
} from "lucide-react";
import orbi from "../../assets/orbi.webp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import { createHighlighter } from "shiki/bundle/web";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Helper: RTL Detection
const isRTL = (text) => /[\u0600-\u06FF]/.test(text);

// Markdown custom components
const MARKDOWN_COMPONENTS = {
  p: ({ node, children }) => {
    if (
      node.children?.[0]?.type === "element" &&
      node.children[0]?.properties?.className?.includes("math-display")
    ) {
      return <div className="my-4 flex justify-center">{children}</div>;
    }
    return <p className="my-3 first:mt-0 last:mb-0">{children}</p>;
  },
  a: (props) => (
    <a
      {...props}
      className="inline-flex items-center gap-1 text-blue-400 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children} <LinkIcon size={12} />
    </a>
  ),
  ul: (props) => <ul {...props} className="my-3 list-disc pl-5" />,
  ol: (props) => <ol {...props} className="my-3 list-decimal pl-5" />,
};

// Lazy Shiki Highlighter singleton
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

// Memoized Shiki Code Block
const ShikiCodeBlock = memo(function ShikiCodeBlock({ code, lang }) {
  const [htmlBlock, setHtmlBlock] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    highlighterPromise
      .then(async (highlighter) => {
        try {
          if (!highlighter.getLoadedLanguages().includes(lang)) {
            await highlighter.loadLanguage(lang);
          }
          const html = highlighter.codeToHtml(code, {
            lang,
            theme: "tokyo-night",
          });
          if (isMounted) setHtmlBlock(html);
        } catch {
          if (isMounted) {
            const fallbackHtml = highlighter.codeToHtml(code, {
              lang: "plaintext",
              theme: "tokyo-night",
            });
            setHtmlBlock(fallbackHtml);
          }
        }
      })
      .catch(() => {
        // Fallback for highlighting failure
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
      className="border-border-color group relative my-4 w-full overflow-hidden rounded-lg border"
    >
      <summary className="border-border-color flex items-center justify-between border-b bg-[#1a1b26] px-3 py-1.5 cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="text-secondary-text text-sm tracking-wide uppercase">
            {lang}
          </span>
          <ChevronDown
            size={20}
            className="text-secondary-text transition-transform duration-200 group-open:rotate-180 hover:text-white"
          />
        </div>
        <button
          type="button"
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
});

// Highly optimized typewriter: renders plain text during animation, switches to full AST Markdown when finished
const Typewriter = memo(function Typewriter({ text, speed = 12 }) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const isFinished = displayedLength >= text.length;

  useEffect(() => {
    setDisplayedLength(0);
    const charsPerBatch = Math.max(1, Math.floor(25 / speed));
    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + charsPerBatch;
        if (next >= text.length) {
          clearInterval(timer);
          return text.length;
        }
        return next;
      });
    }, 25);

    return () => clearInterval(timer);
  }, [text, speed]);

  if (!isFinished) {
    return (
      <div className="whitespace-pre-wrap leading-relaxed">
        {text.slice(0, displayedLength)}
        <span className="inline-block h-4 w-1.5 animate-pulse bg-blue-500 ml-0.5 align-middle" />
      </div>
    );
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
        rehypeKatex,
      ]}
      components={MARKDOWN_COMPONENTS}
    >
      {text}
    </ReactMarkdown>
  );
});

function ChatBubble({ message, isLastMessage, onRegenerate }) {
  const isUser = message.role === "user";
  const [isMessageCopied, setIsMessageCopied] = useState(false);

  const handleCopyMessage = () => {
    const allText = message.content
      ?.map((block) => (block.type === "text" || block.type === "code" ? block.value : ""))
      .filter(Boolean)
      .join("\n\n");

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
        className={`relative max-w-[95%] rounded-2xl px-3 py-2 wrap-break-word ${
          isUser ? "rounded-br-xs bg-blue-700/55" : "bg-surface"
        }`}
      >
        {message.content?.map((block, index) => {
          const key = `${block.type}-${index}`;

          // 1. Code Block
          if (block.type === "code") {
            return (
              <ShikiCodeBlock
                key={key}
                code={block.value}
                lang={block.language || "plaintext"}
              />
            );
          }

          // 2. Video / Image Blocks
          const isMediaVideo =
            block.type === "video" ||
            (block.type === "image" &&
              typeof block.value === "string" &&
              block.value.startsWith("data:video/"));

          if (block.type === "video" || block.type === "image") {
            if (isMediaVideo) {
              return (
                <video
                  key={key}
                  src={block.value}
                  controls
                  className="my-2 max-h-[450px] w-full max-w-[600px] rounded-lg object-contain max-sm:max-w-full"
                >
                  Your browser does not support the video tag.
                </video>
              );
            }
            return (
              <img
                key={key}
                src={block.value}
                alt="User uploaded content"
                className="my-2 max-h-[450px] max-w-[600px] rounded-lg object-contain max-sm:max-w-full"
              />
            );
          }

          // 3. Attached File Block
          if (block.type === "file") {
            return (
              <div
                key={key}
                className="bg-dark-secondary-bg border-border-color my-2 flex max-w-xs items-center gap-3 rounded-lg border p-3"
              >
                <div className="bg-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <File className="text-white" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {block.fileName || "Attached File"}
                  </p>
                </div>
              </div>
            );
          }

          // 4. Text Block
          if (typeof block.value === "string" && block.value.trim() !== "") {
            const isRtlText = isRTL(block.value);
            return (
              <div
                key={key}
                className="prose-sm prose prose-invert px-2 py-1"
                dir={isRtlText ? "rtl" : "ltr"}
              >
                {!isUser && isLastMessage && message.animate ? (
                  <Typewriter text={block.value} speed={10} />
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
                    components={MARKDOWN_COMPONENTS}
                  >
                    {block.value}
                  </ReactMarkdown>
                )}
              </div>
            );
          }
          return null;
        })}

        {!isUser && (
          <div className="flex items-center justify-start gap-2 mt-2">
            <button
              onClick={handleCopyMessage}
              className="text-secondary-text hover:bg-white/10 rounded-lg p-1.5 transition-colors hover:text-white cursor-pointer"
              title="Copy response"
              aria-label="Copy response"
            >
              {isMessageCopied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} />
              )}
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="text-secondary-text hover:bg-white/10 rounded-lg p-1.5 transition-colors hover:text-white cursor-pointer"
                title="Regenerate response"
                aria-label="Regenerate response"
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

export default memo(ChatBubble);
