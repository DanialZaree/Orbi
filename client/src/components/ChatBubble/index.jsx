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

const isRTL = (text) => /[\u0600-\u06FF]/.test(text);

const NORMALIZE_LANG_MAP = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  react: "jsx",
  node: "javascript",
};

const normalizeLanguage = (rawLang = "plaintext") => {
  const clean = (rawLang || "").toLowerCase().trim().split(/[\s,]+/)[0];
  return NORMALIZE_LANG_MAP[clean] || clean || "plaintext";
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
    "sql",
  ],
});

// Memoized Shiki Code Block with horizontal scroll and responsive layout
const ShikiCodeBlock = memo(function ShikiCodeBlock({ code, lang = "plaintext" }) {
  const [htmlBlock, setHtmlBlock] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const normalizedLang = normalizeLanguage(lang);

  useEffect(() => {
    let isMounted = true;
    highlighterPromise
      .then(async (highlighter) => {
        try {
          if (!highlighter.getLoadedLanguages().includes(normalizedLang)) {
            await highlighter.loadLanguage(normalizedLang);
          }
          const html = highlighter.codeToHtml(code, {
            lang: normalizedLang,
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
        // Fallback gracefully to preformatted text
      });

    return () => {
      isMounted = false;
    };
  }, [code, normalizedLang]);

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
      className="border-border-color group my-3.5 w-full max-w-full overflow-hidden rounded-xl border bg-[#1a1b26] shadow-md"
    >
      <summary className="border-border-color flex items-center justify-between border-b bg-[#14151f] px-3.5 py-2 select-none cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="text-secondary-text text-xs font-mono font-semibold tracking-wider uppercase">
            {normalizedLang}
          </span>
          <ChevronDown
            size={16}
            className="text-secondary-text transition-transform duration-200 group-open:rotate-180 hover:text-white"
          />
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-secondary-text hover:bg-white/10 flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition hover:text-white"
          aria-label="Copy code to clipboard"
        >
          {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {isCopied ? "Copied!" : "Copy"}
        </button>
      </summary>
      <div className="relative max-w-full overflow-x-auto p-3.5 text-xs sm:text-sm font-mono leading-relaxed">
        {htmlBlock ? (
          <div dangerouslySetInnerHTML={{ __html: htmlBlock }} />
        ) : (
          <pre className="whitespace-pre overflow-x-auto text-gray-300">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </details>
  );
});

// Markdown custom components mapping
const MARKDOWN_COMPONENTS = {
  p: ({ node, children }) => {
    if (
      node.children?.[0]?.type === "element" &&
      node.children[0]?.properties?.className?.includes("math-display")
    ) {
      return <div className="my-4 flex justify-center overflow-x-auto py-1">{children}</div>;
    }
    return <p className="my-2.5 first:mt-0 last:mb-0 leading-relaxed break-words">{children}</p>;
  },
  a: (props) => (
    <a
      {...props}
      className="inline-flex items-center gap-1 text-blue-400 underline underline-offset-2 hover:text-blue-300 break-all"
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children} <LinkIcon size={12} className="inline-block shrink-0" />
    </a>
  ),
  ul: (props) => <ul {...props} className="my-2.5 list-none pl-0 space-y-1.5" />,
  ol: (props) => <ol {...props} className="my-2.5 list-none pl-0 space-y-1.5" />,
  li: (props) => <li {...props} className="relative leading-relaxed" />,
  code({ inline, className, children, ...props }) {
    const match = /language-([^\s]+)/.exec(className || "");
    const codeString = String(children || "").replace(/\n$/, "");
    if (!inline && (match || codeString.includes("\n"))) {
      return (
        <ShikiCodeBlock
          code={codeString}
          lang={match ? match[1] : "plaintext"}
        />
      );
    }
    return (
      <code
        className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-xs font-medium text-blue-300 break-words"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre({ children }) {
    return <div className="my-2.5 max-w-full overflow-hidden">{children}</div>;
  },
  table: (props) => (
    <div className="border-border-color my-4 max-w-full overflow-x-auto rounded-lg border">
      <table {...props} className="min-w-full divide-y divide-border-color text-left text-sm" />
    </div>
  ),
};

// Stabilized typewriter: instant rich markdown rendering for code/long responses, fast typewriter for short text
const Typewriter = memo(function Typewriter({ text, speed = 10 }) {
  const isRichOrLong = text.length > 250 || text.includes("```") || text.includes("\n#");
  const [displayedLength, setDisplayedLength] = useState(isRichOrLong ? text.length : 0);
  const isFinished = displayedLength >= text.length;

  useEffect(() => {
    if (isRichOrLong) {
      setDisplayedLength(text.length);
      return;
    }

    setDisplayedLength(0);
    const charsPerBatch = Math.max(3, Math.ceil(text.length / 25));
    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + charsPerBatch;
        if (next >= text.length) {
          clearInterval(timer);
          return text.length;
        }
        return next;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [text, speed, isRichOrLong]);

  const handleSkip = () => {
    if (!isFinished) {
      setDisplayedLength(text.length);
    }
  };

  if (!isFinished) {
    return (
      <div
        onClick={handleSkip}
        className="cursor-pointer whitespace-pre-wrap leading-relaxed break-words font-sans min-h-[1.5em]"
        title="Click to display full message"
      >
        {text.slice(0, displayedLength)}
        <span className="inline-block h-4 w-1.5 animate-pulse bg-blue-500 ml-0.5 align-middle rounded-xs" />
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
      className={`flex w-full items-start gap-3 md:gap-4 overflow-hidden py-1 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="bg-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm mt-1 max-sm:hidden">
          <img src={orbi} alt="Orbi Logo" className="h-6 w-6 object-contain" />
        </div>
      )}

      <div
        className={`relative min-w-0 break-words [overflow-wrap:anywhere] ${
          isUser
            ? "max-w-[90%] sm:max-w-[80%] rounded-2xl rounded-br-xs bg-blue-700/55 px-4 py-3 text-sm sm:text-base text-white"
            : "max-w-[95%] sm:max-w-[90%] px-1 py-1 text-sm sm:text-base text-gray-100"
        }`}
      >
        {message.content?.map((block, index) => {
          const key = `${block.type}-${index}`;

          // Code Block
          if (block.type === "code") {
            return (
              <ShikiCodeBlock
                key={key}
                code={block.value}
                lang={block.language || "plaintext"}
              />
            );
          }

          // Image & Video Blocks
          const isMediaVideo =
            block.type === "video" ||
            (block.type === "image" &&
              typeof block.value === "string" &&
              block.value.startsWith("data:video/"));

          if (block.type === "video" || block.type === "image") {
            return (
              <div key={key} className="my-2 max-w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {isMediaVideo ? (
                  <video
                    src={block.value}
                    controls
                    playsInline
                    className="max-h-[420px] w-full max-w-[560px] rounded-xl object-contain mx-auto"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={block.value}
                    alt="User uploaded content"
                    className="max-h-[420px] w-full max-w-[560px] rounded-xl object-contain mx-auto"
                    loading="lazy"
                  />
                )}
              </div>
            );
          }

          // File Block
          if (block.type === "file") {
            return (
              <div
                key={key}
                className="bg-dark-third-bg border-border-color my-2 flex max-w-sm items-center gap-3 rounded-xl border p-3 shadow-xs"
              >
                <div className="bg-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <File className="text-blue-400" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs sm:text-sm font-medium text-white">
                    {block.fileName || "Attached File"}
                  </p>
                  <p className="text-[11px] text-secondary-text">Attached document</p>
                </div>
              </div>
            );
          }

          // Text Block
          if (typeof block.value === "string" && block.value.trim() !== "") {
            const isRtlText = isRTL(block.value);
            return (
              <div
                key={key}
                className="prose-sm prose prose-invert max-w-none [overflow-wrap:anywhere]"
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
          <div className="mt-2 flex items-center justify-start gap-1 text-secondary-text">
            <button
              onClick={handleCopyMessage}
              className="hover:bg-white/10 rounded-lg p-1.5 transition-colors hover:text-white cursor-pointer"
              title="Copy message"
              aria-label="Copy message"
            >
              {isMessageCopied ? (
                <Check size={16} className="text-gray-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="hover:bg-white/10 rounded-lg p-1.5 transition-colors hover:text-white cursor-pointer"
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
