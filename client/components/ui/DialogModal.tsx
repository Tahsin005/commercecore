"use client";

import React, { useEffect, useRef } from "react";

interface DialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function DialogModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = "max-w-md",
}: DialogModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }

        if (e.key === "Tab" && dialogRef.current) {
          const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length === 0) return;

          const firstElement = focusables[0];
          const lastElement = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      // Focus first element or dialog container
      setTimeout(() => {
        if (dialogRef.current) {
          const firstInput = dialogRef.current.querySelector<HTMLElement>("input, button, select, textarea");
          if (firstInput) {
            firstInput.focus();
          } else {
            dialogRef.current.focus();
          }
        }
      }, 50);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClass} bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-4 outline-none`}
      >
        {children}
      </div>
    </div>
  );
}
