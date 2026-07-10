import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Check,
  ArrowUp,
  Brain,
  Layers,
  ScanSearch,
  BarChart3,
  Network,
  TerminalSquare,
  Cpu,
  FileCode,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { fetchSubjects } from "../services/api";
import { setSubjectsCache } from "../services/subjects";

/* ──────────────────────────────────────────────────────────
   Home — identity pass.
   Same functional pieces as before (tabs, SubjectDropdown, code
   input, matching logic, routes) — unchanged. This pass gives
   the page an actual visual identity instead of a themed SaaS
   template: a hero product preview (the ranked-topics output
   the tool produces) stacked under the search card, a stamp
   motif that repeats as a system rather than a one-off, and
   three structurally distinct sections (ruled data-strip,
   asymmetric split, spine timeline) instead of four repeats
   of the same card grid.
   ────────────────────────────────────────────────────────── */

/* ── hooks (unchanged) ── */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

/* ── subject full-name lookup (unchanged) ── */
const SUBJECT_FULL_NAMES = {
  AJP: "Advanced Java Programming",
  OS: "Operating System",
  BEE: "Basic Electrical Engineering",
};

function getSubjectDisplayName(s) {
  if (!s) return "";
  return s.fullName || s.full_name || SUBJECT_FULL_NAMES[s.code?.toUpperCase()] || s.name;
}

