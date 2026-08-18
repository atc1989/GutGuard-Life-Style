"use client";

import { useToast } from "@/lib/toast";
import { cx } from "@/lib/cx";

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="gg-toast-viewport" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cx("gg-toast", toast.tone === "error" && "gg-toast--error")}
        >
          <p className="gg-toast__title">{toast.title}</p>
          {toast.body ? <p className="gg-toast__body">{toast.body}</p> : null}
          <button
            type="button"
            className="gg-button gg-button--ghost"
            onClick={() => dismiss(toast.id)}
            style={{ minHeight: 44, justifyContent: "flex-start", padding: 0 }}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
