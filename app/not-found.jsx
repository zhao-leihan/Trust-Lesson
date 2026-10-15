import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <div className="text-center max-w-md space-y-4">
        <h1 className="text-6xl font-black text-purple-400">404</h1>
        <h2 className="text-xl font-bold text-slate-100">Page Not Found</h2>
        <p className="text-slate-400 text-sm">
          The requested page could not be found or has been moved.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
