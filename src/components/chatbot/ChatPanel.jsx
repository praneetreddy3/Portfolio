import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

const variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const reducedVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Cycles Tab / Shift+Tab within the panel while it is open. Focus RETURN to
// the toggle button (on close) is owned by ChatWidget, not this hook.
function useFocusTrap(panelRef, isOpen) {
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    function handleKeyDown(e) {
      if (e.key !== "Tab") return;
      const focusable = panel.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [panelRef, isOpen]);
}

export default function ChatPanel({ isOpen, isLoading, children }) {
  const panelRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  useFocusTrap(panelRef, isOpen);

  const activeVariants = prefersReducedMotion ? reducedVariants : variants;

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label="Chat with Sai Praneet"
      aria-modal="true"
      aria-busy={isLoading}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={activeVariants}
      transition={{ duration: 0.1, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
      className="chatbot-panel"
    >
      {children}
    </motion.div>
  );
}
