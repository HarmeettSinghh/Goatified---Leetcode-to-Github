export interface ToastItem {
  id: string;
  variant: 'success' | 'error' | 'info';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const VARIANT_STYLES: Record<ToastItem['variant'], { bg: string; icon: string }> = {
  success: { bg: 'from-goat-600 to-goat-800', icon: '✅' },
  error: { bg: 'from-rose-600 to-rose-800', icon: '⚠️' },
  info: { bg: 'from-sky-600 to-sky-800', icon: 'ℹ️' }
};

export default function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[999999] flex flex-col gap-3 w-[340px]">
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            className={`animate-toast-in rounded-xl bg-gradient-to-br ${style.bg} p-4 text-white shadow-2xl backdrop-blur`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg leading-none">{style.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{toast.title}</p>
                <p className="text-xs text-white/85 mt-0.5">{toast.message}</p>
                {toast.actionLabel && toast.onAction && (
                  <button
                    onClick={toast.onAction}
                    className="mt-2 text-xs font-semibold underline underline-offset-2 hover:text-white"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
