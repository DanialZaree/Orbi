import { useState, useEffect } from "react";
import { Bot, Copy, Check, Link as LinkIcon, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import { createHighlighter } from "shiki/bundle/web";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// This function checks if the text contains characters from the Arabic script Unicode range.
function isRTL(text) {
  const rtlRegex = /[\u0600-\u06FF]/;
  return rtlRegex.test(text);
}

// --- Shiki Highlighter ---
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
        if (!highlighter.getLoadedLanguages().includes(lang)) {
          await highlighter.loadLanguage(lang);
        }
        const html = highlighter.codeToHtml(code, { lang, theme: "tokyo-night" });
        if (isMounted) setHtmlBlock(html);
      } catch (error) {
        console.warn(`Shiki language "${lang}" not found. Falling back to plaintext.`);
        if (isMounted) {
          const fallbackHtml = highlighter.codeToHtml(code, { lang: 'plaintext', theme: 'tokyo-night' });
          setHtmlBlock(fallbackHtml);
        }
      }
    });
    return () => { isMounted = false; };
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
      className="relative my-4 overflow-hidden border rounded-lg group border-border-color group w-2xl"
    >
      <summary className="flex items-center justify-between bg-[#1a1b26] px-3 py-1.5 border-border-color border-b ">
        <div className="flex items-center gap-2 ajab">
          <span className="text-sm tracking-wide text-secondary-text uppercase">
            {lang}
          </span>
          <ChevronDown
            size={20}
            className="text-secondary-text transition-transform duration-200 group-open:rotate-180 cursor-pointer hover:text-white"
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

export default function ChatBubble({ message, isLastMessage }) {
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
          isUser ? "bg-blue-600 rounded-br-xs" : "bg-surface"
        }`}
      >
        {/* --- THIS IS THE FIX ---
            This logic now applies to BOTH user and assistant messages,
            ensuring images, code, and text are all rendered correctly.
        */}
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
            return (
              <img
                key={index}
                src={block.value} // This will be the blob: or data: URL
                alt="User uploaded content"
                className="my-2 rounded-lg max-w-[600px] max-h-[450px] object-contain  "
              />
            );
          }

          // 3. Render Text Blocks (and skip empty text)
          if (typeof block.value === "string" && block.value.trim() !== "") {
            const isRtlText = isRTL(block.value);
            return (
              <div
                key={index}
                className={`px-3 py-1 prose-sm prose prose-invert`}
                dir={isRtlText ? 'rtl' : 'ltr'}
              >
                {/* We still apply the typing effect for the last AI message */}
                {!isUser && isLastMessage ? (
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
                        [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
                        rehypeKatex
                      ]}
                      components={{
                          p: ({ node, children }) => {
                              if (node.children[0]?.type === 'element' && node.children[0]?.properties?.className?.includes('math-display')) {
                                  return <div className="flex justify-center my-4">{children}</div>;
                              }
                              return <p className="my-3 first:mt-0 last:mb-0">{children}</p>;
                          },
                          a: ({node, ...props}) => (
                              <a {...props} className="inline-flex items-center gap-1 text-blue-400 hover:underline">
                                {props.children} <LinkIcon size={12} />
                              </a>
                          ),
                          ul: ({node, ...props}) => <ul {...props} className="pl-0 my-3 list-none" />,
                          ol: ({node, ...props}) => <ol {...props} className="pl-0 my-3 list-none" />,
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
      </div>
    </div>
  );
}

