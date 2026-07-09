import { useCallback, useMemo, useState } from "react";

import Toast from "../components/common/Toast";
import ToastContext from "./ToastContext";

const createToastId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((toastId) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    );
  }, []);

  const showToast = useCallback((message, options = {}) => {
    if (!message) {
      return;
    }

    const toastType = options.type || "info";

    const nextToast = {
      id: createToastId(),
      message,
      type: toastType,
      duration: options.duration || 2600,
    };

    setToasts((currentToasts) => {
      const alreadyVisible = currentToasts.some((toast) => {
        return toast.message === message && toast.type === toastType;
      });

      if (alreadyVisible) {
        return currentToasts;
      }

      return [...currentToasts.slice(-3), nextToast];
    });
  }, []);

  const toast = useMemo(
    () => ({
      success: (message, options) =>
        showToast(message, { ...options, type: "success" }),
      error: (message, options) =>
        showToast(message, { ...options, type: "error" }),
      info: (message, options) =>
        showToast(message, { ...options, type: "info" }),
      remove: removeToast,
    }),
    [removeToast, showToast],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toast toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
