import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

const LINES = [
  "> INITIALIZING PROFILE.SYS...",
  "> LOADING SAI_PRANEET_CHINTHALA...",
  "> WELCOME TO MY PROFILE",
];

const SEEN_KEY = "sp_boot_seen";

// How long the overlay covers the page. This is pure cost: every millisecond
// here is a millisecond a recruiter spends looking at a black screen instead
// of the work. Kept short deliberately.
const HOLD_MS = 900;

export default function BootSequence() {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Decide on the FIRST render whether to show anything at all, so we never
  // flash the overlay and then rip it away.
  const [visible, setVisible] = useState(() => {
    if (prefersReducedMotion) return false;
    try {
      return window.sessionStorage.getItem(SEEN_KEY) === null;
    } catch {
      // Private mode / blocked storage — degrade to showing it.
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return;
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage unavailable — the timer below still dismisses the overlay */
    }
    const timer = setTimeout(() => setVisible(false), HOLD_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg pointer-events-none"
        >
          <div className="font-mono text-sm md:text-base text-accent text-left space-y-2">
            {LINES.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.18, duration: 0.2 }}
                className={i === LINES.length - 1 ? "glow-text" : "text-text-dim"}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
