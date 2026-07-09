import { Loader2 } from "lucide-react";

function LoadingState({ message = "Memuat data...", className = "" }) {
  return (
    <div className={`sf-empty-panel sf-state-panel sf-loading-state ${className}`.trim()}>
      <Loader2 size={18} className="sf-spin-icon" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export default LoadingState;
