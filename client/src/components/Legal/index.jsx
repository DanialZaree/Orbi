import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full bg-dark-bg text-white font-sans selection:bg-blue-600/30 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-border-color/60 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-sm text-secondary-text transition-colors hover:text-white cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to chat</span>
          </button>
          <span className="text-xs text-secondary-text">March 2026</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-secondary-text">
          How Orbi collects, stores, and handles your data.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-secondary-text">
          <section>
            <h2 className="text-base font-semibold text-white">1. Information We Collect</h2>
            <p className="mt-2">
              We collect only what is necessary to operate the chatbot:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li><strong className="text-white">Account:</strong> Your email and password hash (encrypted with bcrypt).</li>
              <li><strong className="text-white">Chats:</strong> Prompts, uploaded images/files, and AI responses saved to your MongoDB chat history.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white">2. AI Processing (Google Gemini)</h2>
            <p className="mt-2">
              Messages and attachments are sent to Google&apos;s Gemini API to generate responses. We do not sell your data, use your personal conversations for advertising, or train public AI models on your private prompts.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white">3. Storage &amp; Security</h2>
            <p className="mt-2">
              Your conversations are stored in MongoDB. Authentication is handled via signed JSON Web Tokens (JWT) stored in your browser&apos;s <code className="text-blue-400">localStorage</code>. We do not use third-party tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white">4. Your Control</h2>
            <p className="mt-2">
              You own your chat history. You can rename or delete individual conversations at any time directly from the sidebar. Deleting a chat permanently removes it from the database.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white">5. Contact</h2>
            <p className="mt-2">
              If you have questions or want to request account deletion, reach out on{" "}
              <a
                href="https://github.com/danialzaree"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
              >
                GitHub
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
