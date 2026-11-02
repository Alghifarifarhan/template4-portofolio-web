"use client";

import React, { useEffect } from "react";
import { useSite } from "@/context/SiteContext";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { siteData } = useSite();

  useEffect(() => {
    const mode = siteData.themeMode || "dark";
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [siteData.themeMode]);

  return <>{children}</>;
}
