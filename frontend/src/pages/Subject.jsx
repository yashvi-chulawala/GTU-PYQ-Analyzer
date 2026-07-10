import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Flame,
  TrendingUp,
  ListChecks,
  Brain,
  Download,
  FileText,
  Star,
  BookOpen,
  Circle,
  Layers,
  Calendar,
} from "lucide-react";
import { fetchSubjectData, fetchPapers, getPaperUrl, ApiError } from "../services/api";
import { getSubjectByCode } from "../services/subjects";
import UnitTabs from "../components/UnitTabs";
import TopicCard from "../components/TopicCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

/* Unified monochrome icon system — one neutral default, one accent
   on hover/active, no per-card color variety (Linear/Vercel/GitHub feel). */
const ICON_DEFAULT = "#6B7280";
const ICON_ACCENT = "#C4573D";
const ICON_BG = "rgba(196,87,61,0.08)";

const TIERS = ["Most Important", "Important", "Moderate", "Less Important"];

/* Tier color scale — a single accent (terracotta) for the top tier,
   fading through the neutral text hierarchy for the rest, instead of
   a rainbow of separate accent colors. */
const TIER_LABELS = {
  "Most Important": { Icon: Flame, color: "text-[#C4573D]" },
  Important: { Icon: Star, color: "text-[#6B7280]" },
  Moderate: { Icon: BookOpen, color: "text-[#9CA3AF]" },
  "Less Important": { Icon: Circle, color: "text-[#D1D5DB]" },
};

/* Quick actions share one subtle, warm hover treatment — no per-card
   accent colors, matching the homepage's "one accent" identity. */
const QUICK_ACTIONS = [
  {
    id: "repeated",
    Icon: Flame,
    title: "Most Repeated",
    desc: "Top recurring questions across papers",
  },
  {
    id: "frequent",
    Icon: TrendingUp,
    title: "Frequent Topics",
    desc: "Highest-frequency topics by unit",
  },
  {
    id: "questions",
    Icon: ListChecks,
    title: "Unit Questions",
    desc: "All past questions, unit by unit",
  },
  {
    id: "analysis",
    Icon: Brain,
    title: "Topic Analysis",
    desc: "Importance tiers & trend insights",
  },
  {
    id: "downloads",
    Icon: Download,
    title: "Download PYQs",
    desc: "Previous year question papers",
  },
  {
    id: "syllabus",
    Icon: FileText,
    title: "View Syllabus",
    desc: "Official GTU syllabus",
  },
];

