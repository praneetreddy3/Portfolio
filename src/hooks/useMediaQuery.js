import { useCallback, useState, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query in React state.
 *
 * Implemented with useSyncExternalStore rather than useState + useEffect.
 * matchMedia is exactly what that hook exists for — an external source of
 * truth that changes outside React. The older pattern had to call setState
 * inside the effect to catch changes between render and subscribe, which
 * schedules a second render on every mount and is what React's
 * set-state-in-effect lint rule warns about.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onStoreChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  // Read fresh each time. `matches` is a boolean, so useSyncExternalStore's
  // Object.is comparison keeps this stable and re-renders only on real change.
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  // No window during a server render; assume the query does not match.
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

/**
 * Best-effort low-end device detection, so heavy effects can be skipped on
 * budget hardware. Both signals are Chrome/Android-only and are `undefined`
 * elsewhere — we treat the device as low-end only when the browser explicitly
 * says so, never when the signal is simply missing.
 *
 * Read once in a lazy initialiser rather than in an effect: these values never
 * change for the lifetime of the page, so there is nothing to subscribe to and
 * no reason to trigger a second render.
 *
 * Currently unused — HeroCanvas is cheap enough to run everywhere — but kept
 * as the capability check for the WebGL hero if that is ever restored.
 */
export function useIsLowEndDevice() {
  const [isLowEnd] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const memory = navigator.deviceMemory; // GB, Chrome/Android only
    const cores = navigator.hardwareConcurrency;
    return (
      (typeof memory === "number" && memory <= 4) ||
      (typeof cores === "number" && cores <= 4)
    );
  });
  return isLowEnd;
}
