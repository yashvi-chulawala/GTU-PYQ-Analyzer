import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchSubjectData, fetchPapers, getPaperUrl, ApiError, API_BASE_URL } from "../services/api";
import { getSubjectByCode } from "../services/subjects";
import UnitTabs from "../components/UnitTabs";
import TopicCard from "../components/TopicCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const TIERS = ["Most Important", "Important", "Moderate", "Less Important"];

const TIER_LABELS = {
  "Most Important": { icon: "🔥", color: "text-signal-coral" },
  Important: { icon: "⭐", color: "text-signal-amber" },
  Moderate: { icon: "📘", color: "text-signal-teal" },
  "Less Important": { icon: "⚪", color: "text-ink-muted" },
};

const QUICK_ACTIONS = [
 
  {
    id: "repeated",
    icon: "🔥",
    title: "Most Repeated",
    desc: "Top recurring questions across papers",
    accent: "hover:border-signal-coral/60 hover:bg-signal-coral/5",
    iconBg: "bg-signal-coral/10",
  },
  {
    id: "frequent",
    icon: "📈",
    title: "Frequent Topics",
    desc: "Highest-frequency topics by unit",
    accent: "hover:border-signal-amber/60 hover:bg-signal-amber/5",
    iconBg: "bg-signal-amber/10",
  },
  {
    id: "questions",
    icon: "📚",
    title: "Unit Questions",
    desc: "All past questions, unit by unit",
    accent: "hover:border-signal-teal/60 hover:bg-signal-teal/5",
    iconBg: "bg-signal-teal/10",
  },
  {
    id: "analysis",
    icon: "🧠",
    title: "Topic Analysis",
    desc: "Importance tiers & trend insights",
    accent: "hover:border-signal-violet-soft/60 hover:bg-violet-500/5",
    iconBg: "bg-violet-500/10",
  },
  {
    id: "downloads",
    icon: "📥",
    title: "Download PYQs",
    desc: "Previous year question papers",
    accent: "hover:border-border hover:bg-ink/5",
    iconBg: "bg-ink-faint/10",
  },
   {
  id: "syllabus",
  icon: "📘",
  title: "View Syllabus",
  desc: "Official GTU syllabus",
  accent: "hover:border-border hover:bg-ink/5",
  iconBg: "bg-ink-faint/10",
},
];

