import { XCircle } from "lucide-react";

function ErrorState({ message, action, className = "" }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`sf-alert sf-alert-error sf-state-alert ${className}`.trim()} role="alert">
      <XCircle size={18} aria-hidden="true" />
      <span>{message}</span>
      {action ? <div className="sf-state-alert-action">{action}</div> : null}
    </div>
  );
}

export default ErrorState;
