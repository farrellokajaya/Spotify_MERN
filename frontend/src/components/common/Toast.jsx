import { useEffect } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

function ToastItem({ toast, onClose }) {
  const Icon = toastIcons[toast.type] || Info;

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      onClose(toast.id);
    }, toast.duration);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [onClose, toast.duration, toast.id]);

  return (
    <div
      className={`sf-toast sf-toast-${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <Icon size={18} aria-hidden="true" />

      <p>{toast.message}</p>

      <button
        type="button"
        className="sf-toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

function Toast({ toasts, onClose }) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="sf-toast-stack" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

export default Toast;