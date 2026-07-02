import { Link } from "react-router-dom";

export default function SubjectCard({ subject, index }) {
  const { code, name, short, blurb } = subject;

  return (
    <Link
      to={`/subject/${code}`}
      style={{ animationDelay: `${index * 70}ms` }}
      className="animate-rise group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-panel/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-signal-violet/50 hover:bg-panel-raised"
    >
      {/* corner glow on hover */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-signal-violet/0 blur-2xl transition-all duration-500 group-hover:bg-signal-violet/20" />

      {/* scanning line on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="animate-scan h-full w-1/2 bg-gradient-to-r from-transparent via-signal-violet-soft to-transparent" />
      </div>

      <div className="relative">
        <div className="mb-5 flex items-start justify-between">
          <span className="font-mono text-xs tracking-widest text-ink-faint">
            SUBJECT/{String(index + 1).padStart(2, "0")}
          </span>
          <span className="rounded-md border border-border bg-panel px-2 py-1 font-mono text-[11px] font-medium text-signal-teal">
            {short}
          </span>
        </div>

        <h3 className="font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-white">
          {name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{blurb}</p>
      </div>

      <div className="relative mt-6 flex items-center justify-between border-t border-border-soft pt-4">
        <span className="text-sm font-medium text-ink-muted transition-colors group-hover:text-signal-violet-soft">
          Open dashboard
        </span>
        <svg
          className="h-4 w-4 -translate-x-1 text-ink-faint opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-signal-violet-soft group-hover:opacity-100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </Link>
  );
}
