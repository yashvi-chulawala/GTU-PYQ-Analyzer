import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useLocation } from "react-router-dom";
import {
  X,
  Lightbulb,
  Bug,
  BookPlus,
  MessageCircle,
  PartyPopper,
  MessageSquareText,
  FileText,
} from "lucide-react";

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

  const TYPE_OPTIONS = [
    { id: "suggestion", label: "Suggestion", Icon: Lightbulb },
    { id: "bug", label: "Bug report", Icon: Bug },
    { id: "subject", label: "Add subject", Icon: BookPlus },
    { id: "other", label: "Other", Icon: MessageCircle },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(6,6,10,0.72)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.18s ease both",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "440px",
          borderRadius: "18px",
          border: "1px solid var(--color-border)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-panel) 100%, white 3%) 0%, var(--color-panel) 60%)",
          padding: "30px",
          boxShadow:
            "0 30px 70px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05) inset, 0 0 0 1px rgba(255,255,255,0.02) inset",
          animation: "rise 0.22s cubic-bezier(0.16,1,0.3,1) both",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* subtle top glow accent */}
        <div
          style={{
            position: "absolute", top: "-120px", left: "50%",
            transform: "translateX(-50%)",
            width: "320px", height: "200px",
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--color-home-accent) 18%, transparent), transparent 75%)",
            pointerEvents: "none",
          }}
        />

        {/* close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "var(--color-void)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            width: "30px", height: "30px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-ink-faint)",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseOver={e => {
            e.currentTarget.style.color = "var(--color-ink)";
            e.currentTarget.style.borderColor = "var(--color-home-accent)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = "var(--color-ink-faint)";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        >
          <X size={14} strokeWidth={2.25} />
        </button>

        {sent ? (
          <div style={{ textAlign: "center", padding: "26px 0 10px" }}>
            <div
              style={{
                width: "52px", height: "52px", borderRadius: "14px",
                margin: "0 auto 16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "color-mix(in srgb, var(--color-home-accent) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-home-accent) 25%, transparent)",
              }}
            >
              <PartyPopper size={24} strokeWidth={2} color="var(--color-home-accent)" />
            </div>
            <h3 style={{
              fontFamily: "var(--font-display)", fontSize: "1.15rem",
              fontWeight: 700, color: "var(--color-ink)", marginBottom: "8px",
              letterSpacing: "-0.01em",
            }}>Thanks for the feedback!</h3>
            <p style={{
              fontSize: "13px", color: "var(--color-ink-muted)", lineHeight: 1.7,
              maxWidth: "320px", margin: "0 auto",
            }}>We read every submission and use it to shape what gets built next.</p>
            <button
              onClick={onClose}
              style={{
                marginTop: "22px", padding: "10px 24px", borderRadius: "9px",
                background:
                  "linear-gradient(180deg, var(--color-home-accent-hover), var(--color-home-accent))",
                color: "#fff",
                fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer",
                boxShadow: "0 8px 20px color-mix(in srgb, var(--color-home-accent) 35%, transparent)",
              }}
            >Close</button>
          </div>
        ) : (
          <>
            {/* header */}
            <div style={{ marginBottom: "24px", position: "relative" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontFamily: "var(--font-mono)", fontSize: "10px",
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "var(--color-home-accent)",
              }}>
                <MessageSquareText size={12} strokeWidth={2.25} />
                Share your thoughts
              </span>
              <h2 style={{
                marginTop: "8px",
                fontFamily: "var(--font-display)", fontSize: "1.3rem",
                fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.02em",
              }}>Got an idea or a bug?</h2>
              <p style={{
                marginTop: "7px", fontSize: "13px",
                color: "var(--color-ink-muted)", lineHeight: 1.65,
              }}>
                Tell us what you think — a missing subject, a broken feature,
                or anything that would make exam prep easier.
              </p>
            </div>

            {/* type selector */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Type</label>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px", marginTop: "8px",
              }}>
                {TYPE_OPTIONS.map(opt => {
                  const active = type === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setType(opt.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 12px", borderRadius: "9px", cursor: "pointer",
                        fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 500,
                        border: `1px solid ${active ? "var(--color-home-accent)" : "var(--color-border)"}`,
                        background: active
                          ? "linear-gradient(180deg, color-mix(in srgb, var(--color-home-accent) 16%, transparent), color-mix(in srgb, var(--color-home-accent) 6%, transparent))"
                          : "var(--color-void)",
                        color: active ? "var(--color-home-accent)" : "var(--color-ink-faint)",
                        boxShadow: active ? "0 0 0 1px color-mix(in srgb, var(--color-home-accent) 15%, transparent) inset" : "none",
                        transition: "all 0.15s",
                        textAlign: "left",
                      }}
                    >
                      <opt.Icon size={14} strokeWidth={2.25} style={{ flexShrink: 0 }} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* name */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Name <span style={{ color: "var(--color-ink-faint)", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
                onFocus={e => {
                  e.target.style.borderColor = "var(--color-home-accent)";
                  e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--color-home-accent) 14%, transparent)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--color-border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* message */}
            <div style={{ marginBottom: "22px" }}>
              <label style={labelStyle}>Message <span style={{ color: "var(--color-home-accent)" }}>*</span></label>
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
                onFocus={e => {
                  e.target.style.borderColor = "var(--color-home-accent)";
                  e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--color-home-accent) 14%, transparent)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--color-border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              onClick={submit}
              disabled={!message.trim() || sending}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px",
                background: message.trim()
                  ? "linear-gradient(180deg, var(--color-home-accent-hover), var(--color-home-accent))"
                  : "var(--color-panel-raised)",
                color: message.trim() ? "#fff" : "var(--color-ink-faint)",
                fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600,
                border: "none", cursor: message.trim() ? "pointer" : "not-allowed",
                transition: "all 0.15s",
                opacity: sending ? 0.7 : 1,
                boxShadow: message.trim() ? "0 10px 24px color-mix(in srgb, var(--color-home-accent) 30%, transparent)" : "none",
                letterSpacing: "-0.005em",
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
  padding: "10px 14px", borderRadius: "9px",
  border: "1px solid var(--color-border)",
  background: "var(--color-void)",
  color: "var(--color-ink)",
  fontFamily: "var(--font-mono)", fontSize: "13px",
  outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
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
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
              style={{
                background: "var(--color-home-card, #FFFCF8)",
                border: "1px solid var(--color-home-border, #DDD6C9)",
              }}
            >
              <svg
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Stacked exam papers — minimal, geometric */}
                <rect x="6" y="4" width="13" height="16" rx="1.5" fill="var(--color-home-text, #171717)" opacity="0.12" />
                <rect x="5" y="3.5" width="13" height="16" rx="1.5" stroke="var(--color-home-text, #171717)" strokeWidth="1.5" fill="none" />
                <path d="M8.5 8h7" stroke="var(--color-home-text, #171717)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8.5 11.25h7" stroke="var(--color-home-text, #171717)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8.5 14.5h4" stroke="var(--color-home-accent, #C4573D)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="16.5" cy="16.5" r="1" fill="var(--color-home-accent, #C4573D)" />
              </svg>
            </span>
            <span className="font-display text-[15px] tracking-tight">
              <span className="font-semibold text-ink">GTU PYQ</span>{" "}
              <span className="font-normal text-ink-muted">Analyzer</span>
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
              <MessageSquareText size={13} strokeWidth={2} />
              Feedback
            </button>

            <a
              href="https://gtu-ranker-backend.onrender.com/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-signal-violet/40 hover:text-ink sm:flex"
            >
              <FileText size={13} strokeWidth={2} />
              API Docs
            </a>
          </nav>
        </div>
      </header>

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </>
  );
}