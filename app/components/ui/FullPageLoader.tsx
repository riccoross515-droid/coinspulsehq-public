"use client";

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center w-full min-h-[60vh] animate-in fade-in duration-500">
      <div className="relative flex flex-col items-center">
        {/* Animated Logo */}
        <div className="relative w-32 h-32">
          {/* Pulsing glow effect */}
          <div className="absolute inset-0 bg-[#c99400]/20 dark:bg-[#c99400]/10 rounded-full blur-2xl animate-pulse-glow" />
          
          {/* Logo container with rotation */}
          <div className="relative w-full h-full animate-spin-slow">
            {/* Back circle */}
            <div className="absolute top-4 right-2 w-16 h-16 rounded-full border-[6px] border-[#c99400]/40 dark:border-[#c99400]/30" />
            
            {/* Front circle with "1" */}
            <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-[6px] border-[#c99400] dark:border-[#c99400] bg-background flex items-center justify-center shadow-lg shadow-[#c99400]/20">
              <span className="text-4xl font-black text-[#c99400] dark:text-[#c99400] animate-pulse-number">
                1
              </span>
            </div>
          </div>

          {/* Orbiting particles (mining effect) */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#c99400] rounded-full animate-orbit-1" />
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#c99400] rounded-full animate-orbit-2" />
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#c99400] rounded-full animate-orbit-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
