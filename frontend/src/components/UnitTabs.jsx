export default function UnitTabs({ units, activeUnit, onSelect }) {
  if (!units || units.length === 0) return null;

  return (
    <div className="scrollbar-none -mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {units.map((unitKey) => {
        const isActive = unitKey === activeUnit;
        return (
          <button
            key={unitKey}
            onClick={() => onSelect(unitKey)}
            aria-pressed={isActive}
            className={`relative shrink-0 rounded-lg border px-4 py-2.5 font-mono text-sm font-medium transition-all duration-200 ${
              isActive
                ? "border-signal-violet/60 bg-signal-violet/10 text-signal-violet-soft"
                : "border-border bg-panel/50 text-ink-muted hover:border-border-soft hover:text-ink"
            }`}
          >
            {isActive && (
              <span className="absolute -top-px left-1/2 h-px w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-signal-violet-soft to-transparent" />
            )}
            U{unitKey}
          </button>
        );
      })}
    </div>
  );
}
