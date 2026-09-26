import { motion } from "framer-motion";
import { FiGithub } from "react-icons/fi";
import { projects, earlierWork } from "../data/content";
import TiltCard from "./TiltCard";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function FlowDiagram({ steps = [], accentText }) {
  if (!steps.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] leading-tight text-text-dim border border-border bg-bg/70 rounded px-2 py-1 text-center whitespace-nowrap">
            {step}
          </span>
          {i < steps.length - 1 && (
            <span className={`font-mono text-xs ${accentText}`}>→</span>
          )}
        </div>
      ))}
    </div>
  );
}

function MetricCallouts({ metrics = [], accentText }) {
  if (!metrics.length) return null;
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
      {metrics.map((m) => (
        <div key={m.label}>
          <p className={`text-2xl font-extrabold font-display leading-none ${accentText}`}>
            {m.value}
          </p>
          <p className="mt-1 text-[10px] font-mono text-text-dim uppercase tracking-wider">
            {m.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ p, index }) {
  const isAlt = index === 0;
  const accentText = isAlt ? "text-accent-2" : "text-accent";
  const accentBorder = isAlt ? "border-accent-2/50" : "border-accent/50";

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    >
      <TiltCard
        intensity={6}
        className="group rounded border border-border bg-surface overflow-hidden hover:border-accent/60 transition-colors duration-300 flex flex-col h-full"
      >
        {/* Architecture / data-flow diagram */}
        <div className="relative px-4 pt-9 pb-4 bg-surface-2 border-b border-border">
          <span
            className={`absolute top-3 left-3 text-xs font-mono px-2 py-1 rounded border bg-bg/60 backdrop-blur-sm ${accentBorder} ${accentText}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <FlowDiagram steps={p.flow} accentText={accentText} />
        </div>

        <div className="p-5 flex flex-col flex-1">
          <p className="font-mono text-xs text-text-dim mb-1">{p.dates}</p>
          <h3 className="font-bold text-lg text-text mb-2 group-hover:text-accent transition-colors">
            {p.title}
          </h3>
          <p className="text-sm text-text-dim leading-relaxed mb-4">
            {p.description}
          </p>

          <MetricCallouts metrics={p.metrics} accentText={accentText} />

          <div className="flex flex-wrap gap-2 mb-5">
            {p.tags.map((t) => (
              <span
                key={t}
                className="text-xs font-mono rounded border border-border bg-surface-2 px-2 py-1 text-text-dim"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            {p.github ? (
              <a
                href={p.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded border border-accent/50 py-2.5 text-xs font-mono tracking-wider text-accent hover:bg-accent/10 transition-colors"
              >
                <FiGithub size={14} /> [ VIEW CODE ON GITHUB ↗ ]
              </a>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 w-full rounded border border-border py-2.5 text-xs font-mono tracking-wider text-text-dim">
                [ CODE PRIVATE ]
              </span>
            )}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="py-28 border-t border-border">
      <div className="section-container">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          WHAT I'VE <span className="glow-text">BUILT</span>
        </h2>
        <p className="text-text-dim max-w-xl mb-14">
          A mix of research, capstone, and independent projects spanning RAG
          systems, distributed ML pipelines, and applied statistics.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <ProjectCard p={p} index={i} key={p.title} />
          ))}
        </div>

        {/* Earlier work: real projects, but older and less representative of what
            I do now. A compact list keeps them available without letting them
            compete with the five above for attention. */}
        <div className="mt-14 border-t border-border pt-8">
          <h3 className="font-mono text-xs tracking-wider text-text-dim uppercase mb-5">
            Earlier work
          </h3>
          <ul className="space-y-3">
            {earlierWork.map((p) => (
              <li
                key={p.title}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm"
              >
                <span className="font-mono text-xs text-text-dim shrink-0">{p.dates}</span>
                {p.github ? (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text hover:text-accent transition-colors"
                  >
                    {p.title} ↗
                  </a>
                ) : (
                  <span className="text-text">{p.title}</span>
                )}
                <span className="text-text-dim">— {p.metric}</span>
                <span className="font-mono text-xs text-text-dim">{p.tags.join(" · ")}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://github.com/praneetreddy3"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded border border-border px-6 py-3 text-sm font-mono tracking-wider text-text hover:border-accent/60 transition-colors"
          >
            SEE ALL REPOS ↗
          </a>
        </div>
      </div>
    </section>
  );
}
