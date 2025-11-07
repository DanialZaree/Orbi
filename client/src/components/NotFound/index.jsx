import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center text-white">
      <AlertTriangle size={64} className="mb-4 text-red-500" />
      <h1 className="mb-2 text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-secondary-text mb-6 text-lg">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Go Back Home
      </Link>
    </div>
  );
}
