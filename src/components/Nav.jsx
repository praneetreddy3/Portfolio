import { useState } from "react";

const links = [
  { label: "ABOUT", href: "#about" },
  { label: "SKILLS", href: "#skills" },
  { label: "PROJECTS", href: "#projects" },
  { label: "EXPERIENCE", href: "#experience" },
  { label: "CONTACT", href: "#contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-bg/80 border-b border-border">
      <nav className="section-container flex items-center justify-between h-16">
        <a
          href="#top"
          className="font-mono font-bold tracking-tight text-accent glow-text"
        >
          &lt;SP/&gt;
        </a>

        <ul className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider text-text-dim">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:text-accent transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/resume.pdf"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1 rounded border border-accent/60 px-4 py-1.5 text-xs font-mono tracking-wider text-accent glow-border hover:bg-accent/10 transition-colors"
        >
          HIRE ME ↗
        </a>

        <button
          className="md:hidden text-text-dim"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </nav>

      {open && (
        <ul className="md:hidden flex flex-col gap-1 px-6 pb-4 text-xs font-mono tracking-wider text-text-dim">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2 hover:text-accent"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
