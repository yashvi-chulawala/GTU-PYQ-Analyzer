import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useLocation } from "react-router-dom";

/* ── Feedback Modal ── */
function FeedbackModal({ onClose }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("suggestion");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
  if (!message.trim()) return;

  setSending(true);

  const { error } = await supabase
    .from("feedback")
    .insert([
      {
        type,
        name: name.trim() || null,
        message: message.trim(),
      },
    ]);

  setSending(false);

  if (error) {
    console.error(error);
    alert("Failed to send feedback.");
    return;
  }

  setSent(true);

  setName("");
  setMessage("");
  setType("suggestion");
};

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.18s ease both",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "440px",
          borderRadius: "16px",
          border: "1px solid var(--color-border)",
          background: "var(--color-panel)",
          padding: "28px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          animation: "rise 0.22s cubic-bezier(0.16,1,0.3,1) both",
          position: "relative",
        }}
      >
        {/* close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--color-ink-faint)", padding: "4px",
            lineHeight: 1, fontSize: "18px",
            transition: "color 0.15s",
          }}
          onMouseOver={e => e.currentTarget.style.color = "var(--color-ink)"}
          onMouseOut={e => e.currentTarget.style.color = "var(--color-ink-faint)"}
        >✕</button>

        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "2.4rem", marginBottom: "14px" }}>🎉</div>
            <h3 style={{
              fontFamily: "var(--font-display)", fontSize: "1.1rem",
              fontWeight: 700, color: "var(--color-ink)", marginBottom: "8px",
            }}>Thanks for the feedback!</h3>
            <p style={{
              fontSize: "13px", color: "var(--color-ink-muted)", lineHeight: 1.7,
            }}>We read every submission and use it to shape what gets built next.</p>
            <button
              onClick={onClose}
              style={{
                marginTop: "20px", padding: "9px 22px", borderRadius: "8px",
                background: "var(--color-signal-violet)", color: "#fff",
                fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer",
              }}
            >Close</button>
          </div>
        ) : (
          <>
            {/* header */}
            <div style={{ marginBottom: "22px" }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "10px",
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "var(--color-signal-teal)",
              }}>Share your thoughts</span>
              <h2 style={{
                marginTop: "6px",
                fontFamily: "var(--font-display)", fontSize: "1.25rem",
                fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.015em",
              }}>Got an idea or a bug?</h2>
              <p style={{
                marginTop: "6px", fontSize: "13px",
                color: "var(--color-ink-muted)", lineHeight: 1.6,
              }}>
                Tell us what you think — a missing subject, a broken feature,
                or anything that would make exam prep easier.
              </p>
            </div>

            {/* type selector */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Type</label>
              <div style={{
                display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px",
              }}>
                {[
                  { id: "suggestion", label: "💡 Suggestion" },
                  { id: "bug", label: "🐛 Bug report" },
                  { id: "subject", label: "📚 Add subject" },
                  { id: "other", label: "💬 Other" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setType(opt.id)}
                    style={{
                      padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
                      fontFamily: "var(--font-mono)", fontSize: "11px",
                      border: `1px solid ${type === opt.id ? "var(--color-signal-violet)" : "var(--color-border)"}`,
                      background: type === opt.id ? "rgba(124,92,252,0.12)" : "var(--color-void)",
                      color: type === opt.id ? "var(--color-signal-violet-soft)" : "var(--color-ink-faint)",
                      transition: "all 0.15s",
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {/* name */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Name <span style={{ color: "var(--color-ink-faint)" }}>(optional)</span></label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "var(--color-signal-violet)"}
                onBlur={e => e.target.style.borderColor = "var(--color-border)"}
              />
            </div>

            {/* message */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Message <span style={{ color: "var(--color-signal-violet-soft)" }}>*</span></label>
              <textarea
                placeholder={
                  type === "bug" ? "Describe what happened and how to reproduce it…" :
                  type === "subject" ? "Which subject? Include the GTU subject code if you have it…" :
                  "What's on your mind?"
                }
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical", minHeight: "100px",
                  fontFamily: "inherit", lineHeight: 1.6,
                }}
                onFocus={e => e.target.style.borderColor = "var(--color-signal-violet)"}
                onBlur={e => e.target.style.borderColor = "var(--color-border)"}
              />
            </div>

            <button
              onClick={submit}
              disabled={!message.trim() || sending}
              style={{
                width: "100%", padding: "11px 16px", borderRadius: "8px",
                background: message.trim() ? "var(--color-signal-violet)" : "var(--color-panel-raised)",
                color: message.trim() ? "#fff" : "var(--color-ink-faint)",
                fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600,
                border: "none", cursor: message.trim() ? "pointer" : "not-allowed",
                transition: "all 0.15s",
                opacity: sending ? 0.7 : 1,
              }}
            >
              {sending ? "Sending…" : "Send feedback"}
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "10px",
  fontFamily: "var(--font-mono)",
  color: "var(--color-ink-faint)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", borderRadius: "8px",
  border: "1px solid var(--color-border)",
  background: "var(--color-void)",
  color: "var(--color-ink)",
  fontFamily: "var(--font-mono)", fontSize: "13px",
  outline: "none", transition: "border-color 0.2s",
};

/* ── Navbar ── */
export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/80 bg-void/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-signal-violet to-signal-teal">
              <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-signal-violet to-signal-teal opacity-60 blur-md transition-opacity group-hover:opacity-90" />
              <svg
                className="relative h-4 w-4 text-void"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M2 12h4l2 7 4-14 2 7h4l2-4" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
              GTU PYQ <span className="text-signal-violet-soft">Analyzer</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                isHome ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              Subjects
            </Link>

            {/* Feedback button */}
            <button
              onClick={() => setFeedbackOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-signal-violet/40 hover:text-ink"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Feedback
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-signal-violet/40 hover:text-ink sm:flex"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
              </svg>
              API Docs
            </a>
          </nav>
        </div>
      </header>

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </>
  );
}
