import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR = "a, button, input, textarea, [role='button']";

// A small circular cursor that follows the pointer, matching the site's
// terminal/glow aesthetic. Only active on devices with a real mouse
// (pointer: fine) — touch devices are left completely untouched, both here
// and via the matching @media (pointer: fine) rule in index.css that hides
// the native cursor. Renders nothing (and attaches no listeners) elsewhere.
export default function CustomCursor() {
  const dotRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(pointer: fine)");
    setEnabled(mql.matches);
    const onChange = (e) => setEnabled(e.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = dotRef.current;
    if (!el) return;

    function handleMove(e) {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      el.classList.add("is-visible");
    }
    function handleOver(e) {
      if (e.target.closest?.(INTERACTIVE_SELECTOR)) {
        el.classList.add("is-hovering");
      }
    }
    function handleOut(e) {
      if (e.target.closest?.(INTERACTIVE_SELECTOR)) {
        el.classList.remove("is-hovering");
      }
    }
    function handleLeave() {
      el.classList.remove("is-visible");
    }

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    document.addEventListener("mouseleave", handleLeave);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={dotRef} className="custom-cursor" aria-hidden="true" />;
}