/* ── main ── */
export default function Home() {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [inputMode, setInputMode] = useState("code"); // "code" | "dropdown"
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const navigate = useNavigate();

  const [howRef, howVis] = useInView();
  const [capRef, capVis] = useInView();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSubjects()
      .then((list) => {
        setSubjectsCache(list);
        setSubjects(list);
      })
      .catch(() => setSubjects([]))
      .finally(() => setSubjectsLoading(false));
  }, []);

  const go = () => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) { setCodeError("Please enter a subject code."); return; }

    const match = subjects.find((s) =>
      s.code?.toLowerCase() === trimmed ||
      s.short?.toLowerCase() === trimmed ||
      s.gtu_code?.toLowerCase() === trimmed
    );

    if (match) {
      setCodeError("");
      navigate(`/subject/${match.code}`);
      return;
    }

    setCodeError(`No subject found matching "${code.trim()}". Try a short code (e.g. AJP) or the full GTU subject code (e.g. BE04000221).`);
  };

  const goFromDropdown = () => {
    if (!selectedSubject) { alert("Please select a subject"); return; }
    navigate(`/subject/${selectedSubject.code}`);
  };

  return (
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
        backgroundColor: "var(--color-home-bg)",
        color: "var(--color-home-text)",
        fontFamily: "Inter, sans-serif",
      }}
    >

      {/* ══ HERO ══ */}
      <section style={{
        width: "100%",
        position: "relative",
        borderBottom: "1px solid var(--color-home-border)",
        backgroundColor: "var(--color-home-bg)",
      }}>
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: "1140px", width: "100%",
          margin: "0 auto",
          padding: isMobile ? "0 20px" : "0 clamp(24px, 5vw, 56px)",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "flex-start",
          gap: isMobile ? "0" : "clamp(36px, 5vw, 64px)",
        }}>

          {/* ── LHS: text content ── */}
          <div style={{
            flex: isMobile ? "none" : "1 1 0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: isMobile ? "auto" : "calc(100vh - 72px)",
            padding: isMobile ? "56px 0 28px" : "clamp(52px, 6.5vw, 84px) 0",
          }}>

            {/* eyebrow — stamp treatment, the signature element */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              alignSelf: "flex-start",
              padding: "5px 12px",
              marginBottom: "22px",
              border: "1.5px solid var(--color-home-accent)",
              borderRadius: "3px",
              transform: "rotate(-1.2deg)",
              color: "var(--color-home-accent)",
              fontFamily: "var(--font-mono)",
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              GTU · Est. Question Bank
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: isMobile ? "clamp(2.3rem, 11vw, 3rem)" : "clamp(2.5rem, 4.6vw, 3.8rem)",
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              margin: "0 0 28px",
              color: "var(--color-home-text)",
            }}>
              Know exactly what<br />
              <span style={{ position: "relative", display: "inline-block" }}>
                gets asked
                <svg
                  viewBox="0 0 220 12" preserveAspectRatio="none"
                  style={{ position: "absolute", left: 0, bottom: "-6px", width: "100%", height: "10px" }}
                >
                  <path d="M2 8 Q 55 2, 110 7 T 218 5" fill="none" stroke="var(--color-home-accent)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>

            <p style={{
              fontSize: "14.5px",
              lineHeight: 1.75,
              color: "var(--color-home-text-secondary)",
              marginBottom: "36px",
              maxWidth: isMobile ? "100%" : "420px",
            }}>
              We tore through a decade of GTU papers and ranked every topic by
              how often examiners return to it. Stop studying everything —
              start with what's actually going to be on the paper.
            </p>

            <div className="hero-pills" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["10+ year dataset", "AI topic ranking", "4 importance tiers", "Instant downloads"].map(p => (
                <span key={p} style={{
                  padding: "5px 13px", borderRadius: "5px",
                  border: "1px solid var(--color-home-border-strong)",
                  background: "var(--color-home-card)",
                  fontSize: "11px", color: "var(--color-home-text-secondary)",
                  fontFamily: "var(--font-mono)",
                  boxShadow: "var(--shadow-home-sm)",
                }}>{p}</span>
              ))}
            </div>
          </div>

          {/* ── RHS: search card, vertically centered against the headline ── */}
          <div style={{
            flex: isMobile ? "none" : "0 0 clamp(300px, 38%, 400px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: isMobile ? "auto" : "calc(100vh - 72px)",
            padding: isMobile ? "0 0 56px" : "clamp(52px, 6.5vw, 84px) 0",
          }}>

            {/* search / input card — unchanged functionality */}
            <div>
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--color-home-text)",
                marginBottom: "12px",
                letterSpacing: "-0.01em",
              }}>What are you studying?</p>

              <div style={{
                width: "100%",
                borderRadius: "14px",
                border: "1px solid var(--color-home-border-strong)",
                background: "var(--color-home-card)",
                padding: "22px",
                boxShadow: "var(--shadow-home-lg)",
              }}>

                {/* tab switcher */}
                <div style={{
                  display: "flex", gap: "2px",
                  background: "var(--color-home-paper-raised)",
                  border: "1px solid var(--color-home-border)",
                  borderRadius: "7px", padding: "3px",
                  marginBottom: "16px",
                }}>
                  {["code", "dropdown"].map(tab => (
                    <button key={tab} onClick={() => setInputMode(tab)} style={{
                      flex: 1, padding: "8px 10px", borderRadius: "5px",
                      border: "none", cursor: "pointer",
                      fontFamily: "var(--font-mono)", fontSize: "10px",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      background: inputMode === tab ? "var(--color-home-card)" : "transparent",
                      boxShadow: inputMode === tab ? "var(--shadow-home-sm)" : "none",
                      color: inputMode === tab ? "var(--color-home-text)" : "var(--color-home-text-tertiary)",
                      transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                    }}>
                      {tab === "code" ? "Enter Code" : "Browse Subjects"}
                    </button>
                  ))}
                </div>

                {inputMode === "code" ? (
                  <>
                    <input
                      type="text"
                      placeholder="e.g. BE04000221, OS, or ADA"
                      value={code}
                      onChange={e => { setCode(e.target.value); setCodeError(""); }}
                      onKeyDown={e => e.key === "Enter" && go()}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "11px 13px", borderRadius: "8px",
                        border: "1px solid var(--color-home-border)",
                        background: "var(--color-home-input)",
                        color: "var(--color-home-text)",
                        fontFamily: "var(--font-mono)", fontSize: "13.5px",
                        outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = "var(--color-home-accent)";
                        e.target.style.boxShadow = "0 0 0 3px var(--color-home-accent-soft)";
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = "var(--color-home-border)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    {codeError && (
                      <p style={{
                        marginTop: "8px", marginBottom: 0,
                        fontSize: "11px", lineHeight: 1.5,
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-home-error)",
                      }}>{codeError}</p>
                    )}
                  </>
                ) : (
                  <SubjectDropdown
                    subjects={subjects}
                    value={selectedSubject}
                    onChange={setSelectedSubject}
                  />
                )}

                <button
                  onClick={inputMode === "code" ? go : goFromDropdown}
                  style={{
                    marginTop: "14px", width: "100%",
                    padding: "12px 16px", borderRadius: "8px",
                    background: "var(--color-home-accent)",
                    color: "#fff", fontFamily: "var(--font-display)",
                    fontSize: "14px", fontWeight: 700,
                    border: "none", cursor: "pointer",
                    boxShadow: "var(--shadow-home-md)",
                    transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
                    letterSpacing: "-0.01em",
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = "var(--color-home-accent-hover)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-home-lg)";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = "var(--color-home-accent)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "var(--shadow-home-md)";
                  }}
                  onMouseDown={e => {
                    e.currentTarget.style.background = "var(--color-home-accent-active)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow-home-sm)";
                  }}
                  onMouseUp={e => {
                    e.currentTarget.style.background = "var(--color-home-accent-hover)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-home-lg)";
                  }}
                >
                  Analyze Subject →
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══ TRUST STRIP ══ */}
      <section style={{
        width: "100%",
        borderBottom: "1px solid var(--color-home-border)",
        backgroundColor: "var(--color-home-paper-raised)",
        padding: isMobile ? "16px 20px" : "18px clamp(20px, 5vw, 40px)",
      }}>
        <div style={{
          maxWidth: "1140px", margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: isMobile ? "16px" : "32px",
        }}>
          {[
            { Icon: GraduationCap, label: "Built by GTU Students" },
            { Icon: ShieldCheck, label: "GTU Syllabus Synced", tinted: true },
            { Icon: ScanSearch, label: "OCR Processed" },
          ].map(({ Icon, label, tinted }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: "8px",
              fontSize: "12px", fontFamily: "var(--font-mono)",
              color: tinted ? "var(--color-home-stamp-green)" : "var(--color-home-text-secondary)",
              fontWeight: tinted ? 600 : 400,
            }}>
              <Icon size={14} strokeWidth={2} style={{ color: tinted ? "var(--color-home-stamp-green)" : "var(--color-home-text-tertiary)" }} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ══ DATA STRIP — ruled cover-sheet layout ══ */}
      <section style={{
        width: "100%",
        background: "var(--color-home-slate)",
        borderBottom: "1px solid var(--color-home-border-cool)",
      }}>
        <div style={{
          maxWidth: "1140px", margin: "0 auto",
          padding: isMobile ? "0 16px" : "0 clamp(20px, 5vw, 40px)",
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
        }}>
          {[
            { value: subjectsLoading ? "…" : `${subjects.length}`, label: "Subjects Indexed" },
            { value: "2×", label: "Semesters Covered" },
            { value: "10+", label: "Years Analysed" },
            { value: "2000+", label: "Questions Indexed" },
            { value: "AI", label: "Topic Ranking" },
          ].map((item, i) => (
            <div key={item.label} style={{
              textAlign: "center", padding: "26px 10px",
              borderRight: (!isMobile && i < 4) ? "1px solid var(--color-home-border-cool)" : "none",
              borderBottom: (isMobile && i < 4) ? "1px solid var(--color-home-border-cool)" : "none",
            }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 2.4vw, 2rem)",
                fontWeight: 800,
                color: "var(--color-home-accent)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}>{item.value}</div>
              <div style={{
                marginTop: "7px", fontSize: "10.5px",
                fontFamily: "var(--font-mono)",
                color: "var(--color-home-text-tertiary)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CAPABILITIES — asymmetric split ══ */}
      <section ref={capRef} style={{
        width: "100%", padding: "clamp(56px, 8vw, 96px) clamp(20px, 5vw, 40px)",
        borderBottom: "1px solid var(--color-home-border)",
        backgroundColor: "var(--color-home-features)",
      }}>
        <div style={{
          maxWidth: "1140px", margin: "0 auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "36px" : "56px",
          opacity: capVis ? 1 : 0, transform: capVis ? "none" : "translateY(14px)",
          transition: "opacity 0.5s, transform 0.5s",
        }}>
          {/* left: intro column */}
          <div style={{ flex: isMobile ? "none" : "0 0 300px" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "11px",
              letterSpacing: "0.14em", color: "var(--color-home-accent)",
              textTransform: "uppercase", fontWeight: 700,
            }}>Capabilities</span>
            <h2 style={{
              marginTop: "10px",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
              fontWeight: 700, color: "var(--color-home-text)",
              letterSpacing: "-0.02em", lineHeight: 1.15,
            }}>Built for exam week, not for browsing</h2>
            <p style={{
              marginTop: "14px", fontSize: "13px", lineHeight: 1.7,
              color: "var(--color-home-text-secondary)", maxWidth: "280px",
            }}>
              Every feature exists to answer one question: what should I study
              in the time I have left?
            </p>
          </div>

          {/* right: asymmetric feature rows, not a uniform grid */}
          <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column" }}>
            {[
              { Icon: Brain,      title: "Most Important Topics", body: "Ranked by how often examiners actually return to them across a decade of papers.", big: true },
              { Icon: Layers,     title: "Unit Wise PYQs",         body: "Every question sorted into the right unit, automatically." },
              { Icon: ScanSearch, title: "Topic Wise PYQs",        body: "Drill into a single topic and see every time it's been asked." },
              { Icon: BarChart3,  title: "Frequency Analysis",     body: "A live count of repeats across 10+ years of papers." },
              { Icon: Network,    title: "Difficulty Analysis",    body: "Know what's worth memorizing vs. worth understanding." },
            ].map((cap, i) => (
              <div key={cap.title} style={{
                display: "flex", alignItems: "flex-start", gap: "16px",
                padding: cap.big ? "0 0 22px" : "18px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--color-home-border)",
              }}>
                <div style={{
                  width: cap.big ? "40px" : "32px", height: cap.big ? "40px" : "32px",
                  borderRadius: "3px",
                  border: `1.5px solid ${cap.big ? "var(--color-home-accent)" : "var(--color-home-border-strong)"}`,
                  transform: cap.big ? "rotate(-1deg)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  background: cap.big ? "var(--color-home-accent-soft)" : "var(--color-home-card)",
                }}>
                  <cap.Icon size={cap.big ? 19 : 15} strokeWidth={2} style={{ color: cap.big ? "var(--color-home-accent)" : "var(--color-home-text-secondary)" }} />
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontSize: cap.big ? "1.05rem" : "0.92rem",
                    fontWeight: 600, color: "var(--color-home-text)",
                    marginBottom: "4px", letterSpacing: "-0.01em",
                  }}>{cap.title}</h3>
                  <p style={{
                    fontSize: "12.5px", lineHeight: 1.6,
                    color: "var(--color-home-text-secondary)",
                    maxWidth: "480px",
                  }}>{cap.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS — connected spine timeline ══ */}
      <section ref={howRef} style={{
        width: "100%", padding: "clamp(56px, 8vw, 96px) clamp(20px, 5vw, 40px)",
        background: "var(--color-home-slate-raised)",
        borderBottom: "1px solid var(--color-home-border-cool)",
      }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <div style={{
            marginBottom: "48px",
            opacity: howVis ? 1 : 0, transform: howVis ? "none" : "translateY(14px)",
            transition: "opacity 0.5s, transform 0.5s",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "11px",
              letterSpacing: "0.14em", color: "var(--color-home-accent)",
              textTransform: "uppercase", fontWeight: 700,
            }}>How it works</span>
            <h2 style={{
              marginTop: "10px",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
              fontWeight: 700, color: "var(--color-home-text)",
              letterSpacing: "-0.02em", lineHeight: 1.15,
            }}>From paper to plan in seconds</h2>
          </div>

          <div style={{ position: "relative" }}>
            {/* spine line — carries genuine sequence, so numbering earns its keep here */}
            {!isMobile && (
              <div style={{
                position: "absolute", left: "23px", top: "6px", bottom: "6px",
                width: "1.5px", background: "var(--color-home-spine)",
              }} />
            )}

            {[
              { n: "01", Icon: TerminalSquare, title: "Enter your subject code", body: "Type the GTU subject code or browse our growing list of supported subjects." },
              { n: "02", Icon: Cpu,            title: "AI processes the papers", body: "The pipeline reads 10+ years of PYQs, extracts every question, and maps each one to a topic and unit." },
              { n: "03", Icon: FileCode,       title: "Study what matters most", body: "Topics emerge ranked by frequency and importance tier. Open your dashboard and start from the top." },
            ].map((step, i) => (
              <div key={step.n} style={{
                display: "flex", gap: "20px",
                marginBottom: i < 2 ? "32px" : 0,
                opacity: howVis ? 1 : 0,
                transform: howVis ? "none" : "translateY(16px)",
                transition: `opacity 0.5s ${i * 110}ms, transform 0.5s ${i * 110}ms`,
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  border: "1.5px solid var(--color-home-accent)",
                  background: "var(--color-home-card-cool)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, position: "relative", zIndex: 1,
                  boxShadow: "var(--shadow-home-sm)",
                }}>
                  <step.Icon size={19} strokeWidth={2} style={{ color: "var(--color-home-accent)" }} />
                </div>
                <div style={{
                  flex: 1, paddingTop: "3px",
                  borderBottom: i < 2 ? "1px solid var(--color-home-border-cool)" : "none",
                  paddingBottom: i < 2 ? "26px" : 0,
                }}>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: "10px",
                    color: "var(--color-home-text-tertiary)", letterSpacing: "0.1em",
                    marginBottom: "4px",
                  }}>STEP {step.n}</div>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontSize: "1.05rem",
                    fontWeight: 600, color: "var(--color-home-text)", marginBottom: "6px",
                  }}>{step.title}</h3>
                  <p style={{
                    fontSize: "13px", lineHeight: 1.65, color: "var(--color-home-text-secondary)",
                    maxWidth: "480px",
                  }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER CTA ══ */}
      <section style={{
        borderTop: "1px solid var(--color-home-border)",
        padding: "60px 20px",
        textAlign: "center",
        background: "var(--color-home-cta)",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
          color: "var(--color-home-text)", letterSpacing: "-0.02em",
          marginBottom: "10px",
        }}>Exam week doesn't wait.</h2>
        <p style={{
          color: "var(--color-home-text-secondary)", fontSize: "14px",
          marginBottom: "26px", maxWidth: "340px", margin: "0 auto 26px",
          lineHeight: 1.7,
        }}>
          Open any subject, see the top topics in under a minute, and go study
          exactly what matters.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            padding: "11px 28px", borderRadius: "8px",
            background: "var(--color-home-accent)",
            color: "#fff", fontFamily: "var(--font-display)",
            fontWeight: 600, fontSize: "14px",
            border: "none", cursor: "pointer",
            boxShadow: "var(--shadow-home-md)",
            transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
            display: "inline-flex", alignItems: "center", gap: "6px",
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "var(--color-home-accent-hover)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "var(--shadow-home-lg)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "var(--color-home-accent)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "var(--shadow-home-md)";
          }}
          onMouseDown={e => {
            e.currentTarget.style.background = "var(--color-home-accent-active)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-home-sm)";
          }}
          onMouseUp={e => {
            e.currentTarget.style.background = "var(--color-home-accent-hover)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "var(--shadow-home-lg)";
          }}
        >
          Back to top <ArrowUp size={14} strokeWidth={2.25} />
        </button>
      </section>

      <style>{`
        .subject-dropdown-panel::-webkit-scrollbar { width: 4px; }
        .subject-dropdown-panel::-webkit-scrollbar-track { background: transparent; }
        .subject-dropdown-panel::-webkit-scrollbar-thumb { background: var(--color-home-border-strong); border-radius: 4px; }
        .subject-dropdown-panel::-webkit-scrollbar-thumb:hover { background: var(--color-home-text-tertiary); }

        @media (max-width: 767px) {
          input[type="text"], textarea, select {
            font-size: 16px !important;
          }
          .hero-pills span {
            font-size: 10px !important;
            padding: 4px 9px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ── SubjectDropdown — unchanged behavior; stamp-style badge retained ── */
function SubjectDropdown({ subjects, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "10px 14px", borderRadius: "8px",
          border: `1px solid ${open ? "var(--color-home-accent)" : "var(--color-home-border)"}`,
          background: "var(--color-home-input)",
          color: value ? "var(--color-home-text)" : "var(--color-home-text-tertiary)",
          fontFamily: "var(--font-mono)", fontSize: "13px",
          cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: open ? "0 0 0 3px var(--color-home-accent-soft)" : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        <span>
          {value
            ? <><span style={{ color: "var(--color-home-accent)", marginRight: "8px", fontWeight: 700 }}>{value.short}</span>{getSubjectDisplayName(value)}</>
            : "Choose a subject…"}
        </span>
        <ChevronDown
          size={14} strokeWidth={2.25}
          style={{
            flexShrink: 0, marginLeft: "8px", color: "var(--color-home-text-tertiary)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div className="subject-dropdown-panel" style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          zIndex: 50,
          borderRadius: "10px",
          border: "1px solid var(--color-home-border-strong)",
          background: "var(--color-home-card)",
          boxShadow: "var(--shadow-home-lg)",
          overflow: "hidden",
          maxHeight: "224px",
          overflowY: "auto",
        }}>
          {subjects.map((s, i) => {
            const active = value?.code === s.code;
            return (
              <button
                key={s.code}
                onClick={() => { onChange(s); setOpen(false); }}
                style={{
                  width: "100%", padding: "11px 14px",
                  display: "flex", alignItems: "center", gap: "10px",
                  border: "none",
                  borderBottom: i < subjects.length - 1 ? "1px solid var(--color-home-border)" : "none",
                  background: active ? "var(--color-home-accent-soft)" : "transparent",
                  cursor: "pointer", textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = "var(--color-home-paper-raised)"; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{
                  flexShrink: 0,
                  padding: "2px 7px", borderRadius: "3px",
                  border: `1px solid ${active ? "var(--color-home-accent)" : "var(--color-home-border-strong)"}`,
                  fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
                  color: active ? "var(--color-home-accent)" : "var(--color-home-text-tertiary)",
                  background: "var(--color-home-card)",
                  letterSpacing: "0.04em",
                }}>{s.short}</span>
                <div>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: "13px",
                    fontWeight: 600,
                    color: active ? "var(--color-home-text)" : "var(--color-home-text-secondary)",
                  }}>{getSubjectDisplayName(s)}</div>
                </div>
                {active && (
                  <Check
                    size={14} strokeWidth={2.5}
                    style={{ marginLeft: "auto", flexShrink: 0, color: "var(--color-home-accent)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}