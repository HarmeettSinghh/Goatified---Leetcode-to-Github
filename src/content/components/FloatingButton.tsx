interface FloatingButtonProps {
  loading: boolean;
  onClick: () => void;
  onDismiss: () => void;
}

export default function FloatingButton({ loading, onClick, onDismiss }: FloatingButtonProps) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[999999] flex items-center gap-2 animate-slide-up"
      style={{ fontSynthesis: 'none' }}
    >
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="h-8 w-8 flex items-center justify-center rounded-full bg-neutral-800/90 text-neutral-300 hover:text-white hover:bg-neutral-700 shadow-md transition-colors text-sm"
      >
        ✕
      </button>
      <button
        onClick={onClick}
        disabled={loading}
        className="group flex items-center gap-2 rounded-full bg-gradient-to-br from-goat-500 to-goat-700 px-5 py-3 text-white font-semibold shadow-goat hover:scale-[1.03] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-wait"
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        ) : (
          <span className="text-lg leading-none">📤</span>
        )}
        <span>{loading ? 'Reading submission…' : 'Save to GitHub'}</span>
      </button>
    </div>
  );
}
