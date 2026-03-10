import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Download, ExternalLink, Calendar, MapPin, ChevronRight,
  ArrowRight, Sparkles, GraduationCap, Briefcase, Award,
} from 'lucide-react';
import { personalInfo, skills, certifications, achievements, experiences } from '../data/mock';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  NOISE OVERLAY                                                      */
/* ------------------------------------------------------------------ */
const NoiseSVG = () => (
  <svg className="pointer-events-none fixed inset-0 w-full h-full z-[100] opacity-[0.018]"
    style={{ mixBlendMode: 'overlay' }}>
    <filter id="resumeNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#resumeNoise)" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  MAGNETIC WRAPPER                                                   */
/* ------------------------------------------------------------------ */
const MagneticWrap = ({ children, className = '', strength = 0.3 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const handleMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }, [x, y, strength]);
  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }} className={className}>{children}</motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  INTERACTIVE HEADING (letter-by-letter 3D proximity + glitch)       */
/* ------------------------------------------------------------------ */
const InteractiveResumeHeading = ({ springMouseX, springMouseY }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let letters = [];
    let raf = null;

    const init = () => { letters = Array.from(container.querySelectorAll('.res-hero-letter')); };

    const onMove = (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!letters.length) init();
        letters.forEach((el) => {
          if (el.dataset.glitch === '1') return;
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
          const p = Math.max(0, 1 - dist / 250);
          const p2 = p * p;
          const line = el.dataset.line;
          const rgb = line === '1' ? '129,140,248' : '244,114,182';
          gsap.to(el, {
            y: -p2 * 30, z: p2 * 55, scale: 1 + p2 * 0.25,
            rotateX: ((e.clientY - cy) / 280) * p * -12,
            rotateY: ((e.clientX - cx) / 280) * p * 10,
            textShadow: p > 0.08
              ? `0 0 ${p2 * 35}px rgba(${rgb},${p2 * 0.6}), 0 0 ${p2 * 70}px rgba(${rgb},${p2 * 0.2})`
              : '0 0 0 transparent',
            duration: 0.45, ease: 'power2.out', overwrite: 'auto',
          });
        });
      });
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      letters.forEach((el) => {
        gsap.to(el, {
          y: 0, z: 0, scale: 1, rotateX: 0, rotateY: 0,
          textShadow: '0 0 0 transparent', color: '',
          duration: 1.2, ease: 'elastic.out(1,0.35)', overwrite: 'auto',
        });
      });
    };

    const tid = setTimeout(() => {
      init();
      window.addEventListener('mousemove', onMove);
      container.addEventListener('mouseleave', onLeave);
    }, 120);

    return () => {
      clearTimeout(tid);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const onLetterEnter = useCallback((e) => {
    const el = e.currentTarget;
    if (el.dataset.glitch === '1') return;
    el.dataset.glitch = '1';
    const burst = el.dataset.line === '1' ? '#818cf8' : '#f472b6';
    gsap.timeline({ onComplete: () => { el.dataset.glitch = '0'; } })
      .to(el, { z: 80, scale: 1.5, duration: 0.1, ease: 'power3.out' })
      .to(el, { skewX: 20, duration: 0.04 }, 0)
      .to(el, { skewX: -15, duration: 0.04 }, 0.04)
      .to(el, { skewX: 8, duration: 0.03 }, 0.08)
      .to(el, { skewX: 0, duration: 0.2, ease: 'elastic.out(1,0.5)' }, 0.11)
      .to(el, { color: burst, duration: 0.1 }, 0)
      .to(el, { color: '', duration: 0.5, ease: 'power2.inOut' }, 0.25);
  }, []);

  const renderLetters = useCallback((text, line, extra = '') => (
    text.split('').map((ch, i) =>
      ch === ' '
        ? <span key={`s${line}-${i}`} className="inline-block w-[0.25em]" />
        : <span key={`${line}-${i}`} data-line={line} onMouseEnter={onLetterEnter}
            className={`res-hero-letter inline-block cursor-default select-none ${extra}`}
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>{ch}</span>
    )
  ), [onLetterEnter]);

  return (
    <div ref={containerRef} style={{ perspective: '1200px' }} className="relative">
      <motion.h1 className="mb-2"
        style={{
          rotateX: useTransform(springMouseY, [-1, 1], [3, -3]),
          rotateY: useTransform(springMouseX, [-1, 1], [-2, 2]),
          transformStyle: 'preserve-3d',
        }}>
        <div style={{ transformStyle: 'preserve-3d' }}>
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[8.5rem] font-extralight tracking-tight leading-[1.1]">
            {renderLetters('Professional', '1')}
          </div>
        </div>
        <div className="-mt-2 lg:-mt-4" style={{ transformStyle: 'preserve-3d' }}>
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[8.5rem] font-normal tracking-tight leading-[1.1] text-neutral-500">
            {renderLetters('Background', '2')}
          </div>
        </div>
      </motion.h1>
      {/* Reflected ghost */}
      <div className="pointer-events-none select-none overflow-hidden h-8 md:h-16 lg:h-24 -mt-1" aria-hidden="true"
        style={{ transform: 'scaleY(-1)', opacity: 0.02,
          maskImage: 'linear-gradient(to bottom, black, transparent 60%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 60%)' }}>
        <div className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[8.5rem] font-extralight tracking-tight leading-[1.1] text-white">
          Professional Background
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  SKILL NODE (proficiency ring + hover glow)                         */
/* ------------------------------------------------------------------ */
const SkillNode = ({ skill, index, categoryColor }) => {
  const [hovered, setHovered] = useState(false);
  const circumference = 2 * Math.PI * 22;
  const filled = circumference * (skill.level / 100);

  return (
    <motion.div
      className="relative group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.08, type: 'spring', stiffness: 200 }}
    >
      <motion.div
        animate={hovered
          ? { scale: 1.2, y: -8, transition: { type: 'spring', stiffness: 400, damping: 20 } }
          : { scale: 1, y: 0 }}
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Proficiency ring */}
        <svg width="62" height="62" className="absolute -top-[4px] -left-[4px]">
          <circle cx="31" cy="31" r="22" fill="none" stroke="currentColor"
            className="text-neutral-200 dark:text-neutral-800" strokeWidth="2" />
          <motion.circle
            cx="31" cy="31" r="22" fill="none" stroke={categoryColor} strokeWidth="2.5"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference - filled }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: index * 0.1, ease: 'circOut' }}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>

        {/* Inner circle */}
        <div className={`w-[54px] h-[54px] rounded-full flex items-center justify-center
          bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800
          transition-all duration-300 ${hovered ? 'shadow-lg' : ''}`}
          style={hovered ? { borderColor: categoryColor, boxShadow: `0 0 25px ${categoryColor}40` } : {}}
        >
          <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
            {skill.level}%
          </span>
        </div>
      </motion.div>

      {/* Label */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.7, y: hovered ? -2 : 0 }}
        className="mt-3 text-center"
      >
        <span className="text-[11px] font-light text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
          {skill.name}
        </span>
      </motion.div>

      {/* Glow */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.12, scale: 2.2 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-4 left-4 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full -z-10 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${categoryColor}, transparent)` }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  JOURNEY CARD (flippable 3D for horizontal scroll)                  */
/* ------------------------------------------------------------------ */
const TYPE_ICON = { education: GraduationCap, experience: Briefcase, acheivement: Award, achievement: Award };
const TYPE_CONFIG = {
  education:   { color: '#34d399', gradient: 'from-emerald-500/10 to-teal-500/5' },
  experience:  { color: '#60a5fa', gradient: 'from-blue-500/10 to-indigo-500/5' },
  acheivement: { color: '#fbbf24', gradient: 'from-amber-500/10 to-yellow-500/5' },
  achievement: { color: '#fbbf24', gradient: 'from-amber-500/10 to-yellow-500/5' },
};

const JourneyCard = ({ entry, index }) => {
  const [flipped, setFlipped] = useState(false);
  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.experience;
  const Icon = TYPE_ICON[entry.type] || Briefcase;
  const label = entry.type === 'acheivement' ? 'Achievement' : entry.type.charAt(0).toUpperCase() + entry.type.slice(1);

  return (
    <div className="journey-card flex-shrink-0 w-[85vw] md:w-[55vw] lg:w-[42vw] h-[440px] md:h-[500px] px-4">
      <div
        className="relative w-full h-full cursor-pointer select-none"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* FRONT */}
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className={`absolute inset-0 rounded-3xl border border-neutral-200 dark:border-neutral-800
            bg-gradient-to-br ${cfg.gradient} bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-sm
            p-8 md:p-12 flex flex-col justify-between overflow-hidden`}
          style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
        >
          {/* Giant watermark */}
          <div className="absolute top-2 right-6 text-[10rem] md:text-[14rem] font-black text-black/[0.02] dark:text-white/[0.02] leading-none select-none pointer-events-none">
            {String(index + 1).padStart(2, '0')}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${cfg.color}15` }}>
                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
              </div>
              <span className="text-xs uppercase tracking-[0.2em] font-light" style={{ color: cfg.color }}>
                {label}
              </span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-xs text-neutral-400 font-light flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> {entry.duration}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-light text-black dark:text-white mt-4 leading-snug">
              {entry.title}
            </h3>
            <p className="text-sm text-neutral-500 mt-3 font-light flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" /> {entry.organization}
              {entry.location && <span className="text-neutral-400"> &#8226; {entry.location}</span>}
            </p>
          </div>

          <div className="relative z-10">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light line-clamp-3 mb-6">
              {entry.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {(entry.skills || []).slice(0, 3).map((sk) => (
                  <span key={sk} className="px-2.5 py-1 text-[10px] font-light rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-500">
                    {sk}
                  </span>
                ))}
                {(entry.skills || []).length > 3 && (
                  <span className="px-2.5 py-1 text-[10px] font-light rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-400">
                    +{entry.skills.length - 3}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                Tap to flip <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}40, transparent)` }} />
        </motion.div>

        {/* BACK */}
        <motion.div
          animate={{ rotateY: flipped ? 0 : -180 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 rounded-3xl border border-neutral-200 dark:border-neutral-800
            bg-neutral-50 dark:bg-neutral-950 p-8 md:p-12 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${cfg.color}15` }}>
                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
              </div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-light" style={{ color: cfg.color }}>
                Skills & Details
              </h4>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              {entry.description}
            </p>
          </div>

          {entry.skills && (
            <div className="flex flex-wrap gap-2 mt-6">
              {entry.skills.map((sk) => (
                <span key={sk} className="px-3 py-1.5 text-xs font-light rounded-full border border-neutral-200 dark:border-neutral-800
                  text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
                  {sk}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center text-[10px] text-neutral-400 gap-1 mt-4">
            <ChevronRight className="w-3 h-3 rotate-180" />
            <span>Tap to flip back</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  CERTIFICATION 3D TILT CARD                                         */
/* ------------------------------------------------------------------ */
const CertCard = ({ cert, index }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  const handleMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);
  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.a
      ref={cardRef}
      href={cert.credentialUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="cert-card block relative group"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.23, 1, 0.32, 1] }}
      style={{ perspective: '800px' }}
    >
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
        className="relative p-6 md:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800
          bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900
          transition-colors duration-300 group-hover:border-indigo-300 dark:group-hover:border-indigo-700"
      >
        {/* Holographic shine */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
          pointer-events-none overflow-hidden">
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(115deg, transparent 20%, rgba(129,140,248,0.06) 45%, rgba(244,114,182,0.08) 50%, rgba(129,140,248,0.06) 55%, transparent 80%)' }} />
        </div>

        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4
              group-hover:bg-indigo-500/20 transition-colors duration-300">
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <h3 className="text-base md:text-lg font-light text-black dark:text-white leading-snug">
              {cert.title}
            </h3>
            <p className="mt-2 text-xs text-neutral-500 font-light">
              {cert.issuer} &bull; {cert.date}
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-all duration-300
            group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0 mt-1" />
        </div>

        {/* Bottom glow line */}
        <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-3/4 h-px
          bg-gradient-to-r from-transparent via-indigo-400 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>
    </motion.a>
  );
};

/* ------------------------------------------------------------------ */
/*  ACHIEVEMENT MARQUEE                                                */
/* ------------------------------------------------------------------ */
const AchievementMarquee = ({ items, speed = 30 }) => {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-3">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 flex-shrink-0 group/item cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 group-hover/item:bg-amber-400 transition-colors" />
            <span className="text-sm md:text-base font-light text-neutral-500 dark:text-neutral-400
              group-hover/item:text-black dark:group-hover/item:text-white transition-colors duration-300">
              {item}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};


/* ================================================================== */
/*  MAIN RESUME PAGE                                                   */
/* ================================================================== */
const Resume = () => {
  const heroRef = useRef(null);
  const skillsRef = useRef(null);
  const journeyRef = useRef(null);
  const journeyTrackRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springMouseX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springMouseY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  const allJourney = useMemo(() => {
    const all = experiences.filter(
      (e) => e.type === 'education' || e.type === 'experience' || e.type === 'acheivement' || e.type === 'achievement'
    );
    return all.sort((a, b) => {
      const yA = parseInt(a.duration.match(/\d{4}/)?.[0] || '0', 10);
      const yB = parseInt(b.duration.match(/\d{4}/)?.[0] || '0', 10);
      return yA - yB;
    });
  }, []);

  const categoryColors = useMemo(() => ({
    frontend: '#818cf8', backend: '#34d399', aiml: '#f472b6', tools: '#fbbf24',
  }), []);

  const sections = useMemo(() => [
    { id: 'res-hero', label: 'Overview' },
    { id: 'res-skills', label: 'Skills' },
    { id: 'res-journey', label: 'Journey' },
    { id: 'res-credentials', label: 'Credentials' },
    { id: 'res-contact', label: 'Contact' },
  ], []);

  /* Global cursor tracking */
  useEffect(() => {
    const onMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  /* GSAP master animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero letters */
      gsap.fromTo('.res-hero-letter',
        { y: 100, opacity: 0, rotateX: -90, rotateZ: () => gsap.utils.random(-18, 18), scale: 0.3, z: -120 },
        {
          y: 0, opacity: 1, rotateX: 0, rotateZ: 0, scale: 1, z: 0,
          stagger: { each: 0.02, from: 'random' }, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: heroRef.current, start: 'top 80%' },
        }
      );

      /* Hero eyebrow + desc */
      gsap.fromTo('.res-hero-eyebrow',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: heroRef.current, start: 'top 80%' } }
      );
      gsap.fromTo('.res-hero-desc',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5,
          scrollTrigger: { trigger: heroRef.current, start: 'top 80%' } }
      );

      /* Skills title */
      gsap.fromTo('.skills-title',
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: skillsRef.current, start: 'top 75%' } }
      );

      /* Horizontal journey scroll */
      const track = journeyTrackRef.current;
      const container = journeyRef.current;
      if (track && container) {
        const cards = track.querySelectorAll('.journey-card');
        if (cards.length) {
          const totalWidth = Array.from(cards).reduce((sum, c) => sum + c.offsetWidth, 0);
          const viewWidth = container.offsetWidth;
          const scrollDist = totalWidth - viewWidth + 80;

          gsap.to(track, {
            x: -scrollDist,
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: 'top top',
              end: () => `+=${totalWidth}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              onUpdate: (self) => {
                const bar = container.querySelector('.journey-progress');
                if (bar) bar.style.width = `${self.progress * 100}%`;
              },
            },
          });
        }
      }

      /* Section-tracking nav dots */
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el) {
          ScrollTrigger.create({
            trigger: el,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => setActiveSection(i),
            onEnterBack: () => setActiveSection(i),
          });
        }
      });
    });

    return () => ctx.revert();
  }, [sections]);

  /* Scroll to section */
  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-x-hidden">
      <NoiseSVG />

      {/* Custom cursor follower */}
      <motion.div
        className="hidden lg:block fixed w-5 h-5 rounded-full border border-neutral-400 dark:border-neutral-600
          pointer-events-none z-[999] mix-blend-difference"
        animate={{ x: cursorPos.x - 10, y: cursorPos.y - 10 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />

      {/* Floating nav dots */}
      <nav className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-50 flex-col items-end gap-4">
        {sections.map((s, i) => (
          <button key={s.id} onClick={() => scrollToSection(s.id)}
            className="group flex items-center gap-3 cursor-pointer bg-transparent border-none outline-none">
            <span className={`text-[10px] uppercase tracking-widest transition-all duration-300
              ${activeSection === i ? 'opacity-100 text-black dark:text-white' : 'opacity-0 group-hover:opacity-70 text-neutral-500'}`}>
              {s.label}
            </span>
            <span className={`block rounded-full transition-all duration-300
              ${activeSection === i
                ? 'w-3 h-3 bg-black dark:bg-white'
                : 'w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 group-hover:bg-neutral-600 dark:group-hover:bg-neutral-400'}`} />
          </button>
        ))}
      </nav>


      {/* ============================================================
          HERO
         ============================================================ */}
      <section id="res-hero" ref={heroRef} className="relative min-h-screen flex items-center">
        {/* Ambient blobs */}
        <motion.div className="absolute top-20 right-[15%] w-72 h-72 rounded-full bg-indigo-500/[0.03] blur-3xl pointer-events-none"
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-32 left-[10%] w-96 h-96 rounded-full bg-pink-500/[0.02] blur-3xl pointer-events-none"
          animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32 w-full">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8 overflow-hidden">
            <div className="res-hero-eyebrow w-10 h-px bg-neutral-400 dark:bg-neutral-600" />
            <span className="res-hero-eyebrow text-xs tracking-[0.3em] uppercase text-neutral-500 font-light">
              My Resume
            </span>
          </div>

          {/* Interactive heading */}
          <InteractiveResumeHeading springMouseX={springMouseX} springMouseY={springMouseY} />

          {/* Description + Download */}
          <div className="res-hero-desc mt-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <p className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 font-light max-w-xl leading-relaxed">
              A comprehensive overview of my education, skills, certifications, and achievements.
            </p>

            <MagneticWrap strength={0.4}>
              <a href={personalInfo.resumeUrl} download
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full
                  bg-black dark:bg-white text-white dark:text-black text-sm font-light
                  hover:shadow-[0_0_40px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]
                  transition-shadow duration-500">
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 duration-300" />
                Download Resume
                <span className="block w-0 group-hover:w-4 overflow-hidden transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            </MagneticWrap>
          </div>

          {/* Stats strip */}
          <div className="res-hero-desc mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
            {[
              { label: 'Years Exp', value: '3+' },
              { label: 'Projects', value: '25+' },
              { label: 'Technologies', value: '15+' },
              { label: 'Certifications', value: String(certifications.length) },
            ].map((stat, i) => (
              <motion.div key={i} className="md:px-8 first:md:pl-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <span className="text-3xl md:text-4xl font-extralight text-black dark:text-white">{stat.value}</span>
                <span className="block text-[10px] text-neutral-400 uppercase tracking-widest mt-1">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ============================================================
          SKILLS CONSTELLATION
         ============================================================ */}
      <section id="res-skills" ref={skillsRef} className="relative py-24 lg:py-40">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16 lg:mb-24">
            <div className="skills-title flex items-center gap-4 mb-4">
              <div className="w-12 h-px bg-neutral-400 dark:bg-neutral-600" />
              <span className="text-xs tracking-[0.3em] uppercase text-neutral-500 font-light">Expertise</span>
            </div>
            <h2 className="skills-title text-4xl md:text-5xl lg:text-6xl font-extralight text-black dark:text-white">
              Skills & <span className="font-normal">Technologies</span>
            </h2>
          </div>

          {/* Skill clusters */}
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            {Object.entries(skills).map(([category, skillList], catIdx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, delay: catIdx * 0.15 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[category] }} />
                  <span className="text-sm uppercase tracking-[0.15em] font-light text-neutral-500">
                    {category === 'aiml' ? 'AI / ML' : category}
                  </span>
                  <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-900" />
                  <span className="text-[10px] text-neutral-400 font-light">
                    {skillList.length} skills
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-7 gap-y-5 justify-start">
                  {skillList.map((skill, i) => (
                    <SkillNode
                      key={skill.name}
                      skill={skill}
                      index={i + catIdx * 5}
                      categoryColor={categoryColors[category]}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ============================================================
          JOURNEY (horizontal pinned scroll)
         ============================================================ */}
      <section id="res-journey" ref={journeyRef} className="relative min-h-screen">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />

        <div className="h-screen flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full mb-10">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-px bg-neutral-400 dark:bg-neutral-600" />
                <span className="text-xs tracking-[0.3em] uppercase text-neutral-500 font-light">Timeline</span>
              </div>
              <div className="flex items-end justify-between">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-black dark:text-white">
                  My <span className="font-normal">Journey</span>
                </h2>
                <p className="hidden md:block text-sm text-neutral-400 font-light">
                  Scroll to explore &bull; Click cards to flip
                </p>
              </div>
            </motion.div>
          </div>

          {/* Horizontal track */}
          <div className="overflow-hidden">
            <div ref={journeyTrackRef} className="flex items-center pl-[5vw]">
              {allJourney.map((entry, i) => (
                <JourneyCard key={`${entry.id}-${entry.type}`} entry={entry} index={i} />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full mt-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-light">
                {allJourney[0]?.duration?.match(/\d{4}/)?.[0] || ''}
              </span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800 relative overflow-hidden">
                <div className="journey-progress absolute top-0 left-0 h-full bg-neutral-500 dark:bg-neutral-500" style={{ width: '0%' }} />
              </div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-light">Present</span>
            </div>
          </div>
        </div>
      </section>


      {/* ============================================================
          CERTIFICATIONS & ACHIEVEMENTS
         ============================================================ */}
      <section id="res-credentials" className="relative py-24 lg:py-40">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Certifications */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-px bg-neutral-400 dark:bg-neutral-600" />
                  <span className="text-xs tracking-[0.3em] uppercase text-neutral-500 font-light">Verified</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extralight text-black dark:text-white mb-12">
                  Certifications
                </h2>
              </motion.div>

              <div className="space-y-6">
                {certifications.map((cert, i) => (
                  <CertCard key={cert.id} cert={cert} index={i} />
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-px bg-neutral-400 dark:bg-neutral-600" />
                  <span className="text-xs tracking-[0.3em] uppercase text-neutral-500 font-light">Milestones</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extralight text-black dark:text-white mb-12">
                  Achievements
                </h2>
              </motion.div>

              <div className="space-y-3">
                {achievements.map((ach, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30, rotateY: -10 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ x: 8, scale: 1.02 }}
                    className="group flex items-center gap-4 p-5 rounded-xl border border-transparent
                      hover:border-neutral-200 dark:hover:border-neutral-800
                      hover:bg-neutral-50 dark:hover:bg-neutral-950
                      transition-all duration-300 cursor-default"
                    style={{ perspective: '600px' }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center
                      group-hover:bg-amber-500/20 transition-colors duration-300">
                      <span className="text-amber-500 text-xs font-medium">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <span className="text-sm md:text-base font-light text-neutral-600 dark:text-neutral-400
                      group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                      {ach}
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-700 opacity-0 group-hover:opacity-100
                      ml-auto transition-all duration-300 group-hover:translate-x-1 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>

              {/* Scrolling marquee */}
              <div className="mt-12 border-t border-b border-neutral-100 dark:border-neutral-900 py-1">
                <AchievementMarquee items={achievements} speed={30} />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ============================================================
          CTA
         ============================================================ */}
      <section id="res-contact" className="relative py-32 lg:py-48 bg-black dark:bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white dark:text-black leading-tight">
              Interested in<br />
              <span className="font-normal">working together?</span>
            </h2>
            <p className="mt-6 text-neutral-400 dark:text-neutral-600 font-light max-w-md mx-auto">
              Let's discuss how I can contribute to your team and bring ideas to life.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticWrap strength={0.5}>
                <Link to="/contact"
                  className="group inline-flex items-center gap-3 px-10 py-5 rounded-full
                    bg-white dark:bg-black text-black dark:text-white text-sm font-light
                    hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] dark:hover:shadow-[0_0_50px_rgba(0,0,0,0.2)]
                    transition-shadow duration-500">
                  Get in Touch
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
                </Link>
              </MagneticWrap>

              <MagneticWrap strength={0.5}>
                <a href={`mailto:${personalInfo.email}`}
                  className="group inline-flex items-center gap-3 px-10 py-5 rounded-full
                    border border-neutral-700 dark:border-neutral-300
                    text-white dark:text-black text-sm font-light
                    hover:bg-white/5 dark:hover:bg-black/5 transition-colors duration-300">
                  {personalInfo.email}
                </a>
              </MagneticWrap>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Resume;