function TierSection({ tier, topics }) {
  const { icon, color } = TIER_LABELS[tier];
  return (
    <section>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="text-lg">{icon}</span>
        <h3 className={`font-display text-sm font-semibold tracking-wide ${color}`}>
          {tier.toUpperCase()}
        </h3>
        <span className="font-mono text-xs text-ink-faint">({topics.length})</span>
        <div className="h-px flex-1 bg-border-soft" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {topics.map((topic, i) => (
          <TopicCard key={`${topic.topic}-${i}`} topic={topic} tier={tier} />
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle, badge }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border-soft pb-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {badge && (
        <span className="rounded-full border border-border bg-panel px-3 py-1 font-mono text-xs text-ink-muted">
          {badge}
        </span>
      )}
    </div>
  );
}

function DownloadsSection({ papers, subjectCode }) {
  return (
    <div className="animate-rise">
      <SectionHeader
        title="Previous Year Papers"
        subtitle="Download official GTU question papers"
        badge={`${papers.length} papers`}
      />
      {papers.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">No papers available for this subject yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <a
              key={paper.file}
              href={getPaperUrl(subjectCode, paper.file)}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-xl border border-border bg-panel p-4 transition-all duration-200 hover:border-violet-500/60 hover:bg-violet-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-lg">
                  📄
                </div>
                <div>
                  <p className="font-medium text-ink">{paper.label}</p>
                  <p className="font-mono text-xs text-ink-muted">{paper.session} Session</p>
                </div>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-ink-muted transition-colors group-hover:border-violet-500/40 group-hover:text-violet-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function MostRepeatedSection({ unitsData }) {
  const repeated = useMemo(() => {
    if (!unitsData) return [];
    const map = {};
    Object.values(unitsData).forEach((unit) => {
      TIERS.forEach((tier) => {
        (unit[tier] || []).forEach((topic) => {
          const key = topic.topic;
          if (!map[key]) map[key] = { ...topic, tier, count: 0 };
          map[key].count += topic.frequency || 1;
        });
      });
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [unitsData]);

  return (
    <div className="animate-rise">
      <SectionHeader
        title="Most Repeated Questions"
        subtitle="Topics that appear most frequently across all past papers"
        badge={`Top ${repeated.length}`}
      />
      {repeated.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">No data available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {repeated.map((topic, i) => {
            const { icon, color } = TIER_LABELS[topic.tier] || { icon: "⚪", color: "text-ink-muted" };
            return (
              <div
                key={`${topic.topic}-${i}`}
                className="flex items-start gap-4 rounded-xl border border-border bg-panel p-4 transition-colors hover:border-violet-500/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal-coral/10 font-mono text-sm font-bold text-signal-coral">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-ink">{topic.topic}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className={`flex items-center gap-1 font-mono text-xs ${color}`}>
                      {icon} {topic.tier}
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-ink-muted">
                      ×{topic.count} times
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FrequentTopicsSection({ unitsData }) {
  const topics = useMemo(() => {
    if (!unitsData) return [];
    const all = [];
    Object.entries(unitsData).forEach(([unitNum, unit]) => {
      TIERS.forEach((tier) => {
        (unit[tier] || []).forEach((topic) => {
          all.push({ ...topic, tier, unitNum, unit_name: unit.unit_name });
        });
      });
    });
    return all
      .sort((a, b) => {
        const tierOrder = TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier);
        return tierOrder !== 0 ? tierOrder : (b.frequency || 0) - (a.frequency || 0);
      })
      .slice(0, 16);
  }, [unitsData]);

  return (
    <div className="animate-rise">
      <SectionHeader
        title="Frequently Asked Topics"
        subtitle="High-importance topics ranked by tier and frequency"
        badge={`${topics.length} topics`}
      />
      {topics.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">No data available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {topics.map((topic, i) => {
            const { icon, color } = TIER_LABELS[topic.tier] || { icon: "⚪", color: "text-ink-muted" };
            const tierIdx = TIERS.indexOf(topic.tier);
            const barWidth = ["w-full", "w-3/4", "w-1/2", "w-1/4"][tierIdx] || "w-1/4";
            const barColor = ["bg-signal-coral", "bg-signal-amber", "bg-signal-teal", "bg-border"][tierIdx] || "bg-border";
            return (
              <div
                key={`${topic.topic}-${i}`}
                className="rounded-xl border border-border bg-panel p-4 transition-colors hover:border-violet-500/40"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug text-ink">{topic.topic}</p>
                  <span className={`shrink-0 flex items-center gap-1 font-mono text-xs ${color}`}>
                    {icon}
                  </span>
                </div>
                <div className="mb-2 h-1 w-full rounded-full bg-border">
                  <div className={`h-1 rounded-full ${barColor} ${barWidth} transition-all`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-faint">
                    Unit {topic.unitNum}
                  </span>
                  <span className={`font-mono text-xs ${color}`}>{topic.tier}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, sub, accent = "hover:border-border-soft", onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`group flex flex-col gap-2 rounded-xl border border-border bg-panel px-4 py-3.5 text-left transition-all duration-200 ${accent} hover:bg-ink/[0.03] ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-base leading-none">{icon}</span>
        <span className="font-mono text-[10px] tracking-widest text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
          VIEW
        </span>
      </div>
      <div>
        <p className="font-display text-xl font-bold leading-none text-ink">{value}</p>
        <p className="mt-1 text-xs font-medium text-ink-muted">{label}</p>
        {sub && (
          <p className="mt-0.5 font-mono text-[10px] text-ink-faint">{sub}</p>
        )}
      </div>
    </Tag>
  );
}

function SubjectStats({ unitsData, unitQuestionsData, papers }) {
  const stats = useMemo(() => {
    if (!unitsData) return null;

    const totalUnits = Object.keys(unitsData).length;

    let totalTopics = 0;
    Object.values(unitsData).forEach((unit) => {
      TIERS.forEach((tier) => {
        totalTopics += (unit[tier] || []).length;
      });
    });

    let totalQuestions = 0;
    if (unitQuestionsData) {
      Object.values(unitQuestionsData).forEach((unit) => {
        totalQuestions += (unit.questions || []).length;
      });
    }

    const totalPapers = papers.length;
    const paperYears = papers.map((p) => Number(p.year)).filter(Boolean);
    const minYear = paperYears.length ? Math.min(...paperYears) : null;
    const maxYear = paperYears.length ? Math.max(...paperYears) : null;
    const yearRange = minYear && maxYear ? (minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`) : null;

    return { totalUnits, totalTopics, totalQuestions, totalPapers, yearRange };
  }, [unitsData, unitQuestionsData, papers]);

  if (!stats) return null;

  return (
    <div className="mb-10">
      <p className="mb-4 font-mono text-xs tracking-widest text-ink-faint">SUBJECT STATISTICS</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon="📄"
          value={stats.totalQuestions}
          label="Questions"
          accent="hover:border-signal-violet-soft/40"
        />
        <StatCard
          icon="📚"
          value={stats.totalUnits}
          label="Units"
          accent="hover:border-signal-teal/40"
        />
        <StatCard
          icon="🔥"
          value={stats.totalTopics}
          label="Topics"
          accent="hover:border-signal-coral/40"
        />
        <StatCard
          icon="📅"
          value={stats.totalPapers}
          label="Papers"
          sub={stats.yearRange}
          accent="hover:border-signal-amber/40"
        />
      </div>
    </div>
  );
}

export default function Subject() {
  const { subjectCode } = useParams();
  const subjectMeta = getSubjectByCode(subjectCode);

  const [request, setRequest] = useState({ key: null, status: "loading", data: null, error: null });
  const [activeUnit, setActiveUnit] = useState(null);
  const [section, setSection] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [papers, setPapers] = useState([]);
  const [syllabus, setSyllabus] = useState(null);

  // Fetch papers list
  useEffect(() => {
    fetchPapers(subjectCode)
      .then(setPapers)
      .catch(() => setPapers([]));
  }, [subjectCode]);

  // Fetch subject topic/question data
  useEffect(() => {
    let ignore = false;
    const key = `${subjectCode}:${retryCount}`;

    fetchSubjectData(subjectCode)
      .then((data) => {
    if (ignore) return;

    setRequest({
        key,
        status: "success",
        data,
        error: null
    });

    setSyllabus(data.syllabus);

    const firstUnit = Object.keys(data.topics)
        .sort((a, b) => Number(a) - Number(b))[0];

    setActiveUnit(firstUnit ?? null);
})
      .catch((err) => {
        if (ignore) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Something unexpected went wrong while loading this subject.";
        setRequest({ key, status: "error", data: null, error: message });
      });

    return () => { ignore = true; };
  }, [subjectCode, retryCount]);

  const requestKey = `${subjectCode}:${retryCount}`;
  const status = request.key === requestKey ? request.status : "loading";
  const unitsData = request.key === requestKey ? request.data?.topics : null;
  const unitQuestionsData = request.key === requestKey ? request.data?.unit_questions : null;
  const errorInfo = request.key === requestKey ? request.error : null;

  const retry = () => setRetryCount((c) => c + 1);

  const unitKeys = useMemo(() => {
    if (!unitsData) return [];
    return Object.keys(unitsData).sort((a, b) => Number(a) - Number(b));
  }, [unitsData]);

  const currentUnit = activeUnit ? unitsData?.[activeUnit] : null;
  const currentUnitQuestions = activeUnit ? unitQuestionsData?.[activeUnit] : null;
  

  const totalQuestionsInUnit = useMemo(() => {
    if (!currentUnit) return 0;
    return TIERS.reduce((sum, tier) => sum + (currentUnit[tier]?.length || 0), 0);
  }, [currentUnit]);

  const showUnitTabs = section !== null && ["analysis", "questions"].includes(section) && status === "success" && unitKeys.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-ink-faint transition-colors hover:text-ink-muted"
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        All subjects
      </Link>

      {/* Header */}
      <div className="mb-10 flex flex-col gap-1.5">
        <span className="font-mono text-xs tracking-widest text-signal-violet-soft">
          {subjectMeta ? subjectMeta.short : subjectCode?.toUpperCase()} / DASHBOARD
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {subjectMeta ? subjectMeta.name : subjectCode}
        </h1>
        {subjectMeta && (
          <p className="text-sm text-ink-muted">{subjectMeta.blurb}</p>
        )}
      </div>

      {/* Subject Statistics */}
      {status !== "error" && (
        <SubjectStats unitsData={unitsData} unitQuestionsData={unitQuestionsData} papers={papers} />
      )}
      {syllabus && (
  <div className="mb-10 rounded-xl border border-border bg-panel p-6">
    <p className="mb-5 font-mono text-xs tracking-widest text-ink-faint">
      SYLLABUS INFORMATION
    </p>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

      <div>
        <p className="text-xs text-ink-faint">Subject</p>
        <p className="mt-1 text-lg font-semibold text-ink">
          {syllabus.subject_name}
        </p>
      </div>

      <div>
        <p className="text-xs text-ink-faint">Subject Code</p>
        <p className="mt-1 text-lg font-semibold text-ink">
          {syllabus.subject_code}
        </p>
      </div>

      <div>
        <p className="text-xs text-ink-faint">Semester</p>
        <p className="mt-1 text-lg font-semibold text-ink">
          {syllabus.semester}
        </p>
      </div>

      <div>
        <p className="text-xs text-ink-faint">Effective From</p>
        <p className="mt-1 text-lg font-semibold text-ink">
          {syllabus.effective_from}
        </p>
      </div>

      <div>
        <p className="text-xs text-ink-faint">Last Updated</p>
        <p className="mt-1 text-lg font-semibold text-ink">
          {syllabus.last_updated}
        </p>
      </div>

      <div>
        <p className="text-xs text-ink-faint">Analysis Status</p>

        <span className="mt-2 inline-flex rounded-full bg-green-500/15 px-3 py-1 text-sm font-medium text-green-400">
          Based on Official GTU Syllabus
        </span>

      </div>

    </div>
  </div>
)}

      {/* Quick Actions */}
      <div className="mb-10">
        <p className="mb-4 font-mono text-xs tracking-widest text-ink-faint">QUICK ACTIONS</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_ACTIONS.map((action, idx) => {
            const isActive = section === action.id;
            const isLastOdd = idx === QUICK_ACTIONS.length - 1 && QUICK_ACTIONS.length % 2 !== 0;
            return (
              <button
                key={action.id}
                onClick={() => {
  if (action.id === "syllabus") {
    window.open(
      `${API_BASE_URL}/subject/${subjectCode}/syllabus`,
      "_blank"
    );
    return;
  }

  setSection(action.id);
}}
                className={`group flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${isLastOdd ? "col-span-2 sm:col-span-1" : ""} ${
                  isActive
                    ? "border-violet-500 bg-violet-500/10 shadow-sm shadow-violet-500/10"
                    : `border-border bg-panel ${action.accent}`
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors ${
                  isActive ? "bg-violet-500/20" : action.iconBg
                }`}>
                  {action.icon}
                </div>
                <div>
                  <p className={`text-sm font-semibold leading-tight ${isActive ? "text-violet-300" : "text-ink"}`}>
                    {action.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-ink-muted">{action.desc}</p>
                </div>
                {isActive && (
                  <div className="mt-auto h-0.5 w-full rounded-full bg-violet-500/60" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading / Error states */}
      {status === "loading" && (
        <LoadingState label={`Compiling ${subjectMeta?.short || subjectCode} papers`} />
      )}
      {status === "error" && (
        <ErrorState title="Couldn't load this subject" message={errorInfo} onRetry={retry} />
      )}
      {status === "success" && unitKeys.length === 0 && (
        <ErrorState
          title="No data yet"
          message="This subject doesn't have any analyzed papers yet. Check back soon."
        />
      )}

      {/* Unit Tabs — only shown for unit-specific sections */}
      {showUnitTabs && (
        <div className="mb-8">
          <p className="mb-3 font-mono text-xs tracking-widest text-ink-faint">SELECT UNIT</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
            {unitKeys.map((u) => (
              <button
                key={u}
                onClick={() => setActiveUnit(u)}
                className={`shrink-0 rounded-lg border px-4 py-2 font-mono text-sm font-medium transition-all duration-150 ${
                  activeUnit === u
                    ? "border-violet-500 bg-violet-500/15 text-violet-300 shadow-sm shadow-violet-500/10"
                    : "border-border bg-panel text-ink-muted hover:border-violet-500/40 hover:text-ink"
                }`}
              >
                U{u}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section Content */}
      {status === "success" && unitKeys.length > 0 && section !== null && (
        <div className="mt-2">
          {/* Downloads */}
          {section === "downloads" && (
            <DownloadsSection papers={papers} subjectCode={subjectCode} />
          )}

          {/* Most Repeated */}
          {section === "repeated" && (
            <MostRepeatedSection unitsData={unitsData} />
          )}

          {/* Frequent Topics */}
          {section === "frequent" && (
            <FrequentTopicsSection unitsData={unitsData} />
          )}

          {/* Topic Analysis */}
          {section === "analysis" && currentUnit && (
            <div key={`analysis-${activeUnit}`} className="animate-rise">
              <SectionHeader
                title={`Unit ${activeUnit} — ${currentUnit.unit_name}`}
                subtitle="Topics ranked by exam importance"
                badge={`${totalQuestionsInUnit} topics tracked`}
              />
              <div className="flex flex-col gap-10">
                {TIERS.map((tier) => {
                  const topics = currentUnit[tier] || [];
                  if (topics.length === 0) return null;
                  return <TierSection key={tier} tier={tier} topics={topics} />;
                })}
                {TIERS.every((tier) => (currentUnit[tier] || []).length === 0) && (
                  <p className="py-12 text-center text-sm text-ink-muted">
                    No topics recorded for this unit yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Unit Questions */}
          {section === "questions" && currentUnitQuestions && (
            <div key={`questions-${activeUnit}`} className="animate-rise">
              <SectionHeader
                title={`Unit ${activeUnit} — ${currentUnitQuestions.unit_name}`}
                subtitle="All past exam questions for this unit"
                badge={`${currentUnitQuestions.questions.length} questions`}
              />
              <div className="space-y-3">
                {currentUnitQuestions.questions.map((q, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-panel p-5 transition-colors hover:border-violet-500/30"
                  >
                    <div className="mb-2.5 flex flex-wrap gap-2">
                      <span className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs text-ink-muted">
                        {q.year}
                      </span>
                      <span className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs text-ink-muted">
                        {q.question_no}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-ink">{q.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for questions */}
          {section === "questions" && !currentUnitQuestions && activeUnit && (
            <div className="animate-rise">
              <SectionHeader
                title={`Unit ${activeUnit} Questions`}
                subtitle="Past exam questions for this unit"
              />
              <p className="py-12 text-center text-sm text-ink-muted">
                No questions recorded for this unit yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
