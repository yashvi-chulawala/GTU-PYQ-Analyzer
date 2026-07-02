export default function ErrorState({
  title = "Couldn't load this data",
  message,
  onRetry,
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-signal-coral/30 bg-signal-coral/10">
        <svg
          className="h-5 w-5 text-signal-coral"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        {message && (
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">
            {message}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-lg border border-border bg-panel px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-signal-violet/50 hover:text-signal-violet-soft"
        >
          Try again
        </button>
      )}
    </div>
  );
}
