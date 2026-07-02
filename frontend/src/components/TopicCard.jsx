import { useState } from "react";

// Visual language per importance tier — color drives the frequency bar,
// badge, and left accent edge so a tier reads instantly without re-parsing text.
const TIER_STYLES = {
  "Most Important": {
    icon: "🔥",
    accent: "bg-signal-coral",
    text: "text-signal-coral",
    badgeBg: "bg-signal-coral/10",
    badgeBorder: "border-signal-coral/30",
    barColor: "bg-signal-coral",
  },
  Important: {
    icon: "⭐",
    accent: "bg-signal-amber",
    text: "text-signal-amber",
    badgeBg: "bg-signal-amber/10",
    badgeBorder: "border-signal-amber/30",
    barColor: "bg-signal-amber",
  },
  Moderate: {
    icon: "📘",
    accent: "bg-signal-teal",
    text: "text-signal-teal",
    badgeBg: "bg-signal-teal/10",
    badgeBorder: "border-signal-teal/30",
    barColor: "bg-signal-teal",
  },
  "Less Important": {
    icon: "⚪",
    accent: "bg-ink-faint",
    text: "text-ink-muted",
    badgeBg: "bg-white/5",
    badgeBorder: "border-border",
    barColor: "bg-ink-faint",
  },
};

const PREVIEW_COUNT = 2;
const MAX_FREQUENCY_SCALE = 10; // frequency bar fills relative to this ceiling

export default function TopicCard({ topic, tier }) {
  const [expanded, setExpanded] = useState(false);
  const style = TIER_STYLES[tier] || TIER_STYLES.Moderate;

  const questions = topic.questions || [];
  const visibleQuestions = expanded ? questions : questions.slice(0, PREVIEW_COUNT);
  const hiddenCount = questions.length - PREVIEW_COUNT;
  const barWidth = Math.min(100, (topic.frequency / MAX_FREQUENCY_SCALE) * 100);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-panel/60 backdrop-blur-sm transition-colors duration-300 hover:border-border-soft">
      {/* tier accent edge */}
      <div className={`absolute left-0 top-0 h-full w-[3px] ${style.accent}`} />

      <div className="p-5 pl-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="font-display text-base font-semibold leading-snug text-ink min-w-0 flex-1">
            {topic.topic}
          </h4>

          <span
            className={`flex shrink-0 items-center gap-1 rounded-full border ${style.badgeBorder} ${style.badgeBg} px-2.5 py-1 font-mono text-xs font-semibold ${style.text}`}
          >
            {topic.frequency}x Asked
          </span>
        </div>

        {/* frequency bar — the "signal strength" visual */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full ${style.barColor} transition-all duration-700 ease-out`}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        {/* question list */}
        <ul className="mt-4 space-y-2">
          {visibleQuestions.map((q, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm leading-relaxed text-ink-muted"
            >
              <span className="shrink-0 font-mono text-xs font-medium text-ink-faint">
                [{q.exam || q.term || "—"}]
              </span>
              <span className="text-ink-muted">{q.question || q.text || q}</span>
            </li>
          ))}
        </ul>

        {questions.length > PREVIEW_COUNT && (
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className={`mt-4 flex items-center gap-1.5 font-mono text-xs font-medium ${style.text} transition-opacity hover:opacity-80`}
          >
            {expanded ? (
              <>
                Show less
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </>
            ) : (
              <>
                +{hiddenCount} more question{hiddenCount !== 1 ? "s" : ""}
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
