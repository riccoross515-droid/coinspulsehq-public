"use client";

import { useEffect } from "react";

export function TawkTo() {
  useEffect(() => {
    // Load Tawk.to script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/6964c5127304bb197d094765/1jeoq3kuo";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
