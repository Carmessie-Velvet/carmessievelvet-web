"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useLockBodyScroll, useEscapeKey } from "@/lib/use-lock-body-scroll";
import { useIsDesktop } from "@/lib/use-media-query";

const EASE = [0.22, 0.8, 0.22, 1] as const;

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * What the panel becomes on desktop: a drawer from the right (cart) or a
   * centered dialog (quick add). On mobile it is always a bottom sheet that
   * the shopper can drag down to dismiss.
   */
  desktop?: "right" | "center";
  labelledBy?: string;
  /** Extra classes for the panel (e.g. a different desktop width). */
  className?: string;
  children: React.ReactNode;
}

/**
 * Bottom sheet on a phone, side drawer or dialog on desktop. Replaces the
 * old right-hand-only drawer for the cart and the quick-add picker: on a
 * phone a sheet from below is where the thumb already is, and it can be
 * dragged down to dismiss.
 *
 * Portaled to <body> (as the old side drawer was), because an ancestor with
 * `backdrop-blur`/`transform` (the header) would otherwise clip a
 * `position: fixed` overlay to its own box.
 */
export function Sheet({
  isOpen,
  onClose,
  desktop = "right",
  labelledBy,
  className = "",
  children,
}: SheetProps) {
  useLockBodyScroll(isOpen);
  useEscapeKey(onClose, isOpen);
  const isDesktop = useIsDesktop();
  const dragControls = useDragControls();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  if (!mounted) return null;

  const panelMotion = !isDesktop
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
    : desktop === "right"
      ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
      : {
          initial: { opacity: 0, y: 18, scale: 0.97 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 12, scale: 0.98 },
        };

  const desktopLayout =
    desktop === "right"
      ? "lg:h-full lg:max-h-none lg:w-[440px] lg:rounded-none"
      : "lg:max-h-[88vh] lg:max-w-xl lg:rounded-none";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-end lg:items-center ${
            desktop === "right" ? "lg:justify-end" : "lg:justify-center lg:p-6"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
        >
          <motion.div
            className="absolute inset-0 bg-ink/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            {...panelMotion}
            transition={{ duration: 0.5, ease: EASE }}
            drag={isDesktop ? false : "y"}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
            className={`relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[20px] bg-paper shadow-[0_-20px_50px_-20px_rgba(42,31,28,0.45)] lg:shadow-[0_30px_70px_-20px_rgba(42,31,28,0.45)] ${desktopLayout} ${className}`}
          >
            {/* Grab handle — only on a phone, and the only part that starts a
                drag, so scrolling the content never moves the sheet. */}
            <div
              className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center lg:hidden"
              onPointerDown={(e) => dragControls.start(e)}
              aria-hidden="true"
            >
              <span className="h-1 w-10 rounded-full bg-sand" />
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
