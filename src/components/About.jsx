import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { profile } from "../data/content";
import myPhoto from "../assets/me.jpg";
import TiltCard from "./TiltCard";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function About() {
  return (
    <section id="about" className="py-28 border-t border-border">
      <div className="section-container">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-14">
          ABOUT <span className="glow-text">ME</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-sm"
          >
            <span className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-accent z-10" />
            <span className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-accent z-10" />
            <span className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-accent z-10" />
            <span className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-accent z-10" />
            <TiltCard intensity={8} className="block">
              <img
                src={myPhoto}
                alt={profile.name}
                loading="lazy"
                decoding="async"
                className="w-full aspect-square object-cover rounded-sm border border-border"
              />
            </TiltCard>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              Building the{" "}
              <span className="text-accent-2 glow-text-alt">intelligent</span>{" "}
              future.
            </h3>
            <p className="text-text-dim leading-relaxed mb-4">
              {profile.about}
            </p>
            {profile.bio && (
              <p className="text-text-dim leading-relaxed mb-4 italic border-l-2 border-accent/40 pl-4">
                {profile.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-6">
              {["Python", "PyTorch", "RAG", "LangChain", "Spark", "SQL"].map(
                (s) => (
                  <span
                    key={s}
                    className="text-xs font-mono rounded border border-border bg-surface px-3 py-1.5 text-text-dim"
                  >
                    {s}
                  </span>
                )
              )}
            </div>

            <div className="flex items-center gap-4">
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-text-dim hover:text-accent transition-colors"
              >
                <FiGithub size={20} />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-text-dim hover:text-accent transition-colors"
              >
                <FiLinkedin size={20} />
              </a>
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="text-text-dim hover:text-accent transition-colors"
              >
                <FiMail size={20} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
