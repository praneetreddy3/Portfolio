import { motion } from "framer-motion";
import { FiCpu, FiDatabase, FiCode, FiBarChart2 } from "react-icons/fi";
import { skills } from "../data/content";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Maps each category in content.js to an icon + accent color, mimicking the
// reference site's 4-column colored tech-stack layout.
const CATEGORY_META = {
  "AI & Data Engineering": { icon: FiCpu, color: "text-accent-2" },
  "Big Data & Cloud": { icon: FiDatabase, color: "text-accent" },
  "Programming & Tools": { icon: FiCode, color: "text-accent" },
};

export default function Skills() {
  const categories = Object.entries(skills);

  return (
    <section id="skills" className="py-28 border-t border-border">
      <div className="section-container">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          TECH <span className="glow-text">STACK</span>
        </h2>
        <p className="text-text-dim max-w-xl mb-14">
          Tools and technologies I've used across research, capstone projects,
          and industry internships.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map(([category, items], i) => {
            const meta = CATEGORY_META[category] || {
              icon: FiBarChart2,
              color: "text-accent-3",
            };
            const Icon = meta.icon;
            return (
              <motion.div
                key={category}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, borderColor: "rgba(0,229,255,0.5)" }}
                className="rounded border border-border bg-surface p-6"
              >
                <Icon size={28} className={meta.color} />
                <h3 className="mt-4 mb-4 font-mono text-sm tracking-wider text-text uppercase">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {items.map((s) => (
                    <li
                      key={s}
                      className="text-sm text-text-dim font-mono flex items-center gap-2"
                    >
                      <span className={`w-1 h-1 rounded-full ${meta.color} bg-current`} />
                      {s}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
