export default function LoadingState({ label = "Analyzing question papers" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex items-end gap-1" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-signal-violet"
            style={{
              height: `${14 + (i % 3) * 8}px`,
              animation: `pulse-slow 1.1s ease-in-out ${i * 0.12}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-sm text-ink-muted">{label}…</p>
      <span className="sr-only" role="status">
        Loading
      </span>
    </div>
  );
}
