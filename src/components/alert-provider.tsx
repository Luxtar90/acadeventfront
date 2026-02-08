"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type AlertVariant = "success" | "error" | "info" | "warning";

type AlertItem = {
  id: string;
  title?: string;
  message: string;
  variant: AlertVariant;
  duration: number;
};

type AlertInput = {
  title?: string;
  message: string;
  variant?: AlertVariant;
  duration?: number;
};

type AlertContextValue = {
  notify: (input: AlertInput) => void;
  dismiss: (id: string) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

const variantStyles: Record<AlertVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

const variantBadge: Record<AlertVariant, string> = {
  success: "Éxito",
  error: "Error",
  info: "Info",
  warning: "Aviso",
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }, []);

  const notify = useCallback(
    (input: AlertInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const alert: AlertItem = {
        id,
        title: input.title,
        message: input.message,
        variant: input.variant ?? "info",
        duration: input.duration ?? 4200,
      };
      setAlerts((current) => [alert, ...current]);
      if (alert.duration > 0) {
        setTimeout(() => dismiss(id), alert.duration);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="fixed right-6 top-6 z-50 flex w-full max-w-sm flex-col gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl border px-4 py-3 shadow-lg ${variantStyles[alert.variant]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wide">
                  {variantBadge[alert.variant]}
                </div>
                {alert.title ? (
                  <div className="text-sm font-semibold">{alert.title}</div>
                ) : null}
                <div className="text-sm">{alert.message}</div>
              </div>
              <button
                onClick={() => dismiss(alert.id)}
                className="rounded-full border border-transparent px-2 py-1 text-xs text-current hover:border-current/20"
              >
                Cerrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return ctx;
}
