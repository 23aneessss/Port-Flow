/* ═══════════════════════════════════════════════════
   StatusMessage – Feedback utilisateur
   ─────────────────────────────────────────────────
   • 3 états : error, success, warning
   • Messages sécurisés (non révélateurs)
   • Animations d'apparition
   ═══════════════════════════════════════════════════ */

interface StatusMessageProps {
  type: "error" | "success" | "warning";
  message: string;
}

const config = {
  error: {
    bg: "bg-error/10",
    border: "border-error/20",
    text: "text-error",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  success: {
    bg: "bg-success/10",
    border: "border-success/20",
    text: "text-success",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20",
    text: "text-warning",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

export default function StatusMessage({ type, message }: StatusMessageProps) {
  const c = config[type];
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border ${c.bg} ${c.border} p-4 animate-in fade-in slide-in-from-top-2 duration-300`}
      role="alert"
    >
      <span className={c.text}>{c.icon}</span>
      <p className={`text-sm font-body ${c.text}`}>{message}</p>
    </div>
  );
}
