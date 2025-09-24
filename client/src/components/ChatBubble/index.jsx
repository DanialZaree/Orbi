import { useState, useEffect } from "react";
import { Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createHighlighter } from "shiki/bundle/web";

// --- Shiki Highlighter ---
// Pre-load common languages for better performance.
const highlighterPromise = createHighlighter({
  themes: ["tokyo-night"],
  langs: ["javascript", "typescript", "python", "jsx", "tsx", "html", "css", "json", "markdown", "bash"],
});


// --- ShikiCodeBlock Component ---
// This component is dedicated to rendering syntax-highlighted code.
function ShikiCodeBlock({ code, lang }) {
  const [htmlBlock, setHtmlBlock] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    highlighterPromise.then((highlighter) => {
      try {
        const html = highlighter.codeToHtml(code, { lang, theme: "tokyo-night" });
        if (isMounted) {
          setHtmlBlock(html);
        }
      } catch (error) {
        console.error("Shiki error:", error);
        // Fallback for unsupported languages
        if (isMounted) {
          setHtmlBlock(`<pre class="shiki tokyo-night" style="background-color: #1a1b26;"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`);
        }
      }
    });
    return () => { isMounted = false; };
  }, [code, lang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    // This renders the code block outside of the .prose class
    <div className="relative my-4 overflow-hidden border rounded-lg group border-border-color">
      <div className="flex items-center justify-between bg-[#1a1b26] px-3 py-1.5">
          <span className="text-xs tracking-wide text-gray-400 uppercase">{lang}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-gray-300 hover:text-white text-xs"
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            {isCopied ? "Copied!" : "Copy"}
          </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: htmlBlock }} />
    </div>
  );
}


export default function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-4 overflow-x-scroll${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface shrink-0">
          <Bot size={20} />
        </div>
      )}
      <div
        className={`relative max-w-xl md:max-w-2xl rounded-2xl px-1 py-1 ${
          isUser ? "bg-blue-600 text-white" : "bg-surface"
        }`}
      >
        {/*
          This is the main fix. We map over the content blocks and decide
          how to render them here, which prevents the style conflict.
        */}
        {message.content?.map((block, index) => {
          if (block.type === 'code') {
            return <ShikiCodeBlock key={index} code={block.value} lang={block.language || 'plaintext'} />;
          }
          // For text blocks, we use ReactMarkdown with the prose class for nice styling.
          return (
            <div key={index} className="px-3 py-1 prose-sm prose prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {block.value}
                </ReactMarkdown>
            </div>
          );
        })}
      </div>
    </div>
  );
}

