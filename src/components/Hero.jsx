import { motion } from "framer-motion";
import { profile } from "../data/content";
import BootSequence from "./BootSequence";
import HeroCanvas from "./HeroCanvas";

// The hero backdrop used to be a Three.js scene, which cost ~235 KB gzipped
// — more than two thirds of the site's total JavaScript, for decoration.
// HeroCanvas draws the same composition with Canvas 2D and no dependencies.
// It handles reduced-motion and mobile scaling internally, so there is no
// capability check to do here any more.

// Four verifiable numbers, each traceable to a project in content.js.
// A joke metric sitting beside a real one ("∞ Curiosity level" next to
// "0.93 ROC-AUC") undercuts the real one, so there isn't one here.
const stats = [
  { value: "950K+", label: "Records processed" },
  { value: "0.93", label: "Best ROC-AUC" },
  { value: "955+", label: "Docs indexed" },
  { value: "3.97", label: "Graduate GPA" },
];

const menu = [
  { label: "PROJECTS", href: "#projects" },
  { label: "RESEARCH", href: "#experience" },
  { label: "RESUME", href: "/resume.pdf", external: true },
  { label: "ABOUT", href: "#about" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
    >
      <BootSequence />

      {/* Tron-style 3D grid + wireframe centerpiece — skipped entirely
          (not even downloaded) for reduced-motion or low-end devices. */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <HeroCanvas />
      </div>

      {/* ambient drifting glow blobs — layered above the 3D scene for extra depth */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[110px] animate-drift" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-accent-2/10 blur-[100px] animate-drift-slow" />
      </div>

      <div className="section-container py-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-mono text-sm md:text-base tracking-wider text-accent-2 mb-4"
        >
          <span className="text-accent">&gt;</span> Welcome, I'm
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="text-4xl xs:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] break-words"
        >
          <span className="text-text">SAI PRANEET</span>
          <br />
          <span className="glow-text hover-glitch">CHINTHALA</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.19 }}
          className="mt-6 text-xl md:text-2xl font-mono text-text-dim"
        >
          <span className="text-accent-2">&gt;</span> AI/ML &amp; Data Engineer
          <span className="glow-text animate-blink ml-1">_</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26 }}
          className="mt-5 max-w-2xl text-text-dim"
        >
          {profile.tagline}. Currently building fairness-aware ML systems and
          shipping RAG pipelines from research to production.
        </motion.p>

        <motion.nav
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.33 }}
          className="mt-9 flex flex-wrap gap-3"
        >
          {menu.map((item) => (
            <motion.a
              key={item.label}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="inline-flex items-center gap-2 rounded border border-accent/40 bg-surface/80 backdrop-blur-sm px-5 py-2.5 text-xs font-mono tracking-wider text-accent glow-border hover:bg-accent/10 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {item.label}
            </motion.a>
          ))}
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mt-10 grid grid-cols-2 md:grid-cols-4 rounded border border-border bg-surface/80 backdrop-blur-sm divide-x divide-y md:divide-y-0 divide-border"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -3 }}
              className="px-6 py-6 text-center md:text-left"
            >
              <p className="text-3xl font-bold glow-text font-display">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-mono text-text-dim">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