function TierSection({ tier, topics }) {
  const { Icon, color } = TIER_LABELS[tier];
  return (
    <section>
      <div className="mb-4 flex items-center gap-2.5">
        <Icon size={16} strokeWidth={2} className={color} />
        <h3 className={`font-display text-sm font-semibold tracking-wide ${color}`}>
          {tier.toUpperCase()}
        </h3>
        <span className="font-mono text-xs text-[#9CA3AF]">({topics.length})</span>
        <div className="h-px flex-1 bg-[#E7E2DA]" />
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
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E2DA] pb-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-[#111827]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm font-normal leading-relaxed text-[#6B7280]">{subtitle}</p>}
      </div>
      {badge && (
        <span className="rounded-full border border-[#E7E2DA] bg-[#F7E5E0] px-3 py-1 font-mono text-[11px] font-medium text-[#C4573D]">
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
        <p className="py-12 text-center text-sm text-[#6B7280]">No papers available for this subject yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <a
              key={paper.file}
              href={getPaperUrl(subjectCode, paper.file)}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-xl border border-[#E7E2DA] bg-[#FFFFFF] p-4 shadow-sm transition-all duration-250 hover:-translate-y-[3px] hover:border-[#C4573D]/50 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: ICON_BG }}
                >
                  <FileText size={18} strokeWidth={2} style={{ color: ICON_DEFAULT }} className="transition-colors duration-200 group-hover:text-[#C4573D]" />
                </div>
                <div>
                  <p className="font-medium text-[#111827]">{paper.label}</p>
                  <p className="font-mono text-xs text-[#6B7280]">{paper.session} Session</p>
                </div>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E2DA] bg-[#F3F4F6] text-[#6B7280] transition-all duration-200 group-hover:border-[#C4573D] group-hover:bg-[#C4573D] group-hover:text-white">
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
        <p className="py-12 text-center text-sm text-[#6B7280]">No data available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {repeated.map((topic, i) => {
            const { Icon, color } = TIER_LABELS[topic.tier] || { Icon: Circle, color: "text-[#9CA3AF]" };
            return (
              <div
                key={`${topic.topic}-${i}`}
                className="flex items-start gap-4 rounded-xl border border-[#E7E2DA] bg-[#FFFFFF] p-5 shadow-sm transition-all duration-250 hover:-translate-y-[3px] hover:border-[#C4573D]/40 hover:shadow-lg"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F7E5E0] font-mono text-sm font-bold text-[#C4573D]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-[#111827]">{topic.topic}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                    <span className={`flex items-center gap-1 font-mono text-xs ${color}`}>
                      <Icon size={12} strokeWidth={2} /> {topic.tier}
                    </span>
                    <span className="rounded-full border border-[#E7E2DA] px-2 py-0.5 font-mono text-[11px] text-[#6B7280]">
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
        <p className="py-12 text-center text-sm text-[#6B7280]">No data available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {topics.map((topic, i) => {
            const { Icon, color } = TIER_LABELS[topic.tier] || { Icon: Circle, color: "text-[#9CA3AF]" };
            const tierIdx = TIERS.indexOf(topic.tier);
            const barWidth = ["w-full", "w-3/4", "w-1/2", "w-1/4"][tierIdx] || "w-1/4";
            return (
              <div
                key={`${topic.topic}-${i}`}
                className="rounded-xl border border-[#E7E2DA] bg-[#FFFFFF] p-5 shadow-sm transition-all duration-250 hover:-translate-y-[3px] hover:border-[#C4573D]/40 hover:shadow-lg"
              >
                <div className="mb-3.5 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug text-[#111827]">{topic.topic}</p>
                  <span className={`shrink-0 flex items-center gap-1 font-mono text-xs ${color}`}>
                    <Icon size={13} strokeWidth={2} />
                  </span>
                </div>
                <div className="mb-2.5 h-1 w-full rounded-full bg-[#E7E2DA]">
                  <div className={`h-1 rounded-full bg-[#C4573D] ${barWidth} transition-all`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#9CA3AF]">
                    Unit {topic.unitNum}
                  </span>
                  <span className={`font-mono text-[11px] ${color}`}>{topic.tier}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ Icon, value, label, sub, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`group flex flex-col gap-2.5 rounded-xl border border-[#E7E2DA] bg-[#FFFFFF] px-4 py-4 text-left shadow-sm transition-all duration-250 hover:-translate-y-[3px] hover:border-[#C4573D]/30 hover:shadow-lg ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200"
          style={{ backgroundColor: ICON_BG }}
        >
          <Icon size={16} strokeWidth={2} style={{ color: ICON_ACCENT }} />
        </div>
      </div>
      <div>
        <p className="font-display text-3xl font-extrabold leading-none tracking-tight text-[#111827]">{value}</p>
        <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-[#6B7280]">{label}</p>
        {sub && (
          <p className="mt-0.5 font-mono text-[10px] text-[#9CA3AF]">{sub}</p>
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
    <div className="mb-12">
      <p className="mb-4 font-mono text-xs tracking-widest text-[#9CA3AF]">SUBJECT STATISTICS</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          Icon={FileText}
          value={stats.totalQuestions}
          label="Questions"
        />
        <StatCard
          Icon={Layers}
          value={stats.totalUnits}
          label="Units"
        />
        <StatCard
          Icon={Flame}
          value={stats.totalTopics}
          label="Topics"
        />
        <StatCard
          Icon={Calendar}
          value={stats.totalPapers}
          label="Papers"
          sub={stats.yearRange}
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
    <div
      className="relative min-h-screen"
      style={{
        backgroundColor: "#FAF7F2",
        backgroundImage:
          "radial-gradient(1200px 560px at 8% -10%, rgba(196,87,61,0.07), transparent 60%), radial-gradient(1000px 520px at 100% 100%, rgba(78,124,122,0.06), transparent 55%)",
        color: "#111827",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-[#9CA3AF] transition-colors hover:text-[#6B7280]"
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        All subjects
      </Link>

      {/* Header */}
      <div className="mb-10 flex flex-col gap-1.5">
        <span className="font-mono text-xs tracking-widest text-[#C4573D]">
          {subjectMeta ? subjectMeta.short : subjectCode?.toUpperCase()} / DASHBOARD
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
          {subjectMeta ? subjectMeta.name : subjectCode}
        </h1>
        {subjectMeta && (
          <p className="text-sm text-[#6B7280]">{subjectMeta.blurb}</p>
        )}
      </div>

      {/* Subject Statistics */}
      {status !== "error" && (
        <SubjectStats unitsData={unitsData} unitQuestionsData={unitQuestionsData} papers={papers} />
      )}
      {syllabus && (
  <div className="mb-12 rounded-xl border border-[#E7E2DA] bg-[#FFFFFF] p-6 shadow-sm">
    <p className="mb-5 font-mono text-xs tracking-widest text-[#9CA3AF]">
      SYLLABUS INFORMATION
    </p>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

      <div>
        <p className="text-xs text-[#9CA3AF]">Subject</p>
        <p className="mt-1 text-lg font-semibold text-[#111827]">
          {syllabus.subject_name}
        </p>
      </div>

      <div>
        <p className="text-xs text-[#9CA3AF]">Subject Code</p>
        <p className="mt-1 text-lg font-semibold text-[#111827]">
          {syllabus.subject_code}
        </p>
      </div>

      <div>
        <p className="text-xs text-[#9CA3AF]">Semester</p>
        <p className="mt-1 text-lg font-semibold text-[#111827]">
          {syllabus.semester}
        </p>
      </div>

      <div>
        <p className="text-xs text-[#9CA3AF]">Effective From</p>
        <p className="mt-1 text-lg font-semibold text-[#111827]">
          {syllabus.effective_from}
        </p>
      </div>

      <div>
        <p className="text-xs text-[#9CA3AF]">Last Updated</p>
        <p className="mt-1 text-lg font-semibold text-[#111827]">
          {syllabus.last_updated}
        </p>
      </div>

      <div>
        <p className="text-xs text-[#9CA3AF]">Analysis Status</p>

        <span className="mt-2 inline-flex rounded-full bg-[#6C8B6F]/15 px-3 py-1 text-sm font-medium text-[#6C8B6F]">
          Based on Official GTU Syllabus
        </span>

      </div>

    </div>
  </div>
)}

      {/* Quick Actions */}
      <div className="mb-12">
        <p className="mb-4 font-mono text-xs tracking-widest text-[#9CA3AF]">QUICK ACTIONS</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_ACTIONS.map((action, idx) => {
            const isActive = section === action.id;
            const isLastOdd = idx === QUICK_ACTIONS.length - 1 && QUICK_ACTIONS.length % 2 !== 0;
            const Icon = action.Icon;
            return (
              <button
                key={action.id}
                onClick={() => {
  if (action.id === "syllabus") {
    window.open(
  `${import.meta.env.VITE_API_URL}/subject/${subjectCode}/syllabus`,
  "_blank"
);
    return;
  }

  setSection(action.id);
}}
                style={{ transitionTimingFunction: "ease", transitionDuration: "250ms" }}
                className={`group flex flex-col gap-3 rounded-xl border p-4 text-left shadow-sm transition-[transform,box-shadow,border-color] ${isLastOdd ? "col-span-2 sm:col-span-1" : ""} ${
                  isActive
                    ? "border-[#C4573D] bg-[#FFFFFF] shadow-md"
                    : "border-[#E7E2DA] bg-[#FFFFFF] hover:-translate-y-[3px] hover:border-[#C4573D] hover:shadow-md"
                }`}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: ICON_BG }}
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    style={{ color: isActive ? ICON_ACCENT : ICON_DEFAULT }}
                    className="transition-colors duration-200 group-hover:text-[#C4573D]"
                  />
                </div>
                <div>
                  <p className={`text-sm font-bold leading-tight ${isActive ? "text-[#C4573D]" : "text-[#111827]"}`}>
                    {action.title}
                  </p>
                  <p className="mt-0.5 text-xs font-normal leading-snug text-[#6B7280]">{action.desc}</p>
                </div>
                {isActive && (
                  <div className="mt-auto h-0.5 w-full rounded-full bg-[#C4573D]/60" />
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
          <p className="mb-3 font-mono text-xs tracking-widest text-[#9CA3AF]">SELECT UNIT</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
            {unitKeys.map((u) => (
              <button
                key={u}
                onClick={() => setActiveUnit(u)}
                className={`shrink-0 rounded-lg border px-4 py-2 font-mono text-sm font-medium transition-all duration-200 ${
                  activeUnit === u
                    ? "border-[#C4573D] bg-[#C4573D] text-white shadow-md shadow-[#C4573D]/20"
                    : "border-[#E7E2DA] bg-[#FFFFFF] text-[#6B7280] hover:border-[#C4573D]/40 hover:bg-[#F7E5E0] hover:text-[#111827]"
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
                  <p className="py-12 text-center text-sm text-[#6B7280]">
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
                    className="rounded-xl border border-[#E7E2DA] bg-[#FFFFFF] p-6 shadow-sm transition-all duration-250 hover:-translate-y-[3px] hover:border-[#C4573D]/30 hover:shadow-lg"
                  >
                    <div className="mb-3.5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#F7E5E0] px-3 py-1 font-mono text-xs font-medium text-[#C4573D]">
                        {q.year}
                      </span>
                      <span className="rounded-full bg-[#F3F4F6] px-3 py-1 font-mono text-xs font-medium text-[#6B7280]">
                        {q.question_no}
                      </span>
                    </div>
                    <p className="text-[15px] leading-relaxed text-[#111827]">{q.question}</p>
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
              <p className="py-12 text-center text-sm text-[#6B7280]">
                No questions recorded for this unit yet.
              </p>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}