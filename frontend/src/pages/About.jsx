import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useInView, AnimatePresence, useMotionTemplate, useScroll } from 'framer-motion';
import { Code2, Palette, Database, Brain, Coffee, Zap, Trophy, Rocket } from 'lucide-react';
import {
  SiReact, SiNextdotjs, SiTypescript, SiNodedotjs, SiPython,
  SiFastapi, SiMongodb, SiPostgresql, SiTensorflow, SiDocker,
  SiTailwindcss, SiFramer, SiGit, SiFigma,
} from 'react-icons/si';
import { FaAws } from 'react-icons/fa';
import { personalInfo, skills, techStack, funFacts } from '../data/mock';
import ScrollReveal from '../components/animations/ScrollReveal';

/* ═══════════════════════════════════════════════════
   3D TILT HOOK — mouse-reactive perspective rotation
   ═══════════════════════════════════════════════════ */
const use3DTilt = (maxTilt = 15) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const springRX = useSpring(rotateX, { stiffness: 260, damping: 20 });
  const springRY = useSpring(rotateY, { stiffness: 260, damping: 20 });

  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const onLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return { ref, springRX, springRY, onMove, onLeave, rawX: x, rawY: y };
};

/* ═══════════════════════════════════════════════════
   MAGNETIC CURSOR HOOK — element pulled toward cursor
   ═══════════════════════════════════════════════════ */
const useMagnetic = (strength = 0.3) => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 180, damping: 14 });
  const springY = useSpring(my, { stiffness: 180, damping: 14 });

  const handleMouse = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left - rect.width / 2) * strength);
    my.set((e.clientY - rect.top - rect.height / 2) * strength);
  }, [mx, my, strength]);

  const reset = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);
  return { ref, springX, springY, handleMouse, reset };
};

/* ═══════════════════════════════════════════════════
   SKILL NODE — Floating 3D orb with SVG arc progress,
   magnetic pull, and glassmorphic surface
   ═══════════════════════════════════════════════════ */
