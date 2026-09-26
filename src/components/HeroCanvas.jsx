import { useEffect, useRef } from "react";
import { usePrefersReducedMotion, useIsMobile } from "../hooks/useMediaQuery";

// Matches the palette tokens in index.css so this stays in sync with the theme.
const CYAN = "0, 229, 255";
const PURPLE = "168, 85, 247";

/**
 * Canvas 2D stand-in for the Three.js hero: a receding Tron grid, drifting
 * particles and an ambient horizon glow.
 *
 * The WebGL version cost ~235 KB gzipped (three + @react-three/fiber), which
 * was over two thirds of the site's total JavaScript — for a decorative
 * background. This draws the same idea with zero dependencies.
 *
 * Perspective is done by hand rather than with a matrix: a point at depth z
 * projects to screen with scale = focal / (focal + z), which is all a grid
 * floor and a particle field actually need.
 */
export default function HeroCanvas() {
  const canvasRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Cap DPR: at 3x on a phone this is 9x the fill rate for no visible gain.
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
    let width = 0;
    let height = 0;
    let horizon = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      horizon = height * 0.52;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const PARTICLE_COUNT = isMobile ? 34 : 70;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random() * 0.55,
      z: Math.random() * 0.8 + 0.2,
      r: Math.random() * 1.4 + 0.5,
    }));

    // Scroll offset of the grid, in "rows". Fractional — the rows nearest the
    // viewer move fastest, which is what sells the depth.
    let scroll = 0;
    let raf = 0;
    let last = performance.now();
    let running = true;

    const GRID_ROWS = isMobile ? 13 : 18;
    const GRID_COLS = isMobile ? 14 : 22;
    const FOCAL = 0.42;

    /** Depth 0 (horizon) .. 1 (nearest) -> y on screen, non-linear. */
    function rowY(t) {
      const scale = FOCAL / (FOCAL + (1 - t));
      return horizon + (height - horizon) * scale;
    }

    function drawGrid() {
      ctx.lineWidth = 1;

      // Horizontal rows receding toward the horizon.
      for (let i = 0; i < GRID_ROWS; i++) {
        const t = ((i + scroll) % GRID_ROWS) / GRID_ROWS;
        const y = rowY(t);
        // Fade out near the horizon so the grid dissolves instead of stopping.
        const alpha = Math.pow(t, 1.6) * 0.42;
        if (alpha < 0.004) continue;
        ctx.strokeStyle = `rgba(${CYAN}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Verticals converging on the vanishing point.
      const vpx = width / 2;
      for (let i = 0; i <= GRID_COLS; i++) {
        const spread = (i / GRID_COLS - 0.5) * 2; // -1 .. 1
        const xNear = vpx + spread * width * 1.5;
        ctx.strokeStyle = `rgba(${CYAN}, 0.13)`;
        ctx.beginPath();
        ctx.moveTo(vpx, horizon);
        ctx.lineTo(xNear, height);
        ctx.stroke();
      }
    }

    function drawGlow() {
      const g = ctx.createRadialGradient(
        width / 2, horizon, 0,
        width / 2, horizon, Math.max(width, height) * 0.55
      );
      g.addColorStop(0, `rgba(${CYAN}, 0.13)`);
      g.addColorStop(0.45, `rgba(${PURPLE}, 0.05)`);
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }

    function drawParticles(dt) {
      for (const p of particles) {
        if (running) {
          p.y += dt * 0.004 * p.z;
          if (p.y > 0.58) {
            p.y = 0;
            p.x = Math.random();
          }
        }
        const scale = FOCAL / (FOCAL + (1 - p.z));
        const x = width / 2 + (p.x - 0.5) * width * (0.6 + scale);
        const y = horizon - p.y * horizon * 0.9;
        ctx.fillStyle = `rgba(${PURPLE}, ${0.10 + p.z * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r * (0.6 + p.z), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame(now) {
      const dt = Math.min(now - last, 50); // clamp after a background tab pause
      last = now;
      if (running) scroll += dt * 0.00065 * GRID_ROWS * 0.12;

      ctx.clearRect(0, 0, width, height);
      drawGlow();
      drawGrid();
      drawParticles(dt);

      raf = requestAnimationFrame(frame);
    }

    // A single static frame is the correct output for reduced motion — the
    // composition still reads, nothing moves.
    if (prefersReducedMotion) {
      running = false;
      ctx.clearRect(0, 0, width, height);
      drawGlow();
      drawGrid();
      drawParticles(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    // Don't burn battery animating a tab nobody is looking at.
    function onVisibility() {
      running = document.visibilityState === "visible" && !prefersReducedMotion;
      last = performance.now();
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [prefersReducedMotion, isMobile]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
