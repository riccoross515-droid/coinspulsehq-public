"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  className?: string; // For additional styling on content container
}

export function Modal({ isOpen, onClose, children, title, showHeader = true, className = "" }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Content */}
      <div 
        className={`relative bg-background border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
        role="dialog"
      >
        {/* Floating Close Button (when showHeader is false) */}
        {!showHeader && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
            >
                <X className="h-5 w-5" />
            </button>
        )}

        {/* Header (Optional) */}
        {(mounted && showHeader) && (
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                <div className="ml-auto">
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}

        {/* Body */}
        <div className="p-0">
            {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