const SkillNode = ({ skill, index, layoutIndex }) => {
  const { ref: magRef, springX, springY, handleMouse, reset } = useMagnetic(0.2);
  const [hovered, setHovered] = useState(false);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (skill.level / 100) * circumference;

  // Scattered positions — asymmetric layout, not a grid
  const positions = [
    'col-span-2 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-2 row-span-1',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 30 + index * 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: -20 }}
      transition={{
        duration: 0.55,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={positions[index % positions.length]}
    >
      <motion.div
        ref={magRef}
        onMouseMove={(e) => { handleMouse(e); setHovered(true); }}
        onMouseLeave={() => { reset(); setHovered(false); }}
        style={{ x: springX, y: springY }}
        whileHover={{ scale: 1.08, z: 30 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 16 }}
        className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl cursor-default select-none
                   bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl
                   border border-neutral-200/50 dark:border-neutral-800/40
                   shadow-lg shadow-black/[0.02] dark:shadow-black/20
                   hover:shadow-2xl hover:border-neutral-300 dark:hover:border-neutral-700
                   transition-shadow duration-300 skill-node"
      >
        {/* SVG arc progress ring */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
            <circle cx="24" cy="24" r={radius} fill="none" strokeWidth="2.5"
              className="stroke-neutral-100 dark:stroke-neutral-800/60" />
            <motion.circle cx="24" cy="24" r={radius} fill="none"
              strokeWidth="3" strokeLinecap="round"
              className="stroke-black dark:stroke-white"
              initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, delay: index * 0.06 + 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold
                          text-neutral-500 dark:text-neutral-400
                          group-hover:text-black dark:group-hover:text-white transition-colors duration-200">
            {skill.level}
          </span>
        </div>

        {/* Skill name */}
        <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300
                        group-hover:text-black dark:group-hover:text-white
                        transition-colors duration-200 whitespace-nowrap">
          {skill.name}
        </span>

        {/* Hover glow */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute -inset-1 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] blur-lg -z-10 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Shine sweep */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '220%', opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 rounded-2xl pointer-events-none skill-node-shine"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════
   CATEGORY TAB — 3D floating tab with active state
   ═══════════════════════════════════════════════════ */
const CategoryTab = ({ category, isActive, onClick, index }) => {
  const { ref, springX, springY, handleMouse, reset } = useMagnetic(0.15);
  const Icon = category.icon;

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.96 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl cursor-pointer select-none
                  border transition-all duration-300 outline-none
                  ${isActive
                    ? 'bg-black dark:bg-white border-black dark:border-white shadow-xl shadow-black/10 dark:shadow-white/10'
                    : 'bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl border-neutral-200/60 dark:border-neutral-800/50 shadow-md shadow-black/[0.02] dark:shadow-black/15 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg'
                  }`}
    >
      <Icon className={`w-4.5 h-4.5 transition-colors duration-300
                       ${isActive
                         ? 'text-white dark:text-black'
                         : 'text-neutral-500 dark:text-neutral-400'}`}
            strokeWidth={1.5} />
      <span className={`text-sm font-medium transition-colors duration-300
                       ${isActive
                         ? 'text-white dark:text-black'
                         : 'text-neutral-600 dark:text-neutral-400'}`}>
        {category.label}
      </span>

      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          layoutId="activeTabDot"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black dark:bg-white"
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      )}
    </motion.button>
  );
};

/* ═══════════════════════════════════════════════════
   SKILL CONSTELLATION — Container with global 3D tilt,
   animated category switching, and scattered layout
   ═══════════════════════════════════════════════════ */
const SkillConstellation = ({ categories }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-0.5, 0.5], [3, -3]);
  const rotY = useTransform(mx, [-0.5, 0.5], [-4, 4]);
  const springRotX = useSpring(rotX, { stiffness: 60, damping: 30 });
  const springRotY = useSpring(rotY, { stiffness: 60, damping: 30 });

  const handleMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mx, my]);

  const handleLeave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);

  const activeSkills = skills[categories[activeCategory].key];

  return (
    <div ref={containerRef}>
      {/* Category tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mb-16"
      >
        {categories.map((cat, i) => (
          <CategoryTab
            key={cat.key}
            category={cat}
            isActive={i === activeCategory}
            onClick={() => setActiveCategory(i)}
            index={i}
          />
        ))}
      </motion.div>

      {/* 3D Skill display */}
      <div style={{ perspective: 1800 }}>
        <motion.div
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{ rotateX: springRotX, rotateY: springRotY, transformStyle: 'preserve-3d' }}
          className="relative min-h-[280px] md:min-h-[220px]"
        >
          {/* Ambient background orbit rings */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              className="absolute w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full border border-dashed border-neutral-200/30 dark:border-neutral-800/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              style={{ transform: 'translateZ(-30px)' }}
            />
            <motion.div
              className="absolute w-[200px] h-[200px] md:w-[340px] md:h-[340px] rounded-full border border-neutral-100/40 dark:border-neutral-800/15"
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
              style={{ transform: 'translateZ(-20px)' }}
            />
          </div>

          {/* Skill nodes — AnimatePresence for smooth category switch */}
          <AnimatePresence mode="wait">
            <motion.div
              key={categories[activeCategory].key}
              initial={{ opacity: 0, rotateY: 15, scale: 0.95 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: -15, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {activeSkills.map((skill, i) => (
                <SkillNode key={skill.name} skill={skill} index={i} layoutIndex={activeCategory} />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   TECH TILE — 3D depth-layered tile with cursor
   spotlight, hover lift, and entrance animation
   ═══════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════
   TECH ICON MAP — maps tech names to react-icons
   ═══════════════════════════════════════════════════ */
const techIconMap = {
  'React': { icon: SiReact, color: '#61DAFB' },
  'Next.js': { icon: SiNextdotjs, color: '#ffffff' },
  'TypeScript': { icon: SiTypescript, color: '#3178C6' },
  'Node.js': { icon: SiNodedotjs, color: '#339933' },
  'Python': { icon: SiPython, color: '#3776AB' },
  'FastAPI': { icon: SiFastapi, color: '#009688' },
  'MongoDB': { icon: SiMongodb, color: '#47A248' },
  'PostgreSQL': { icon: SiPostgresql, color: '#4169E1' },
  'TensorFlow': { icon: SiTensorflow, color: '#FF6F00' },
  'Docker': { icon: SiDocker, color: '#2496ED' },
  'AWS': { icon: FaAws, color: '#FF9900' },
  'Tailwind': { icon: SiTailwindcss, color: '#06B6D4' },
  'Framer Motion': { icon: SiFramer, color: '#0055FF' },
  'Git': { icon: SiGit, color: '#F05032' },
  'Figma': { icon: SiFigma, color: '#F24E1E' },
};

/* ═══════════════════════════════════════════════════
   TECH TILE — 3D flip card: front = name,
   back = brand icon. Hover to flip with spring
   physics, cursor spotlight, depth glow, shine sweep
   ═══════════════════════════════════════════════════ */
const TechTile = ({ tech, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const [flipped, setFlipped] = useState(false);

  const entry = techIconMap[tech];
  const IconComp = entry?.icon;
  const brandColor = entry?.color || '#888';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 25, scale: 0.85 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1200 }}
    >
      <div
        className="group relative cursor-default"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        {/* Hover glow shadow — tinted with brand color */}
        <motion.div
          className="absolute -inset-3 rounded-2xl blur-xl -z-10"
          animate={flipped
            ? { scale: 1.2, opacity: 0.5, backgroundColor: brandColor + '20' }
            : { scale: 1, opacity: 0, backgroundColor: 'transparent' }}
          transition={{ duration: 0.4 }}
        />

        {/* ── The flip container ── */}
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25, mass: 0.8 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative h-28 sm:h-32 md:h-36"
        >
          {/* ════ FRONT FACE ════ */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden
                       bg-white/80 dark:bg-neutral-900/70 backdrop-blur-md
                       border border-neutral-200/50 dark:border-neutral-800/50
                       shadow-lg shadow-black/[0.02] dark:shadow-black/15
                       tech-tile"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            {/* Index watermark */}
            <span
              className="absolute -bottom-2 -right-1 text-[64px] font-black leading-none
                         text-neutral-100/70 dark:text-neutral-800/25 select-none pointer-events-none"
            >
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Tech name */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
              <span className="text-sm md:text-base font-bold text-neutral-700 dark:text-neutral-300 tracking-wide text-center">
                {tech}
              </span>
              <div className="mt-2 h-[2px] w-6 rounded-full bg-neutral-300/50 dark:bg-neutral-700/50" />
            </div>

            {/* Bottom line hint */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(to right, transparent, ${brandColor}40, transparent)` }}
            />
          </div>

          {/* ════ BACK FACE ════ */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden
                       border border-neutral-200/30 dark:border-neutral-800/30
                       shadow-2xl shadow-black/[0.06] dark:shadow-black/30"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `radial-gradient(circle at 50% 40%, ${brandColor}18 0%, transparent 70%)`,
            }}
          >
            {/* Glass backdrop */}
            <div className="absolute inset-0 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl" />

            {/* Radial glow behind icon */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-24 h-24 rounded-full blur-2xl opacity-30"
              style={{ backgroundColor: brandColor }}
            />

            {/* Icon + label */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 px-4">
              {IconComp ? (
                <motion.div
                  initial={{ scale: 0.5, rotate: -30 }}
                  animate={flipped ? { scale: 1, rotate: 0 } : { scale: 0.5, rotate: -30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.08 }}
                >
                  <IconComp size={36} style={{ color: brandColor }} />
                </motion.div>
              ) : (
                <motion.span
                  className="text-3xl font-black"
                  style={{ color: brandColor }}
                  initial={{ scale: 0.5 }}
                  animate={flipped ? { scale: 1 } : { scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.08 }}
                >
                  {tech.charAt(0)}
                </motion.span>
              )}

              <motion.span
                className="text-[11px] font-semibold tracking-wider uppercase"
                style={{ color: brandColor }}
                initial={{ opacity: 0, y: 8 }}
                animate={flipped ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.35, delay: 0.12 }}
              >
                {tech}
              </motion.span>
            </div>

            {/* Corner accents */}
            <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[1px]" style={{ backgroundColor: brandColor + '40' }} />
              <div className="absolute top-0 left-0 h-full w-[1px]" style={{ backgroundColor: brandColor + '40' }} />
            </div>
            <div className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-full h-[1px]" style={{ backgroundColor: brandColor + '40' }} />
              <div className="absolute bottom-0 right-0 h-full w-[1px]" style={{ backgroundColor: brandColor + '40' }} />
            </div>

            {/* Shine sweep on flip */}
            <AnimatePresence>
              {flipped && (
                <motion.div
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: '200%', opacity: 0.35 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════
   TECH GRID — Container with mouse-reactive global
   perspective tilt for the entire tile wall
   ═══════════════════════════════════════════════════ */
const TechGrid = ({ techs }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
      {techs.map((tech, index) => (
        <TechTile key={tech} tech={tech} index={index} />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   FUN FACTS — 3D Interactive Orbital System
   Mouse-reactive parallax, auto-rotating orbit,
   depth-of-field, expanding hover reveals,
   floating particles, pulsing nucleus
   ═══════════════════════════════════════════════════ */
const funFactsMeta = [
  { stat: '<2min', label: 'Solve Time', icon: Trophy, rgb: '245,158,11' },
  { stat: '3+', label: 'Cups / Day', icon: Coffee, rgb: '139,92,246' },
  { stat: '5', label: 'Open Source', icon: Rocket, rgb: '6,182,212' },
  { stat: '\u221E', label: 'Curiosity', icon: Zap, rgb: '244,63,94' },
  { stat: '12am', label: 'Peak Flow', icon: Code2, rgb: '16,185,129' },
];

/* Orbit Node — glass panel for each fact */
const FunFactOrbitNode = ({ text, meta, index, isActive }) => (
  <motion.div
    className="relative cursor-pointer select-none"
    style={{ width: 172, height: 210 }}
    animate={{ scale: isActive ? 1.08 : 1 }}
    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
  >
    {/* Colored glow halo */}
    <motion.div
      className="absolute -inset-5 rounded-3xl blur-2xl pointer-events-none"
      style={{ background: `rgba(${meta.rgb}, 0.14)` }}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1.15 : 0.8 }}
      transition={{ duration: 0.35 }}
    />

    {/* Concentric ripple rings on hover */}
    <AnimatePresence>
      {isActive && [0, 1, 2].map(r => (
        <motion.div
          key={r}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `1px solid rgba(${meta.rgb}, 0.12)` }}
          initial={{ scale: 1, opacity: 0.35 }}
          animate={{ scale: [1, 1.2 + r * 0.12], opacity: [0.35, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, delay: r * 0.2, repeat: Infinity }}
        />
      ))}
    </AnimatePresence>

    {/* Glass surface */}
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden backdrop-blur-xl
                  border transition-all duration-500
                  ${isActive
                    ? 'bg-white/90 dark:bg-neutral-900/90 shadow-2xl border-transparent'
                    : 'bg-white/50 dark:bg-neutral-900/40 shadow-lg shadow-black/[0.04] dark:shadow-black/20 border-neutral-200/30 dark:border-neutral-800/20'
                  }`}
      style={{
        borderColor: isActive ? `rgba(${meta.rgb}, 0.25)` : undefined,
        boxShadow: isActive ? `0 0 50px rgba(${meta.rgb}, 0.12), 0 20px 50px rgba(0,0,0,0.1)` : undefined,
      }}
    >
      {/* Accent line top */}
      <div
        className="absolute top-0 inset-x-0 h-px transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${meta.rgb}, ${isActive ? 0.5 : 0.1}), transparent)` }}
      />

      {/* Default view — icon + stat + label */}
      <div className={`flex flex-col items-center justify-center h-full p-4 transition-all duration-300
                       ${isActive ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div className="relative mb-3">
          <meta.icon className="w-6 h-6" style={{ color: `rgb(${meta.rgb})` }} strokeWidth={1.5} />
          <motion.div
            className="absolute inset-[-7px] pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 5 + index * 0.8, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
              style={{ background: `rgba(${meta.rgb}, 0.5)` }}
            />
          </motion.div>
        </div>
        <span className="text-3xl font-black tracking-tight leading-none" style={{ color: `rgb(${meta.rgb})` }}>
          {meta.stat}
        </span>
        <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500 mt-1.5">
          {meta.label}
        </span>
      </div>

      {/* Expanded hover view */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center p-5 rounded-2xl
                       bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl"
          >
            <meta.icon className="w-7 h-7 mb-2" style={{ color: `rgb(${meta.rgb})` }} strokeWidth={1.5} />
            <span className="text-2xl font-black tracking-tight mb-1.5 leading-none" style={{ color: `rgb(${meta.rgb})` }}>
              {meta.stat}
            </span>
            <p className="text-[11px] text-center text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

/* 3D Orbit Container — auto-rotation + mouse parallax + depth-of-field */
const FunFactsOrbit = () => {
  const containerRef = useRef(null);
  const nodesRef = useRef([]);
  const rotationRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const activeRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const [activeIndex, setActiveIndex] = useState(null);
  const [ready, setReady] = useState(false);

  const count = funFacts.length;

  useEffect(() => { if (isInView) setTimeout(() => setReady(true), 200); }, [isInView]);
  useEffect(() => { activeRef.current = activeIndex; }, [activeIndex]);

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.x = (e.clientX - rect.left) / rect.width - 0.5;
    mouseRef.current.y = (e.clientY - rect.top) / rect.height - 0.5;
  }, []);

  /* rAF loop — positions nodes along elliptical orbit with depth effects */
  useEffect(() => {
    if (!ready) return;
    let frame;
    const nw = 86, nh = 105; // half node size
    const loop = () => {
      if (activeRef.current === null) rotationRef.current += 0.18;
      const cw = containerRef.current?.offsetWidth || 800;
      const radiusX = Math.min(280, cw * 0.34);
      const radiusY = Math.min(110, radiusX * 0.4);
      const base = rotationRef.current + mouseRef.current.x * 25;

      for (let i = 0; i < count; i++) {
        const node = nodesRef.current[i];
        if (!node) continue;
        const rad = ((base + (360 / count) * i) * Math.PI) / 180;
        const x = Math.cos(rad) * radiusX;
        const y = Math.sin(rad) * radiusY;
        const depth = Math.sin(rad); // -1 back, +1 front
        const s = 0.6 + (depth + 1) * 0.25;
        const o = 0.28 + (depth + 1) * 0.36;
        const b = depth < -0.15 ? (-depth - 0.15) * 2.5 : 0;
        const isHov = activeRef.current === i;

        node.style.transform = `translate(${x - nw}px, ${y - nh}px) scale(${isHov ? Math.max(s * 1.08, 1.05) : s})`;
        node.style.opacity = isHov ? '1' : o.toFixed(2);
        node.style.filter = isHov ? 'none' : b > 0.1 ? `blur(${b.toFixed(1)}px)` : 'none';
        node.style.zIndex = isHov ? '500' : String(Math.round(depth * 100) + 200);
      }

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [ready, count]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full flex items-center justify-center"
      style={{ height: 520 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Central nucleus */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[300] pointer-events-none">
          <motion.div
            className="w-14 h-14 rounded-full flex items-center justify-center
                       border border-neutral-200/15 dark:border-neutral-700/15"
            style={{ background: 'radial-gradient(circle, rgba(150,150,150,0.06), transparent)' }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(150,150,150,0.02)',
                '0 0 45px rgba(150,150,150,0.07)',
                '0 0 20px rgba(150,150,150,0.02)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-[10px] font-light tracking-[0.3em] uppercase text-neutral-400/40 dark:text-neutral-500/40">
              me
            </span>
          </motion.div>
          {[0, 1].map(r => (
            <motion.div
              key={r}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(150,150,150,0.06)' }}
              animate={{ scale: [1, 3], opacity: [0.25, 0] }}
              transition={{ duration: 3.5, delay: r * 1.7, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* SVG orbit ellipse trail */}
        <svg
          className="absolute left-1/2 top-1/2 pointer-events-none z-[150]"
          width="620" height="280"
          style={{ marginLeft: -310, marginTop: -140, overflow: 'visible' }}
        >
          <motion.ellipse
            cx="310" cy="140" rx="280" ry="110"
            fill="none" stroke="currentColor"
            className="text-neutral-300/12 dark:text-neutral-600/10"
            strokeWidth="1" strokeDasharray="4 12"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 2.5, delay: 0.4, ease: 'easeOut' }}
          />
          {/* Traveling dot along the orbit path */}
          <motion.circle
            r="2" className="fill-neutral-300/30 dark:fill-neutral-600/25"
            animate={{
              cx: [590, 310, 30, 310, 590],
              cy: [140, 250, 140, 30, 140],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          />
        </svg>

        {/* Ambient floating particles */}
        {ready && Array.from({ length: 10 }).map((_, i) => {
          const rgb = funFactsMeta[i % 5].rgb;
          const a = (i / 10) * Math.PI * 2;
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full pointer-events-none z-[50]"
              style={{ width: 2 + (i % 3), height: 2 + (i % 3), background: `rgba(${rgb}, 0.25)` }}
              animate={{
                x: [0, Math.cos(a) * (120 + i * 14), 0],
                y: [0, Math.sin(a) * (50 + i * 7), 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{ duration: 5 + i * 0.4, delay: i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          );
        })}

        {/* Orbit Nodes */}
        {funFacts.map((text, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ willChange: 'transform, opacity, filter' }}
          >
            <div
              ref={(el) => { nodesRef.current[i] = el; }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <FunFactOrbitNode text={text} meta={funFactsMeta[i]} index={i} isActive={activeIndex === i} />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   ABOUT HERO IMAGE — Advanced 3D parallax card with
   cursor spotlight, grayscale reveal, orbiting rings,
   floating geometry, depth layers, scroll-driven motion
   ═══════════════════════════════════════════════════ */
const AboutHeroImage = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { ref: tiltRef, springRX, springRY, onMove, onLeave, rawX, rawY } = use3DTilt(14);
  const [hovered, setHovered] = useState(false);

  /* scroll-driven vertical parallax */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const scrollY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [-3, 3]);
  const springScrollY = useSpring(scrollY, { stiffness: 40, damping: 20 });
  const springScrollR = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

  /* cursor spotlight */
  const spotX = useTransform(rawX, [-0.5, 0.5], [0, 100]);
  const spotY = useTransform(rawY, [-0.5, 0.5], [0, 100]);
  const spotBg = useMotionTemplate`radial-gradient(450px circle at ${spotX}% ${spotY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;

  /* cursor-reactive parallax offsets for decorative layers */
  const paraX = useTransform(rawX, [-0.5, 0.5], [-20, 20]);
  const paraY = useTransform(rawY, [-0.5, 0.5], [-20, 20]);
  const paraXInv = useTransform(rawX, [-0.5, 0.5], [15, -15]);
  const paraYInv = useTransform(rawY, [-0.5, 0.5], [15, -15]);
  const spParaX = useSpring(paraX, { stiffness: 80, damping: 20 });
  const spParaY = useSpring(paraY, { stiffness: 80, damping: 20 });
  const spParaXI = useSpring(paraXInv, { stiffness: 60, damping: 25 });
  const spParaYI = useSpring(paraYInv, { stiffness: 60, damping: 25 });

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, x: -100, rotateY: -12 }}
      animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1400, y: springScrollY }}
    >
      <motion.div
        ref={tiltRef}
        onMouseMove={(e) => { onMove(e); setHovered(true); }}
        onMouseLeave={() => { onLeave(); setHovered(false); }}
        style={{ rotateX: springRX, rotateY: springRY, rotateZ: springScrollR, transformStyle: 'preserve-3d' }}
        className="group relative"
      >
        {/* ── Orbiting ring 1 — slow rotation, deep Z ── */}
        <motion.div
          className="absolute inset-[-15%] pointer-events-none"
          style={{ transform: 'translateZ(-50px)' }}
        >
          <motion.div
            className="w-full h-full rounded-full border border-dashed border-neutral-200/20 dark:border-neutral-700/15"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* ── Orbiting ring 2 — counter-rotate ── */}
        <motion.div
          className="absolute inset-[-8%] pointer-events-none"
          style={{ transform: 'translateZ(-35px)' }}
        >
          <motion.div
            className="w-full h-full rounded-full border border-neutral-200/15 dark:border-neutral-700/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* ── Cursor-reactive depth shadow ── */}
        <motion.div
          className="absolute -inset-8 rounded-3xl bg-black/[0.04] dark:bg-white/[0.02] blur-2xl -z-10"
          animate={hovered ? { scale: 1.1, opacity: 1 } : { scale: 1, opacity: 0.3 }}
          transition={{ duration: 0.5 }}
          style={{ transform: 'translateZ(-50px)', x: spParaXI, y: spParaYI }}
        />

        {/* ── Offset wireframe — parallax depth layer ── */}
        <motion.div
          className="absolute -bottom-5 -right-5 w-full h-full rounded-2xl border border-neutral-200/30 dark:border-neutral-800/20"
          style={{ transform: 'translateZ(-30px)', x: spParaX, y: spParaY }}
        />

        {/* ── Floating gradient block — cursor-reactive ── */}
        <motion.div
          className="absolute -top-6 -left-6 w-1/2 h-1/2 rounded-2xl bg-gradient-to-br from-neutral-100/50 to-neutral-200/20 dark:from-neutral-900/40 dark:to-neutral-800/10"
          style={{ transform: 'translateZ(-40px)', x: spParaXI, y: spParaYI }}
        />

        {/* ── Floating geometric shapes — cursor parallax ── */}
        <motion.div
          className="absolute -top-8 right-[15%] w-5 h-5 border-2 border-neutral-300/30 dark:border-neutral-600/20 pointer-events-none"
          style={{ transform: 'translateZ(25px) rotate(45deg)', x: spParaX, y: spParaY }}
          animate={{ rotate: [45, 90, 45], scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[10%] -left-5 w-3 h-3 rounded-full bg-neutral-300/40 dark:bg-neutral-600/25 pointer-events-none"
          style={{ transform: 'translateZ(20px)', x: spParaXI, y: spParaYI }}
          animate={{ y: [-8, 8, -8], x: [-4, 4, -4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[40%] -right-7 w-8 h-[2px] rounded-full bg-neutral-300/40 dark:bg-neutral-600/20 pointer-events-none"
          style={{ transform: 'translateZ(15px)', x: spParaX }}
          animate={{ scaleX: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── Main image card ── */}
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden
                        border border-neutral-200/20 dark:border-neutral-800/20
                        shadow-2xl shadow-black/[0.06] dark:shadow-black/30
                        group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]
                        dark:group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)]
                        transition-shadow duration-600">

          {/* Image — grayscale → color on hover */}
          <motion.img
            src="/passimg.jpeg"
            alt={personalInfo.name}
            className="w-full h-full object-cover transition-all duration-700
                       grayscale group-hover:grayscale-0
                       group-hover:brightness-110"
            animate={hovered ? { scale: 1.06 } : { scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Cursor spotlight */}
          <motion.div
            style={{ background: spotBg }}
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          />

          {/* Gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5
                          group-hover:from-black/10 group-hover:to-transparent
                          transition-all duration-700 pointer-events-none z-10" />

          {/* Corner scan lines — appear on hover */}
          <motion.div
            className="absolute top-4 left-4 w-8 h-8 pointer-events-none z-10"
            animate={hovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30" />
            <div className="absolute top-0 left-0 w-[1px] h-full bg-white/30" />
          </motion.div>
          <motion.div
            className="absolute bottom-4 right-4 w-8 h-8 pointer-events-none z-10"
            animate={hovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute bottom-0 right-0 w-full h-[1px] bg-white/30" />
            <div className="absolute bottom-0 right-0 w-[1px] h-full bg-white/30" />
          </motion.div>

          {/* Role badge — forward Z */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotateX: 30 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ delay: 1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-5 left-5 z-20"
            style={{ transform: 'translateZ(35px)' }}
          >
            <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-black/60 backdrop-blur-md
                            border border-white/20 dark:border-neutral-700/40 shadow-lg">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 tracking-wider uppercase">
                {personalInfo.role}
              </span>
            </div>
          </motion.div>

          {/* Hover shine sweep */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '200%', opacity: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute inset-0 z-10 pointer-events-none"
              >
                <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Floating accent dots — different Z layers ── */}
        {[
          { left: '-7%', top: '15%', size: 6, dur: 5, z: 20 },
          { right: '-6%', top: '60%', size: 4, dur: 4.2, z: 10 },
          { left: '12%', bottom: '-5%', size: 5, dur: 6, z: 15 },
          { right: '20%', top: '-4%', size: 3, dur: 3.8, z: 25 },
        ].map((dot, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-neutral-300 dark:bg-neutral-700 pointer-events-none"
            style={{
              width: dot.size, height: dot.size,
              left: dot.left, right: dot.right, top: dot.top, bottom: dot.bottom,
              transform: `translateZ(${dot.z}px)`,
            }}
            animate={{ y: [-6, 6, -6], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: dot.dur, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
          />
        ))}

        {/* ── Animated edge line — hover reveal ── */}
        <motion.div
          className="absolute top-[8%] -right-3 w-[2px] rounded-full origin-top pointer-events-none"
          initial={{ height: 0, opacity: 0 }}
          animate={hovered ? { height: '65%', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(150,150,150,0.4), transparent)',
            transform: 'translateZ(8px)',
          }}
        />
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════
   ABOUT INFO CARD — 3D tilt micro-card with
   magnetic pull, cursor spotlight, hover lift,
   shine sweep, and scroll-triggered entrance
   ═══════════════════════════════════════════════════ */
const AboutInfoCard = ({ label, value, index, isInView }) => {
  const { ref: magRef, springX, springY, handleMouse, reset } = useMagnetic(0.2);
  const { ref: tiltRef, springRX, springRY, onMove, onLeave, rawX, rawY } = use3DTilt(10);
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const spotX = useTransform(rawX, [-0.5, 0.5], [0, 100]);
  const spotY = useTransform(rawY, [-0.5, 0.5], [0, 100]);
  const spotBg = useMotionTemplate`radial-gradient(120px circle at ${spotX}% ${spotY}%, rgba(255,255,255,0.08) 0%, transparent 60%)`;

  /* compose both refs */
  const setRefs = useCallback((node) => {
    magRef.current = node;
    tiltRef.current = node;
    cardRef.current = node;
  }, [magRef, tiltRef]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 25, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: 0.5 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 800 }}
    >
      <motion.div
        ref={setRefs}
        onMouseMove={(e) => { handleMouse(e); onMove(e); setHovered(true); }}
        onMouseLeave={() => { reset(); onLeave(); setHovered(false); }}
        style={{ x: springX, y: springY, rotateX: springRX, rotateY: springRY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.06, y: -6 }}
        whileTap={{ scale: 0.96 }}
        className="group/card relative p-5 rounded-2xl cursor-default overflow-hidden
                   bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl
                   border border-neutral-200/50 dark:border-neutral-800/40
                   shadow-lg shadow-black/[0.02] dark:shadow-black/20
                   hover:shadow-2xl hover:border-neutral-300 dark:hover:border-neutral-700
                   transition-shadow duration-300"
      >
        {/* Cursor spotlight */}
        <motion.div
          style={{ background: spotBg }}
          className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
        />

        {/* Index watermark */}
        <span className="absolute -bottom-1 -right-1 text-[40px] font-black leading-none
                        text-neutral-100/50 dark:text-neutral-800/20 select-none pointer-events-none
                        group-hover/card:text-neutral-200 dark:group-hover/card:text-neutral-700/30
                        transition-colors duration-300"
              style={{ transform: 'translateZ(-8px)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>

        <div style={{ transform: 'translateZ(12px)' }}>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium tracking-[0.2em] uppercase mb-1.5">
            {label}
          </p>
          <p className="text-sm text-black dark:text-white font-semibold leading-snug">
            {value}
          </p>
        </div>

        {/* Shine sweep */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '220%', opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1.5px] origin-left"
          initial={{ scaleX: 0 }}
          animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'linear-gradient(to right, transparent, rgba(150,150,150,0.4), transparent)',
          }}
        />
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════
   3D LETTER — Individual letter with mouse-reactive
   depth, parallax float, and independent spring
   ═══════════════════════════════════════════════════ */
const Letter3D = ({ char, index, isInView, mouseX, mouseY, isLast }) => {
  /* each letter reacts to mouse position with slight offset */
  const offsetX = useTransform(mouseX, [-0.5, 0.5], [-4 - index * 0.5, 4 + index * 0.5]);
  const offsetY = useTransform(mouseY, [-0.5, 0.5], [-3 - index * 0.3, 3 + index * 0.3]);
  const rotX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const rotY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);
  const spX = useSpring(offsetX, { stiffness: 150 - index * 3, damping: 18 });
  const spY = useSpring(offsetY, { stiffness: 150 - index * 3, damping: 18 });
  const spRX = useSpring(rotX, { stiffness: 100, damping: 25 });
  const spRY = useSpring(rotY, { stiffness: 100, damping: 25 });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      initial={{ opacity: 0, y: 70, rotateX: 90, scale: 0.5 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
      transition={{
        duration: 0.9,
        delay: 0.2 + index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        x: spX, y: spY, rotateX: spRX, rotateY: spRY,
        transformOrigin: 'bottom center',
        transformStyle: 'preserve-3d',
        display: 'inline-block',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`cursor-default select-none relative ${isLast ? 'font-normal' : ''}`}
    >
      {/* Shadow text behind — depth layer */}
      <motion.span
        className="absolute inset-0 text-neutral-200/30 dark:text-neutral-700/20 pointer-events-none select-none"
        aria-hidden="true"
        style={{ transform: 'translateZ(-15px) translateX(2px) translateY(2px)' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>

      {/* Main letter */}
      <motion.span
        animate={hovered ? { y: -8, scale: 1.15, rotateY: 15 } : { y: 0, scale: 1, rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="relative inline-block"
        style={{ transform: 'translateZ(10px)' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    </motion.span>
  );
};

/* ═══════════════════════════════════════════════════
   ABOUT HERO CONTENT — Mouse-reactive 3D heading
   with per-letter effects, scroll parallax, magnetic
   cards, staggered reveals, floating geometry
   ═══════════════════════════════════════════════════ */
const AboutHeroContent = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });

  /* section-wide mouse tracking for letter parallax */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const handleSectionMouse = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);
  const handleSectionLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0);
  }, [mouseX, mouseY]);

  /* scroll-based parallax for the whole content block */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const springContentY = useSpring(contentY, { stiffness: 40, damping: 20 });

  /* cursor-driven floating for decorative elements */
  const decX = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  const decY = useTransform(mouseY, [-0.5, 0.5], [-12, 12]);
  const spDecX = useSpring(decX, { stiffness: 60, damping: 25 });
  const spDecY = useSpring(decY, { stiffness: 60, damping: 25 });

  const headingLine1 = 'Crafting Digital';
  const headingLine2 = 'Experiences';

  const infoCards = [
    { label: 'Location', value: personalInfo.location },
    { label: 'Education', value: personalInfo.education },
    { label: 'Focus', value: personalInfo.tagline },
    { label: 'Status', value: 'Open to Collaborate' },
  ];

  const allChars1 = headingLine1.split('');
  const allChars2 = headingLine2.split('');

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleSectionMouse}
      onMouseLeave={handleSectionLeave}
      style={{ y: springContentY }}
      className="relative"
    >
      {/* ── Floating decorative geometry — cursor reactive ── */}
      <motion.div
        className="absolute -top-10 -right-6 w-20 h-20 border border-neutral-200/20 dark:border-neutral-700/15 rounded-xl pointer-events-none"
        style={{ x: spDecX, y: spDecY }}
        animate={{ rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute bottom-[20%] -left-8 w-3 h-3 rounded-full bg-neutral-300/30 dark:bg-neutral-600/20 pointer-events-none"
        style={{ x: spDecX, y: spDecY }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[35%] -right-3 w-6 h-[1.5px] bg-neutral-300/30 dark:bg-neutral-600/20 rounded-full pointer-events-none"
        style={{ x: spDecX }}
        animate={{ scaleX: [1, 2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── "About Me" badge — magnetic ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.85, rotateX: 30 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 400 }}
      >
        <span className="inline-block text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-[0.3em] uppercase
                         px-4 py-1.5 rounded-full border border-neutral-200/60 dark:border-neutral-800/60
                         bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm">
          About Me
        </span>
      </motion.div>

      {/* ── Heading — per-letter 3D with mouse interactivity ── */}
      <div className="mt-6" style={{ perspective: 800 }}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-black dark:text-white leading-tight">
          {/* Line 1: "Crafting Digital" */}
          <span className="block" style={{ transformStyle: 'preserve-3d' }}>
            {allChars1.map((char, i) => (
              <Letter3D
                key={`l1-${i}`}
                char={char}
                index={i}
                isInView={isInView}
                mouseX={mouseX}
                mouseY={mouseY}
                isLast={false}
              />
            ))}
          </span>

          {/* Line 2: "Experiences" — bold weight */}
          <span className="block mt-1" style={{ transformStyle: 'preserve-3d' }}>
            {allChars2.map((char, i) => (
              <Letter3D
                key={`l2-${i}`}
                char={char}
                index={allChars1.length + i}
                isInView={isInView}
                mouseX={mouseX}
                mouseY={mouseY}
                isLast={true}
              />
            ))}
          </span>
        </h1>
      </div>

      {/* ── Animated underline ── */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 h-[1.5px] w-24 origin-left bg-gradient-to-r from-neutral-400 dark:from-neutral-600 via-neutral-300 dark:via-neutral-700 to-transparent"
      />

      {/* ── Bio — staggered 3D reveal ── */}
      <motion.p
        initial={{ opacity: 0, y: 25, rotateX: 15 }}
        animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-7 text-neutral-600 dark:text-neutral-400 font-light leading-relaxed"
        style={{ perspective: 500, transformOrigin: 'top left' }}
      >
        {personalInfo.bio}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 25, rotateX: 15 }}
        animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 text-neutral-500 dark:text-neutral-500 font-light leading-relaxed"
        style={{ perspective: 500, transformOrigin: 'top left' }}
      >
        Currently pursuing {personalInfo.education}, I'm passionate about building
        applications that not only work flawlessly but also provide delightful user experiences.
        When I'm not coding, you'll find me exploring the latest in AI/ML or contributing to
        open-source projects.
      </motion.p>

      {/* ── Quick Info — 3D magnetic tilt cards ── */}
      <div className="mt-10 grid grid-cols-2 gap-3" style={{ perspective: 1000 }}>
        {infoCards.map((card, i) => (
          <AboutInfoCard
            key={card.label}
            label={card.label}
            value={card.value}
            index={i}
            isInView={isInView}
          />
        ))}
      </div>
    </motion.div>
  );
};

const About = () => {
  const skillCategories = [
    { key: 'frontend', label: 'Frontend', icon: Code2 },
    { key: 'backend', label: 'Backend', icon: Database },
    { key: 'aiml', label: 'AI / ML', icon: Brain },
    { key: 'tools', label: 'Tools', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* ══════════════════════════════════════════════════
          HERO — 3D Interactive Portrait + Animated Content
         ══════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-32 overflow-hidden relative">
        {/* Ambient background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-[10%] w-[400px] h-[400px] rounded-full opacity-20 blur-3xl
                       bg-neutral-200 dark:bg-neutral-800"
            animate={{ scale: [1, 1.15, 1], x: [0, 25, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/3 left-[15%] w-[300px] h-[300px] rounded-full opacity-15 blur-3xl
                       bg-neutral-100 dark:bg-neutral-900"
            animate={{ scale: [1.1, 1, 1.1], y: [0, -20, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image — 3D tilt, spotlight, grayscale→color */}
            <AboutHeroImage />

            {/* Content — animated heading, magnetic cards */}
            <AboutHeroContent />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SKILLS SECTION — Interactive 3D Constellation
         ══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 bg-neutral-50/50 dark:bg-neutral-950/50 overflow-hidden relative">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl
                          bg-neutral-200 dark:bg-neutral-800" />
          <div className="absolute bottom-1/3 left-[20%] w-[400px] h-[400px] rounded-full opacity-15 blur-3xl
                          bg-neutral-100 dark:bg-neutral-900" />
          {/* Subtle dot field */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-neutral-300/30 dark:bg-neutral-700/20"
              style={{
                left: `${(i * 47 + 11) % 100}%`,
                top: `${(i * 61 + 7) % 100}%`,
              }}
              animate={{ y: [0, -12, 0], opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 5 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-block text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-[0.3em] uppercase
                           px-4 py-1.5 rounded-full border border-neutral-200/60 dark:border-neutral-800/60
                           bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm"
              >
                My Expertise
              </motion.span>
              <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-light text-black dark:text-white">
                Skills & Technologies
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-neutral-400 dark:via-neutral-600 to-transparent"
              />
            </div>
          </ScrollReveal>

          <SkillConstellation categories={skillCategories} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TECH STACK — 3D Perspective Tile Wall
         ══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 relative overflow-hidden">
        {/* Multi-layer radial gradient backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-40
                         bg-[radial-gradient(circle,_rgba(150,150,150,0.08)_0%,_transparent_70%)]
                         dark:bg-[radial-gradient(circle,_rgba(80,80,80,0.15)_0%,_transparent_70%)]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl
                         bg-neutral-200 dark:bg-neutral-800" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-15 blur-3xl
                         bg-neutral-300 dark:bg-neutral-700" />
        </div>

        {/* Grid lines background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-block text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-[0.3em] uppercase
                           px-4 py-1.5 rounded-full border border-neutral-200/60 dark:border-neutral-800/60
                           bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm"
              >
                What I Use
              </motion.span>
              <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-light text-black dark:text-white">
                Tech Stack
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-neutral-400 dark:via-neutral-600 to-transparent"
              />
            </div>
          </ScrollReveal>

          <TechGrid techs={techStack} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FUN FACTS — 3D Interactive Orbital System
         ══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 overflow-hidden relative">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)' }}
            animate={{ x: [0, 30, 0], y: [0, -25, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4), transparent 70%)' }}
            animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 fun-facts-dot-grid opacity-[0.02] dark:opacity-[0.04]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-6">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-block text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-[0.3em] uppercase
                           px-4 py-1.5 rounded-full border border-neutral-200/60 dark:border-neutral-800/60
                           bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm"
              >
                Beyond Code
              </motion.span>
              <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-light text-black dark:text-white">
                Fun Facts
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-neutral-400 dark:via-neutral-600 to-transparent"
              />
            </div>
          </ScrollReveal>

          {/* Desktop — 3D Orbit */}
          <div className="hidden md:block">
            <FunFactsOrbit />
          </div>

          {/* Mobile — Glass cards fallback */}
          <div className="md:hidden grid grid-cols-2 gap-4">
            {funFacts.map((text, i) => {
              const m = funFactsMeta[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className={`relative p-5 rounded-xl overflow-hidden
                             bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl
                             border border-neutral-200/30 dark:border-neutral-800/20
                             shadow-md ${i === funFacts.length - 1 && funFacts.length % 2 !== 0 ? 'col-span-2' : ''}`}
                >
                  <div className="absolute top-0 inset-x-0 h-px"
                       style={{ background: `linear-gradient(90deg, transparent, rgba(${m.rgb}, 0.3), transparent)` }} />
                  <m.icon className="w-5 h-5 mb-2" style={{ color: `rgb(${m.rgb})` }} strokeWidth={1.5} />
                  <div className="text-2xl font-black mb-1 leading-none" style={{ color: `rgb(${m.rgb})` }}>{m.stat}</div>
                  <div className="text-[9px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-2">{m.label}</div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">{text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
