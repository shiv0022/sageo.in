import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 flex items-center justify-center text-center">
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto">
            <FileQuestion className="w-8 h-8 text-gray-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Page Not Found (404)
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              The page or resource you are looking for does not exist or has been moved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <Search className="w-4 h-4" />
              Run New Audit
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
