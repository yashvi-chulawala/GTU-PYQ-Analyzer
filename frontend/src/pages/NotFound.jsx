import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-sm text-signal-violet-soft">404 / NO SIGNAL</span>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">
        This page doesn't exist
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        The page you're looking for has been moved, removed, or never existed.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-signal-violet px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
      >
        Back to home
      </Link>
    </div>
  );
}
