import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { profile } from "../data/content";

export default function Contact() {
  return (
    <section id="contact" className="py-28 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="section-container max-w-2xl text-center"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          LET'S <span className="glow-text">CONNECT</span>
        </h2>
        <p className="text-text-dim mb-10">
          Always happy to talk about data, AI, or interesting problems.
          {" "}{profile.status}.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-3 rounded border border-border bg-surface px-6 py-3 text-sm font-mono text-text hover:border-accent hover:text-accent transition-colors"
          >
            <FiMail /> {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded border border-border bg-surface px-6 py-3 text-sm font-mono text-text hover:border-accent hover:text-accent transition-colors"
          >
            <FiGithub /> github.com/praneetreddy3
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded border border-border bg-surface px-6 py-3 text-sm font-mono text-text hover:border-accent hover:text-accent transition-colors"
          >
            <FiLinkedin /> LinkedIn
          </a>
        </div>
      </motion.div>

      <p className="section-container mt-20 pt-8 border-t border-border text-xs font-mono text-text-dim flex flex-col md:flex-row md:justify-between gap-2">
        <span>© 2026 {profile.name}</span>
        <span>Built with React + Tailwind + Framer Motion.</span>
      </p>
    </section>
  );
}
