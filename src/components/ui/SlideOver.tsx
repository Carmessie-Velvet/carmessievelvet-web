"use client";

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

  return (
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
    </AnimatePresence>
  );
}
