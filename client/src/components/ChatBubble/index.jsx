import { useState, useEffect } from "react";
import { Bot, Copy, Check, Link as LinkIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
// --- THIS IS THE FIX: Use the correct browser-optimized bundle ---
import { createHighlighter } from "shiki/bundle/web";

// --- Shiki Highlighter ---
// We pre-load common languages for speed and load others on demand.
const highlighterPromise = createHighlighter({
  themes: ["tokyo-night"],
  langs: ["javascript", "typescript", "python", "jsx", "tsx", "html", "css", "json", "markdown", "bash"],
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
        const html = highlighter.codeToHtml(code, { lang, theme: "tokyo-night" });
        if (isMounted) {
          setHtmlBlock(html);
        }
      } catch (error) {
        console.warn(`Shiki language "${lang}" not found or failed to load. Falling back to plaintext.`);
        if (isMounted) {
          // If loading fails, render as plain text to prevent a crash
          const fallbackHtml = highlighter.codeToHtml(code, { lang: 'plaintext', theme: 'tokyo-night' });
          setHtmlBlock(fallbackHtml);
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
    <div className="relative my-4 overflow-hidden border rounded-lg group border-border-color">
      <div className="flex items-center justify-between bg-zinc-800 px-3 py-1.5">
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
    <div className={`flex items-start gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface shrink-0">
          <Bot size={20} />
        </div>
      )}
      <div
        className={`relative max-w-xl md:max-w-2xl rounded-2xl px-1 py-1 ${
          isUser ? "bg-blue-600 rounded-br-xs" : ""
        }`}
      >
        {message.content?.map((block, index) => {
          if (block.type === 'code') {
            return <ShikiCodeBlock key={index} code={block.value} lang={block.language || 'plaintext'} />;
          }
          if (typeof block.value === 'string') {
            return (
              <div key={index} className="px-3 py-1 prose-sm prose prose-invert">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]]}
                    components={{
                      a: ({node, ...props}) => (
                        <a {...props} className="inline-flex items-center gap-1 text-blue-400 hover:underline">
                          {props.children} <LinkIcon size={12} />
                        </a>
                      ),
                      p: ({node, ...props}) => <p {...props} className="my-3 first:mt-0 last:mb-0" />,
                      ul: ({node, ...props}) => <ul {...props} className="pl-0 my-3 list-none" />,
                      ol: ({node, ...props}) => <ol {...props} className="pl-0 my-3 list-none" />,
                    }}
                  >
                      {block.value}
                  </ReactMarkdown>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

