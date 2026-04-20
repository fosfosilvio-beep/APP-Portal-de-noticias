"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

import { useSettingsStore } from "../store/settingsStore";
import { useEffect } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const fetchSettings = useSettingsStore(state => state.fetchSettings);
  
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
