"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  side?: "left" | "right";
  labelledBy?: string;
  children: React.ReactNode;
}

export function SlideOver({
  isOpen,
  onClose,
  side = "right",
  labelledBy,
  children,
}: SlideOverProps) {
  useLockBodyScroll(isOpen);
  useEscapeKey(onClose, isOpen);

  // Portal to <body>: a SlideOver can be triggered from anywhere (e.g. the
  // header's search icon), and an ancestor with backdrop-blur/transform
  // (the header itself does) creates a new containing block for
  // `position: fixed` descendants, clipping the overlay to that ancestor's
  // box instead of the viewport. Rendering at the body root sidesteps that
  // regardless of where the trigger lives. Mount-gated so server and the
  // client's first render both output nothing, avoiding a hydration mismatch.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
        >
          <motion.div
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className={`absolute top-0 flex h-full w-[85vw] max-w-sm flex-col bg-cream shadow-2xl ${
              side === "right" ? "right-0" : "left-0"
            }`}
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 340 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
