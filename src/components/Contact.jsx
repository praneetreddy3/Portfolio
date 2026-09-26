import { useState } from "react";
import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { profile } from "../data/content";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  // No backend here, so "submitting" just opens the visitor's email client
  // with everything pre-filled — simplest way to make a real contact form
  // work on a static site with zero server code.
  function handleSubmit(e) {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact from ${form.name}`);
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name} (${form.email})`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  }

  return (
    <section id="contact" className="py-28 border-t border-border">
      <div className="section-container grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            LET'S <span className="glow-text">CONNECT</span>
          </h2>
          <p className="text-text-dim max-w-md mb-8">
            Always happy to talk about data, AI, or interesting problems.
            {" "}{profile.status}.
          </p>

          <div className="space-y-4">
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-3 text-sm font-mono text-text-dim hover:text-accent transition-colors"
            >
              <FiMail /> {profile.email}
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-sm font-mono text-text-dim hover:text-accent transition-colors"
            >
              <FiGithub /> github.com/praneetreddy3
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-sm font-mono text-text-dim hover:text-accent transition-colors"
            >
              <FiLinkedin /> linkedin.com/in/sai-praneet-reddy-chinthala
            </a>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="contact-name"
              className="block text-xs font-mono tracking-wider text-text-dim mb-2"
            >
              NAME
            </label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full rounded border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/50"
            />
          </div>
          <div>
            <label
              htmlFor="contact-email"
              className="block text-xs font-mono tracking-wider text-text-dim mb-2"
            >
              EMAIL
            </label>
            <input
              id="contact-email"
              name="email"
              autoComplete="email"
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full rounded border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/50"
            />
          </div>
          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs font-mono tracking-wider text-text-dim mb-2"
            >
              MESSAGE
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="What's on your mind?"
              className="w-full rounded border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-accent py-3.5 text-sm font-mono font-bold tracking-wider text-bg hover:opacity-90 transition-opacity"
          >
            Send message
          </button>
        </motion.form>
      </div>

      <p className="section-container mt-20 pt-8 border-t border-border text-xs font-mono text-text-dim flex flex-col md:flex-row md:justify-between gap-2">
        <span>© 2026 {profile.name} — Built in Fairfax, VA.</span>
        <span>Built with React + Tailwind + Framer Motion.</span>
      </p>
    </section>
  );
}
