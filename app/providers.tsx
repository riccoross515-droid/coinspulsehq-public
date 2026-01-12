"use client";

import { Toaster } from "react-hot-toast";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data fresh for 60s
            refetchOnWindowFocus: true, // Refresh when user returns to tab
            refetchOnMount: 'always', // ALWAYS fetch on mount, even with initialData
            retry: 1,
          },
        },
      })
  );

  return (
    <NextThemesProvider {...props}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
             success: {
              duration: 7000,
               style: {
                 background: '#064e3b', // darker green
                 color: '#ffffff', // white text
                 border: '1px solid #059669',
                 padding: '16px',
                 borderRadius: '12px',
                 fontWeight: '500',
                 fontSize: '14px',
               },
               iconTheme: {
                 primary: '#34d399',
                 secondary: '#064e3b',
               },
             },
             error: {
                duration: 10000,
               style: {
                 background: '#450a0a', // darker red
                 color: '#ffffff', // white text
                 border: '1px solid #b91c1c',
                 padding: '16px',
                 borderRadius: '12px',
                 fontWeight: '500',
                 fontSize: '14px',
               },
               iconTheme: {
                 primary: '#f87171',
                 secondary: '#450a0a',
               },
             },
          }}
          containerStyle={{
            top: 20,
          }}
        />
        <style jsx global>{`
          .toast-container > div {
            white-space: nowrap !important;
            max-width: none !important;
            width: auto !important;
          }
          .toast-container > div > div {
            white-space: nowrap !important;
            overflow: visible !important;
          }
    `}</style>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
