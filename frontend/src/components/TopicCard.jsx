import { useState } from "react";

// Visual language per importance tier — color drives the frequency bar,
// badge, and left accent edge so a tier reads instantly without re-parsing text.
// Palette matches the rest of the app (cream surfaces, terracotta accent family)
// instead of a separate dark/glass token set that doesn't exist elsewhere.
const TIER_STYLES = {
  "Most Important": {
    accent: "bg-[#C4573D]",
    text: "text-[#C4573D]",
    badgeBg: "bg-[#F7E5E0]",
    badgeBorder: "border-[#E3B7A6]",
    barTrack: "bg-[#F0E4DC]",
    barColor: "bg-[#C4573D]",
  },
  Important: {
    accent: "bg-[#B8862E]",
    text: "text-[#9A6B1F]",
    badgeBg: "bg-[#F3E7CE]",
    badgeBorder: "border-[#E0C892]",
    barTrack: "bg-[#F0E7D2]",
    barColor: "bg-[#B8862E]",
  },
  Moderate: {
    accent: "bg-[#4E7C7A]",
    text: "text-[#3E6564]",
    badgeBg: "bg-[#E3EEED]",
    badgeBorder: "border-[#BBD6D4]",
    barTrack: "bg-[#E7EFEE]",
    barColor: "bg-[#4E7C7A]",
  },
  "Less Important": {
    accent: "bg-[#C9C1B2]",
    text: "text-[#8A8272]",
    badgeBg: "bg-[#F3EFE6]",
    badgeBorder: "border-[#DDD6C9]",
    barTrack: "bg-[#EFEAE0]",
    barColor: "bg-[#B8AF9C]",
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
    <article className="group relative overflow-hidden rounded-xl border border-[#DDD6C9] bg-[#FFFCF8] shadow-sm transition-all duration-200 hover:border-[#C4573D]/40 hover:shadow-md">
      {/* tier accent edge */}
      <div className={`absolute left-0 top-0 h-full w-[3px] ${style.accent}`} />

      <div className="p-5 pl-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="font-display text-base font-semibold leading-snug text-[#171717] min-w-0 flex-1">
            {topic.topic}
          </h4>

          <span
            className={`flex shrink-0 items-center gap-1 rounded-full border ${style.badgeBorder} ${style.badgeBg} px-2.5 py-1 font-mono text-xs font-semibold ${style.text}`}
          >
            {topic.frequency}x Asked
          </span>
        </div>

        {/* frequency bar — the "signal strength" visual */}
        <div className={`mt-3 h-1 w-full overflow-hidden rounded-full ${style.barTrack}`}>
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
              className="flex gap-2 text-sm leading-relaxed text-[#52525B]"
            >
              <span className="shrink-0 font-mono text-xs font-medium text-[#9A948A]">
                [{q.exam || q.term || "—"}]
              </span>
              <span className="text-[#52525B]">{q.question || q.text || q}</span>
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