import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSubjects } from "../services/api";
import { setSubjectsCache, getSubjectByCode } from "../services/subjects";

/* ── hooks ── */
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

/* ── main ── */
export default function Home() {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [inputMode, setInputMode] = useState("code"); // "code" | "dropdown"
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  const [howRef, howVis] = useInView();
  const [capRef, capVis] = useInView();
  const isMobile = useIsMobile();

  // Fetch subjects dynamically from backend
  useEffect(() => {
    fetchSubjects()
      .then((list) => {
        setSubjectsCache(list);
        setSubjects(list);
      })
      .catch(() => setSubjects([]))
      .finally(() => setSubjectsLoading(false));
  }, []);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const go = () => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) { setCodeError("Please enter a subject code."); return; }

    // Match against the folder code, short code, or full GTU subject code —
    // case-insensitively, ignoring leading/trailing spaces.
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
    <div style={{ width: "100%", overflowX: "hidden" }}>

      {/* ══ HERO ══ */}
      <section style={{
        minHeight: "100vh", width: "100vw",
        position: "relative", display: "flex", alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderBottom: "1px solid var(--color-border)",
      }}>

        {/* ambient blobs */}
        <div style={{
          position: "absolute", top: "-20vh", left: "-10vw",
          width: "55vw", height: "55vw", borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(124,92,252,0.1) 0%, transparent 65%)",
          transform: `translateY(${scrollY * 0.08}px)`,
        }} />
        <div style={{
          position: "absolute", bottom: "-15vh", right: "-10vw",
          width: "45vw", height: "45vw", borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)",
          transform: `translateY(${-scrollY * 0.06}px)`,
        }} />

        {/* two-column wrapper */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: "1100px", width: "100%",
          margin: "0 auto",
          padding: isMobile ? "0 20px" : "0 clamp(24px, 5vw, 60px)",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? "0" : "clamp(40px, 6vw, 80px)",
          minHeight: "100vh",
        }}>

          {/* ── LHS: all text content ── */}
          <div style={{
            flex: isMobile ? "none" : "1 1 0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: isMobile ? "100px 0 32px" : "clamp(80px, 10vw, 120px) 0",
          }}>

            {/* big site name */}
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: isMobile ? "clamp(2.4rem, 12vw, 3.2rem)" : "clamp(2.8rem, 5.5vw, 4.8rem)",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              margin: "0 0 28px",
              background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 60%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "rise 0.6s 0.05s both",
            }}>
              GTU PYQ<br />ANALYZER
            </h1>

            {/* tagline 1 */}
            <p style={{
              fontSize: "clamp(0.88rem, 1.6vw, 1rem)",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              color: "var(--color-ink-muted)",
              marginBottom: "10px",
              animation: "rise 0.6s 0.15s both",
            }}>
              Know what actually gets asked.
            </p>

            {/* tagline 2 */}
            <p style={{
              fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              color: "var(--color-ink)",
              marginBottom: "28px",
              animation: "rise 0.6s 0.22s both",
            }}>
              Stop studying everything.<br />Start studying strategically.
            </p>

            {/* description */}
            <p style={{
              fontSize: "13.5px",
              lineHeight: 1.8,
              color: "var(--color-ink-muted)",
              marginBottom: "32px",
              maxWidth: isMobile ? "100%" : "420px",
              animation: "rise 0.6s 0.3s both",
            }}>
              GTU PYQ Analyzer tears through a decade of question papers and
              surfaces exactly which topics examiners keep returning to —
              ranked, tiered, and ready before exam week.
            </p>

            {/* pill tags */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "8px",
              animation: "rise 0.6s 0.37s both",
            }}>
              {["10+ year dataset", "AI topic ranking", "4 importance tiers", "Unit-wise PYQs", "Instant downloads"].map(p => (
                <span key={p} style={{
                  padding: "5px 13px", borderRadius: "5px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-panel)",
                  fontSize: "11px", color: "var(--color-ink-muted)",
                  fontFamily: "var(--font-mono)",
                }}>{p}</span>
              ))}
            </div>
          </div>

          {/* ── RHS: input card ── */}
          <div style={{
            flex: isMobile ? "none" : "0 0 clamp(300px, 38%, 420px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: isMobile ? "0 0 80px" : "clamp(80px, 10vw, 120px) 0",
            animation: "rise 0.6s 0.44s both",
          }}>

            {/* above-card label */}
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
              fontWeight: 700,
              color: "var(--color-ink)",
              marginBottom: "14px",
              letterSpacing: "-0.01em",
            }}>What are you studying?</p>

            <div style={{
              width: "100%",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              background: "rgba(19,21,27,0.88)",
              padding: "28px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
            }}>

              {/* card heading + helper */}
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--color-ink)",
                letterSpacing: "0.02em",
                marginBottom: "4px",
              }}>Analyse Your Subject</p>
              <p style={{
                fontSize: "11.5px",
                color: "var(--color-ink-faint)",
                fontFamily: "var(--font-mono)",
                marginBottom: "18px",
                lineHeight: 1.5,
              }}>Enter a GTU subject code or browse the available subjects.</p>

              {/* tab switcher */}
              <div style={{
                display: "flex", gap: "2px",
                background: "var(--color-void)",
                borderRadius: "7px", padding: "3px",
                marginBottom: "20px",
              }}>
                {["code", "dropdown"].map(tab => (
                  <button key={tab} onClick={() => setInputMode(tab)} style={{
                    flex: 1, padding: "9px 10px", borderRadius: "5px",
                    border: "none", cursor: "pointer",
                    fontFamily: "var(--font-mono)", fontSize: "10px",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    background: inputMode === tab ? "var(--color-panel-raised)" : "transparent",
                    color: inputMode === tab ? "var(--color-ink)" : "var(--color-ink-faint)",
                    transition: "background 0.2s, color 0.2s",
                  }}>
                    {tab === "code" ? "Enter Code" : "Browse Subjects"}
                  </button>
                ))}
              </div>

              {inputMode === "code" ? (
                <>
                  <label style={{
                    display: "block", marginBottom: "8px",
                    fontSize: "10px", fontFamily: "var(--font-mono)",
                    color: "var(--color-ink-faint)", letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. BE04000221 or os"
                    value={code}
                    onChange={e => { setCode(e.target.value); setCodeError(""); }}
                    onKeyDown={e => e.key === "Enter" && go()}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "12px 14px", borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-void)",
                      color: "var(--color-ink)",
                      fontFamily: "var(--font-mono)", fontSize: "14px",
                      outline: "none", transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "var(--color-signal-violet)"}
                    onBlur={e => e.target.style.borderColor = "var(--color-border)"}
                  />
                  {codeError && (
                    <p style={{
                      marginTop: "8px", marginBottom: 0,
                      fontSize: "11.5px", lineHeight: 1.5,
                      fontFamily: "var(--font-mono)",
                      color: "#f87171",
                    }}>{codeError}</p>
                  )}
                </>
              ) : (
                <>
                  <label style={{
                    display: "block", marginBottom: "8px",
                    fontSize: "10px", fontFamily: "var(--font-mono)",
                    color: "var(--color-ink-faint)", letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>Select Subject</label>
                  <SubjectDropdown
                    subjects={subjects}
                    value={selectedSubject}
                    onChange={setSelectedSubject}
                  />
                </>
              )}

              <button
                onClick={inputMode === "code" ? go : goFromDropdown}
                style={{
                  marginTop: "18px", width: "100%",
                  padding: "14px 16px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #7c5cfc 0%, #3b82f6 100%)",
                  color: "#fff", fontFamily: "var(--font-display)",
                  fontSize: "15px", fontWeight: 700,
                  border: "none", cursor: "pointer",
                  transition: "opacity 0.15s, transform 0.15s",
                  letterSpacing: "-0.01em",
                }}
                onMouseOver={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
              >
                Analyze Subject
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* scroll cue — fixed to the viewport, not the hero section, so it stays
          visible even when hero content is taller than 100vh */}
      <div style={{
        position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
        color: "var(--color-ink-faint)",
        opacity: scrollY > 80 ? 0 : 1,
        pointerEvents: scrollY > 80 ? "none" : "auto",
        transition: "opacity 0.3s ease",
        zIndex: 5,
      }}>
        <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>SCROLL</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "scrollBounce 1.8s ease-in-out infinite" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* ══ FEATURES BAR ══ */}
      <section style={{
        width: "100%", padding: isMobile ? "28px 16px" : "36px 20px",
        background: "var(--color-panel)",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <div style={{
          maxWidth: "1000px", margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(130px, 1fr))",
          gap: isMobile ? "16px 8px" : "8px",
        }}>
          {[
            { value: subjectsLoading ? "…" : `${subjects.length} Subjects`, label: "Available now" },
            { value: "Every Semester", label: "Summer & winter both" },
            { value: "10+ Years", label: "Of PYQs" },
            { value: "4 Tiers", label: "Importance ranking" },
            { value: "Instant Downloads", label: "Original papers" },
          ].map(item => (
            <div key={item.value} style={{ textAlign: "center", padding: "0 8px" }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1rem, 1.6vw, 1.3rem)",
                fontWeight: 700,
                color: "var(--color-signal-violet-soft)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}>{item.value}</div>
              <div style={{
                marginTop: "6px", fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--color-ink-faint)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CAPABILITIES ══ */}
      <section ref={capRef} style={{
        width: "100%", padding: "clamp(48px, 8vw, 90px) clamp(20px, 5vw, 40px)",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            marginBottom: "48px",
            opacity: capVis ? 1 : 0, transform: capVis ? "none" : "translateY(20px)",
            transition: "opacity 0.6s, transform 0.6s",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "11px",
              letterSpacing: "0.14em", color: "var(--color-signal-teal)",
              textTransform: "uppercase",
            }}>Capabilities</span>
            <h2 style={{
              marginTop: "10px",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.7rem, 3.5vw, 2.5rem)",
              fontWeight: 700, color: "var(--color-ink)",
              letterSpacing: "-0.02em", lineHeight: 1.15,
            }}>Built for exam week</h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "14px",
          }}>
            {[
              { icon: "📋", title: "Unit Wise PYQs",        body: "Every question sorted into the right unit, automatically." },
              { icon: "🎯", title: "Topic Wise PYQs",       body: "Drill into a single topic and see every time it's been asked." },
              { icon: "🔥", title: "Most Important Topics", body: "Ranked by how often examiners actually return to them." },
              { icon: "📈", title: "Frequency Analysis",    body: "A live count of repeats across 10+ years of papers." },
              { icon: "🧭", title: "Difficulty Analysis",   body: "Know what's worth memorizing vs. worth understanding." },
            ].map((cap, i) => (
              <div key={cap.title} style={{
                padding: "24px 20px",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                background: "var(--color-panel)",
                opacity: capVis ? 1 : 0,
                transform: capVis ? "none" : "translateY(22px)",
                transition: `opacity 0.5s ${i * 80}ms, transform 0.5s ${i * 80}ms, border-color 0.2s, background 0.2s`,
                cursor: "default",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(124,92,252,0.4)";
                e.currentTarget.style.background = "var(--color-panel-raised)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.background = "var(--color-panel)";
              }}>
                <div style={{ fontSize: "1.6rem", marginBottom: "14px" }}>{cap.icon}</div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: "0.95rem",
                  fontWeight: 600, color: "var(--color-ink)",
                  marginBottom: "8px", letterSpacing: "-0.01em",
                }}>{cap.title}</h3>
                <p style={{
                  fontSize: "12px", lineHeight: 1.65,
                  color: "var(--color-ink-muted)",
                }}>{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section ref={howRef} style={{
        width: "100%", padding: "clamp(60px, 9vw, 100px) clamp(20px, 5vw, 40px)",
        background: "var(--color-panel)",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{
            textAlign: "center", marginBottom: "60px",
            opacity: howVis ? 1 : 0, transform: howVis ? "none" : "translateY(20px)",
            transition: "opacity 0.6s, transform 0.6s",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "11px",
              letterSpacing: "0.14em", color: "var(--color-signal-violet-soft)",
              textTransform: "uppercase",
            }}>How it works</span>
            <h2 style={{
              marginTop: "10px",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.7rem, 3.5vw, 2.5rem)",
              fontWeight: 700, color: "var(--color-ink)",
              letterSpacing: "-0.02em", lineHeight: 1.15,
            }}>From paper to plan in seconds</h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "14px",
          }}>
            {[
              { n: "01", icon: "⌨️", title: "Enter your subject code", body: "Type the GTU subject code or browse our growing list of supported subjects." },
              { n: "02", icon: "⚙️", title: "AI processes the papers", body: "The pipeline reads 10+ years of PYQs, extracts every question, and maps each one to a topic and unit." },
              { n: "03", icon: "🎯", title: "Study what matters most", body: "Topics emerge ranked by frequency and importance tier. Open your dashboard and start from the top." },
            ].map((step, i) => (
              <div key={step.n} style={{
                padding: "28px 24px", borderRadius: "12px",
                border: "1px solid var(--color-border)",
                background: "var(--color-panel-raised)",
                position: "relative", overflow: "hidden",
                opacity: howVis ? 1 : 0,
                transform: howVis ? "none" : "translateY(24px)",
                transition: `opacity 0.6s ${i * 120}ms, transform 0.6s ${i * 120}ms`,
              }}>
                <div style={{
                  position: "absolute", top: "-4px", right: "14px",
                  fontFamily: "var(--font-display)", fontSize: "5rem",
                  fontWeight: 800, color: "rgba(124,92,252,0.05)",
                  lineHeight: 1, userSelect: "none", pointerEvents: "none",
                }}>{step.n}</div>

                <div style={{ fontSize: "1.6rem", marginBottom: "14px" }}>{step.icon}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "10px",
                  color: "var(--color-ink-faint)", letterSpacing: "0.1em",
                  marginBottom: "8px",
                }}>STEP {step.n}</div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: "1.05rem",
                  fontWeight: 600, color: "var(--color-ink)", marginBottom: "8px",
                }}>{step.title}</h3>
                <p style={{
                  fontSize: "13px", lineHeight: 1.7, color: "var(--color-ink-muted)",
                }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER CTA ══ */}
      <section style={{
        borderTop: "1px solid var(--color-border)",
        padding: "64px 20px",
        textAlign: "center",
        background: "var(--color-panel)",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
          color: "var(--color-ink)", letterSpacing: "-0.02em",
          marginBottom: "10px",
        }}>Exam week doesn't wait.</h2>
        <p style={{
          color: "var(--color-ink-muted)", fontSize: "14px",
          marginBottom: "28px", maxWidth: "340px", margin: "0 auto 28px",
          lineHeight: 1.7,
        }}>
          Open any subject, see the top topics in under a minute, and go study
          exactly what matters.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            padding: "11px 28px", borderRadius: "8px",
            background: "var(--color-signal-violet)",
            color: "#fff", fontFamily: "var(--font-display)",
            fontWeight: 600, fontSize: "14px",
            border: "none", cursor: "pointer",
            transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseOver={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseOut={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
        >
          Back to top ↑
        </button>
      </section>

      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .subject-dropdown-panel::-webkit-scrollbar { width: 4px; }
        .subject-dropdown-panel::-webkit-scrollbar-track { background: transparent; }
        .subject-dropdown-panel::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
        .subject-dropdown-panel::-webkit-scrollbar-thumb:hover { background: var(--color-ink-faint); }

        @media (max-width: 767px) {
          /* input fields: prevent iOS zoom on focus (needs font-size >= 16px) */
          input[type="text"], textarea, select {
            font-size: 16px !important;
          }
          /* pill tags — smaller on tight screens */
          .hero-pills span {
            font-size: 10px !important;
            padding: 4px 9px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ── subject full-name lookup ──
   The subjects API currently returns only the short code as `name`
   (e.g. "AJP"). Until the backend adds a proper `fullName` field,
   this map fills in the full subject name for display. Any subject
   whose backend record already includes `fullName` / `full_name`
   will use that value automatically instead of this map. */
const SUBJECT_FULL_NAMES = {
  AJP: "Advanced Java Programming",
  OS: "Operating System",
  BEE: "Basic Electrical Engineering",
};

function getSubjectDisplayName(s) {
  if (!s) return "";
  return s.fullName || s.full_name || SUBJECT_FULL_NAMES[s.code?.toUpperCase()] || s.name;
}

/* ── SubjectDropdown ── */
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
      {/* trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "10px 14px", borderRadius: "8px",
          border: `1px solid ${open ? "var(--color-signal-violet)" : "var(--color-border)"}`,
          background: "var(--color-void)",
          color: value ? "var(--color-ink)" : "var(--color-ink-faint)",
          fontFamily: "var(--font-mono)", fontSize: "13px",
          cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "border-color 0.2s",
        }}
      >
        <span>
          {value
            ? <><span style={{ color: "var(--color-signal-teal)", marginRight: "8px" }}>{value.short}</span>{getSubjectDisplayName(value)}</>
            : "Choose a subject…"}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{
            flexShrink: 0, marginLeft: "8px", color: "var(--color-ink-faint)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* dropdown panel */}
      {open && (
        <div className="subject-dropdown-panel" style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          zIndex: 50,
          borderRadius: "10px",
          border: "1px solid var(--color-border)",
          background: "var(--color-panel)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          overflow: "hidden",
          maxHeight: "224px",
          overflowY: "auto",
          animation: "dropIn 0.18s cubic-bezier(0.16,1,0.3,1) both",
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
                  borderBottom: i < subjects.length - 1 ? "1px solid var(--color-border)" : "none",
                  background: active ? "var(--color-panel-raised)" : "transparent",
                  cursor: "pointer", textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = "var(--color-panel-raised)"; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{
                  flexShrink: 0,
                  padding: "2px 7px", borderRadius: "4px",
                  border: "1px solid var(--color-border)",
                  fontFamily: "var(--font-mono)", fontSize: "10px",
                  color: active ? "var(--color-signal-teal)" : "var(--color-ink-faint)",
                  background: "var(--color-void)",
                  letterSpacing: "0.04em",
                }}>{s.short}</span>
                <div>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: "13px",
                    fontWeight: 600,
                    color: active ? "var(--color-ink)" : "var(--color-ink-muted)",
                  }}>{getSubjectDisplayName(s)}</div>
                </div>
                {active && (
                  <svg style={{ marginLeft: "auto", flexShrink: 0, color: "var(--color-signal-violet)" }}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}