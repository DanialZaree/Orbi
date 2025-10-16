import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-white">
      <AlertTriangle size={64} className="mb-4 text-red-500" />
      <h1 className="mb-2 text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mb-6 text-lg text-secondary-text">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Go Back Home
      </Link>
    </div>
  );
}
