"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useIsDark() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During server-side rendering and first client render, we don't know the theme yet
  // returning false (light mode) as default to avoid hydration mismatches
  if (!mounted) {
    return false;
  }

  return resolvedTheme === "dark";
}
