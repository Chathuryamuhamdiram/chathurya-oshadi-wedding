"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export function useAutoRefresh(intervalMs: number = 45000) {
  const router = useRouter();
  const [isRefreshing, startRefreshTransition] = useTransition();

  // Refresh on window focus
  useEffect(() => {
    const onFocus = () => {
      startRefreshTransition(() => {
        router.refresh();
      });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  // Periodic background refresh
  useEffect(() => {
    if (intervalMs <= 0) return;
    const interval = setInterval(() => {
      startRefreshTransition(() => {
        router.refresh();
      });
    }, intervalMs);
    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return { isRefreshing };
}
