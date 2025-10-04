import { useState, useEffect } from "react";
import { Bot, Copy, Check, Link as LinkIcon, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import { createHighlighter } from "shiki/bundle/web";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";


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
        // Dynamically load the language if it's not already in our bundle
        if (!highlighter.getLoadedLanguages().includes(lang)) {
          await highlighter.loadLanguage(lang);
        }
        const html = highlighter.codeToHtml(code, {
          lang,
          theme: "tokyo-night",
        });
        if (isMounted) {
          setHtmlBlock(html);
        }
      } catch (error) {
        console.warn(
          `Shiki language "${lang}" not found or failed to load. Falling back to plaintext.`
        );
        if (isMounted) {
          // If loading fails, render as plain text to prevent a crash
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
      className="relative my-4 overflow-hidden border rounded-lg group border-border-color w-2xl"
    >
      <summary className="flex items-center justify-between bg-[#1a1b26] px-3 py-1.5 border-border-color border-b ">
        <div className="flex items-center gap-2 ajab">
          <span className="text-sm tracking-wide uppercase text-secondary-text">
            {lang}
          </span>
          <ChevronDown
            size={20}
            className="transition-transform duration-200 cursor-pointer text-secondary-text group-open:rotate-180 hover:text-white"
          />
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-secondary-text hover:text-white text-sm cursor-pointer hover:bg-dark-third-bg p-2 rounded-xl transition"
        >
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
          {isCopied ? "Copied!" : "Copy"}
        </button>
      </summary>
      <div dangerouslySetInnerHTML={{ __html: htmlBlock }} />
    </details>
  );
}

export default function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface shrink-0">
          <Bot size={20} />
        </div>
      )}
      <div
        className={`relative max-w-xl md:max-w-2xl rounded-2xl px-1 py-1 ${
          isUser ? "bg-blue-600 rounded-br-xs" : ""
        }`}
      >
        {message.content?.map((block, index) => {
          if (block.type === "code") {
            return (
              <ShikiCodeBlock
                key={index}
                code={block.value}
                lang={block.language || "plaintext"}
              />
            );
          }
          if (typeof block.value === "string") {
            if (!isUser) {
              return (
                <div
                  key={index}
                  className="px-3 py-1 prose-sm prose prose-invert"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[
                      [
                        rehypeExternalLinks,
                        { target: "_blank", rel: ["noopener", "noreferrer"] },
                      ],
                      rehypeKatex,
                    ]}
                  >
                    {block.value}
                  </ReactMarkdown>
                </div>
              );
            } else {
              return (
                <pre
                  key={index}
                  className="px-3 py-1 font-sans text-sm text-white whitespace-pre-wrap"
                >
                  {block.value.trim()}
                  {""}
                </pre>
              );
            }
          }
          return null;
        })}
      </div>
    </div>
  );
}
