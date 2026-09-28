import { motion } from "framer-motion";
import {
  experience,
  education,
  certifications,
  research,
  publication,
} from "../data/content";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Experience() {
  return (
    <section id="experience" className="py-28 border-t border-border">
      <div className="section-container">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-14">
          <span className="glow-text">EXPERIENCE</span>
        </h2>

        <div className="relative border-l border-border pl-8 space-y-6">
          {experience.map((job, i) => (
            <motion.div
              key={job.role + job.dates}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded border border-border bg-surface p-6"
            >
              <span className="absolute -left-[2.55rem] top-6 w-3 h-3 rounded-full bg-accent glow-border" />

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-text">{job.role}</h3>
                  <p className="text-sm text-accent font-mono">{job.org}</p>
                </div>
                <div className="text-xs font-mono text-text-dim md:text-right shrink-0">
                  <p>{job.dates}</p>
                  <p>{job.location}</p>
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {job.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex gap-2 text-sm text-text-dim"
                  >
                    <span className="text-accent font-mono shrink-0">&gt;</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-mono text-xs tracking-wider text-text-dim uppercase mb-4">
              Research
            </h3>
            <div className="rounded border border-border bg-surface p-5">
              <p className="font-mono text-xs text-text-dim">{research.dates}</p>
              <p className="font-bold text-text mt-1">{research.title}</p>
              <p className="text-sm text-text-dim mt-2">{research.description}</p>
            </div>
            <div className="rounded border border-border bg-surface p-5 mt-4">
              <p className="text-xs text-accent-2 font-mono mb-1">
                Publication · {publication.date}
              </p>
              <p className="text-sm text-text">{publication.title}</p>
              <p className="text-xs text-text-dim mt-1">{publication.venue}</p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-mono text-xs tracking-wider text-text-dim uppercase mb-4">
              Education
            </h3>
            <div className="space-y-4">
              {education.map((e) => (
                <div key={e.school} className="rounded border border-border bg-surface p-5">
                  <p className="font-mono text-xs text-text-dim">{e.dates}</p>
                  <p className="font-bold text-text mt-1">{e.school}</p>
                  <p className="text-sm text-text-dim">{e.degree}</p>
                  {e.detail && (
                    <p className="text-xs text-accent font-mono mt-1">{e.detail}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-mono text-xs tracking-wider text-text-dim uppercase mb-4">
              Certifications
            </h3>
            <div className="space-y-4">
              {certifications.map((c) => (
                <div key={c.name} className="rounded border border-border bg-surface p-5">
                  <p className="font-mono text-xs text-text-dim">{c.date}</p>
                  <p className="font-bold text-text mt-1 text-sm">{c.name}</p>
                  <p className="text-sm text-text-dim">{c.issuer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
