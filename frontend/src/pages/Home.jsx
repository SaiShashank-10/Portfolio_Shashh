import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Layers,
  Brain,
  Globe,
  Palette,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Github,
  ChevronDown,
  Zap,
  Send,
  Download,
  Lightbulb,
} from 'lucide-react';
import {
  personalInfo,
  skills,
  techStack,
  services,
  projects,
  experiences,
} from '../data/mock';
import { Button } from '../components/ui/button';
import HeroSection from '../components/sections/HeroSection';

gsap.registerPlugin(ScrollTrigger);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   1. MARQUEE STRIP â€” Infinite scrolling roles/tech
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const MarqueeStrip = () => {
  const items = [
    'WEB DEVELOPER',
    'FULL-STACK',
    'AI / ML',
    'REACT',
    'NEXT.JS',
    'PYTHON',
    'CREATIVE',
    'UI DESIGN',
    'FASTAPI',
    'MONGODB',
  ];
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="relative py-6 overflow-hidden border-y border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
      <div className="marquee-track-home flex items-center gap-8">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="flex-shrink-0 text-sm md:text-base font-light tracking-[0.2em] text-neutral-300 dark:text-neutral-700 uppercase whitespace-nowrap select-none"
          >
            {item}
            <span className="ml-8 text-neutral-200 dark:text-neutral-800">âœ¦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   2. ABOUT PREVIEW â€” Word-by-word scroll reveal
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const AboutPreview = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = sectionRef.current;
    const handleMouseMove = (e) => {
      const rect = el?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };
    el?.addEventListener('mousemove', handleMouseMove);
    return () => el?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const words = textRef.current?.querySelectorAll('.reveal-word');
    if (!words?.length) return;

    const ctx = gsap.context(() => {
      gsap.set(words, { opacity: 0.12 });
      gsap.to(words, {
        opacity: 1,
        stagger: 0.04,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          end: 'bottom 45%',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const bioWords = personalInfo.bio.split(' ');

  return (
    <section
      ref={sectionRef}
      className="relative py-32 lg:py-44 overflow-hidden bg-white dark:bg-black"
    >
      {/* Mouse-reactive gradient orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 rounded-full bg-neutral-100 dark:bg-neutral-900/50 blur-3xl pointer-events-none"
        animate={{ x: mousePos.x * 30, y: mousePos.y * 30 }}
        transition={{ type: 'spring', stiffness: 40, damping: 30 }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-neutral-50 dark:bg-neutral-900/30 blur-3xl pointer-events-none"
        animate={{ x: -mousePos.x * 20, y: -mousePos.y * 20 }}
        transition={{ type: 'spring', stiffness: 40, damping: 30 }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-16"
        >
          <div className="w-12 h-px bg-neutral-300 dark:bg-neutral-700" />
          <span className="text-xs font-light text-neutral-400 tracking-[0.3em] uppercase">
            About Me
          </span>
        </motion.div>

        {/* Word-by-word text reveal */}
        <div
          ref={textRef}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light leading-snug text-black dark:text-white"
        >
          {bioWords.map((word, i) => (
            <span key={i} className="reveal-word inline-block mr-[0.3em]">
              {word}
            </span>
          ))}
        </div>

        {/* Link to About page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <Link
            to="/about"
            className="group inline-flex items-center gap-3 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors duration-300"
          >
            <span className="text-sm font-light tracking-wider uppercase">
              Discover More About Me
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   3. SKILLS HOLOGRAPHIC — GSAP-Pinned Horizontal Scroll
   Hexagonal 3D grid, mouse-reactive perspective tilt,
   radar sweep scanner, glitch typing reveals, category morphs
   ═══════════════════════════════════════════════════════════ */
const SkillsHolographic = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 100, damping: 30 });

  const categories = useMemo(() => [
    { key: 'frontend', label: 'FRONTEND', color: '#60a5fa', gradient: 'from-blue-500/20 to-cyan-500/20', icon: Code2, skills: skills.frontend },
    { key: 'backend', label: 'BACKEND', color: '#34d399', gradient: 'from-emerald-500/20 to-teal-500/20', icon: Layers, skills: skills.backend },
    { key: 'aiml', label: 'AI / ML', color: '#c084fc', gradient: 'from-purple-500/20 to-violet-500/20', icon: Brain, skills: skills.aiml },
    { key: 'tools', label: 'DEV TOOLS', color: '#fbbf24', gradient: 'from-amber-500/20 to-orange-500/20', icon: Globe, skills: skills.tools },
  ], []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered hex entry from scattered positions
      gsap.fromTo('.hex-skill',
        { scale: 0, opacity: 0, y: () => gsap.utils.random(-100, 100), x: () => gsap.utils.random(-100, 100), rotation: () => gsap.utils.random(-45, 45) },
        {
          scale: 1, opacity: 1, y: 0, x: 0, rotation: 0,
          duration: 1, stagger: { each: 0.08, from: 'center' }, ease: 'elastic.out(1, 0.6)',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', toggleActions: 'play none none reverse' }
        }
      );
      // Scanner line sweep
      gsap.fromTo('.scanner-line',
        { left: '-10%' },
        {
          left: '110%', duration: 3, repeat: -1, ease: 'power1.inOut',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', toggleActions: 'play pause resume pause' }
        }
      );
      // Category labels slide in
      gsap.fromTo('.cat-label',
        { x: -60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', toggleActions: 'play none none reverse' }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const current = categories[activeCategory];

  return (
    <section ref={sectionRef} className="relative py-32 lg:py-48 overflow-hidden bg-[#030303]">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      
      {/* Animated gradient blobs */}
      <motion.div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
        animate={{ x: [0, 50, 0], y: [0, -30, 0], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: current.color }} />
      <motion.div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none"
        animate={{ x: [0, -40, 0], y: [0, 40, 0], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: current.color }} />

      {/* Scanner line */}
      <div className="scanner-line absolute top-0 bottom-0 w-px pointer-events-none z-30"
        style={{ background: `linear-gradient(to bottom, transparent, ${current.color}60, transparent)` }}>
        <div className="absolute inset-y-0 -left-12 w-24"
          style={{ background: `linear-gradient(to right, transparent, ${current.color}08, transparent)` }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={containerRef}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: current.color }} />
              <span className="text-xs font-mono tracking-[0.3em] uppercase" style={{ color: current.color }}>
                Skills & Technologies
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extralight text-white leading-none">
              Tech<br/>
              <span className="font-light italic" style={{ color: current.color }}>Arsenal</span>
            </h2>
          </motion.div>

          <Link to="/about" className="group flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors self-start lg:self-end">
            <span className="font-mono tracking-wider uppercase text-xs">Explore All</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Category Tabs — Neon style */}
        <div className="flex flex-wrap gap-2 mb-16">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const isActive = activeCategory === i;
            return (
              <button key={cat.key} onClick={() => setActiveCategory(i)}
                className={`cat-label relative flex items-center gap-2.5 px-5 py-3 rounded-lg text-xs font-mono tracking-wider uppercase transition-all duration-500 border ${
                  isActive
                    ? 'text-white border-transparent'
                    : 'text-neutral-600 border-neutral-800 hover:border-neutral-700 hover:text-neutral-400'}`}
                style={isActive ? { background: `${cat.color}15`, borderColor: `${cat.color}40`, boxShadow: `0 0 20px ${cat.color}15, inset 0 0 20px ${cat.color}05` } : {}}>
                <Icon className="w-3.5 h-3.5" style={isActive ? { color: cat.color } : {}} />
                {cat.label}
                {isActive && <div className="absolute -bottom-px left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }} />}
              </button>
            );
          })}
        </div>

        {/* Skills Grid — 3D Perspective Tilt */}
        <motion.div style={{ perspective: 1200, rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory}
              initial={{ opacity: 0, scale: 0.95, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotateY: -15 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              {current.skills.map((skill, i) => (
                <motion.div key={skill.name}
                  className="hex-skill group relative"
                  onHoverStart={() => setHoveredSkill(skill.name)}
                  onHoverEnd={() => setHoveredSkill(null)}
                  whileHover={{ scale: 1.08, y: -8, z: 40 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className={`relative h-44 rounded-2xl border overflow-hidden transition-all duration-500 ${
                    hoveredSkill === skill.name
                      ? 'border-transparent shadow-2xl'
                      : 'border-neutral-800 hover:border-neutral-700'}`}
                    style={hoveredSkill === skill.name ? {
                      borderColor: `${current.color}50`,
                      boxShadow: `0 20px 60px -10px ${current.color}20, 0 0 0 1px ${current.color}30`
                    } : {}}>
                    {/* Background glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at 50% 120%, ${current.color}15, transparent 70%)` }} />
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                      {/* Animated circular progress */}
                      <div className="relative w-20 h-20 mb-4">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                          <motion.circle cx="50" cy="50" r="42" fill="none" strokeWidth="3" strokeLinecap="round"
                            stroke={current.color}
                            strokeDasharray={`${skill.level * 2.64} 264`}
                            initial={{ strokeDasharray: '0 264' }}
                            whileInView={{ strokeDasharray: `${skill.level * 2.64} 264` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' }}
                          />
                        </svg>
                        {/* Center percentage */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-light text-white">{skill.level}</span>
                          <span className="text-[10px] text-neutral-500 ml-0.5">%</span>
                        </div>
                      </div>
                      {/* Skill name */}
                      <span className="text-xs font-mono tracking-wider text-neutral-400 group-hover:text-white transition-colors text-center">
                        {skill.name}
                      </span>
                    </div>

                    {/* Top accent line */}
                    <motion.div className="absolute top-0 left-0 h-[2px]"
                      style={{ background: current.color }}
                      initial={{ width: '0%' }}
                      animate={hoveredSkill === skill.name ? { width: '100%' } : { width: '0%' }}
                      transition={{ duration: 0.4 }} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Tech Stack — Floating Pills */}
        <motion.div className="mt-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-3 h-3" style={{ color: current.color }} />
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-600">Full Tech Stack</span>
          </div>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030303] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030303] to-transparent z-10" />
            <div className="flex gap-3 animate-marquee-slow">
              {[...techStack, ...techStack, ...techStack].map((tech, i) => (
                <span key={i} className="flex-shrink-0 px-4 py-2 rounded-lg text-[11px] font-mono tracking-wider
                  bg-white/[0.03] border border-white/[0.06] text-neutral-500 hover:text-white
                  hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 cursor-default whitespace-nowrap">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


/* ═══════════════════════════════════════════════════════════
   4. PROJECTS IMMERSIVE — GSAP-Pinned Horizontal Scroll
   Full-viewport project cards with parallax depth,
   scroll-driven transitions, mouse tilt & cinematic reveals
   ═══════════════════════════════════════════════════════════ */
const ProjectsImmersive = () => {
  const sectionRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [activeProject, setActiveProject] = useState(0);
  const featuredProjects = projects.filter((p) => p.featured);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('.project-panel');
      if (panels.length === 0) return;

      // Pin section and scroll horizontally
      gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (panels.length - 1),
          end: () => "+=" + (sectionRef.current?.offsetWidth || 0) * (panels.length - 1),
          onUpdate: (self) => {
            const idx = Math.round(self.progress * (panels.length - 1));
            setActiveProject(idx);
          }
        }
      });

      // Each panel's content entrance
      panels.forEach((panel) => {
        const img = panel.querySelector('.project-img');
        const content = panel.querySelector('.project-content');
        if (img) {
          gsap.fromTo(img, { scale: 1.3, opacity: 0.5 }, {
            scale: 1, opacity: 1, ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: true }
          });
        }
        if (content) {
          gsap.fromTo(content, { y: 60, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: true }
          });
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black">
      <div ref={scrollContainerRef} className="flex" style={{ width: `${featuredProjects.length * 100}vw` }}>
        {featuredProjects.map((project, i) => (
          <div key={project.id} className="project-panel relative w-screen h-screen flex-shrink-0 flex items-center justify-center overflow-hidden">
            {/* Full-bleed background image */}
            <div className="absolute inset-0">
              <div className="project-img absolute inset-0">
                <img src={project.image} alt={project.title}
                  className="w-full h-full object-cover opacity-30" loading="lazy" />
              </div>
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
            </div>

            {/* Giant background number */}
            <div className="absolute right-8 lg:right-20 top-1/2 -translate-y-1/2 pointer-events-none select-none">
              <span className="text-[15rem] md:text-[20rem] lg:text-[28rem] font-extralight leading-none text-white/[0.03]">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Content */}
            <div className="project-content relative z-10 max-w-7xl mx-auto px-8 lg:px-16 w-full">
              <div className="max-w-2xl">
                {/* Project counter */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-sm font-mono tracking-wider" style={{ color: '#60a5fa' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-12 h-px bg-neutral-700" />
                  <span className="text-xs font-mono text-neutral-600 tracking-wider uppercase">Featured Project</span>
                </div>

                {/* Title */}
                <h3 className="text-4xl md:text-5xl lg:text-7xl font-extralight text-white mb-6 leading-none">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-base md:text-lg font-light text-neutral-400 leading-relaxed mb-8 max-w-lg">
                  {project.description}
                </p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2 mb-10">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="px-3 py-1.5 rounded-md text-[10px] font-mono tracking-wider uppercase
                      bg-white/[0.05] border border-white/[0.08] text-neutral-400">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  {project.liveDemo && (
                    <a href={project.liveDemo} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-mono tracking-wider
                        bg-white text-black hover:bg-neutral-200 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      VIEW LIVE
                    </a>
                  )}
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-mono tracking-wider
                        border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white transition-all">
                      <Github className="w-3.5 h-3.5" />
                      SOURCE
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Scroll progress dots - bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              {featuredProjects.map((_, di) => (
                <div key={di} className={`transition-all duration-500 rounded-full ${
                  di === activeProject ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-neutral-700'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* View All Overlay */}
      <div className="absolute bottom-8 right-8 z-20">
        <Link to="/projects"
          className="group flex items-center gap-2 text-xs font-mono tracking-wider text-neutral-600 hover:text-white transition-colors">
          ALL PROJECTS
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
};


/* ═══════════════════════════════════════════════════════════
   5. SERVICES CONSTELLATION — 3D interactive node network
   with holographic mouse-tilt, GSAP elastic entrance,
   SVG energy lines, orbiting particles, expand-on-click
   ═══════════════════════════════════════════════════════════ */
const serviceIcons = { Code2, Layers, Brain, Globe, Palette, MessageSquare };

const ServicesGrid = () => {
  const sectionRef = useRef(null);
  const nodesRef = useRef([]);
  const [activeId, setActiveId] = useState(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 35, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 35, damping: 20 });
  const sceneRx = useTransform(springY, [0, 1], [8, -8]);
  const sceneRy = useTransform(springX, [0, 1], [-8, 8]);

  const serviceColors = ['#60a5fa', '#34d399', '#c084fc', '#fbbf24', '#f472b6'];
  const nodePositions = [
    { cx: 50, cy: 8 },
    { cx: 86, cy: 36 },
    { cx: 72, cy: 82 },
    { cx: 28, cy: 82 },
    { cx: 14, cy: 36 },
  ];
  const hub = { cx: 50, cy: 46 };

  useEffect(() => {
    const ctx = gsap.context(() => {
      nodesRef.current.forEach((node, i) => {
        if (!node) return;
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        gsap.fromTo(node,
          { x: Math.cos(angle) * 500, y: Math.sin(angle) * 500, opacity: 0, scale: 0, rotation: 120 + i * 40 },
          {
            x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
            duration: 1.4, delay: 0.2 + i * 0.1, ease: 'elastic.out(1, 0.5)',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
          }
        );
      });
      gsap.utils.toArray('.svc-line').forEach((line, i) => {
        const length = line.getTotalLength();
        gsap.fromTo(line,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0, duration: 1, delay: 0.5 + i * 0.06, ease: 'power2.inOut',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouseX.set((e.clientX - r.left) / r.width);
      mouseY.set((e.clientY - r.top) / r.height);
    };
    const onLeave = () => { mouseX.set(0.5); mouseY.set(0.5); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [mouseX, mouseY]);

  return (
    <section ref={sectionRef} className="relative py-32 lg:py-48 overflow-hidden bg-[#060606]"
      onClick={() => setActiveId(null)}>

      {/* Ambient color orbs */}
      {serviceColors.map((c, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{ background: c, width: 300 + i * 40, height: 300 + i * 40, filter: 'blur(150px)', opacity: 0.03,
            left: `${nodePositions[i].cx - 10}%`, top: `${nodePositions[i].cy}%` }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }} />
      ))}

      {/* Dot grid for depth */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 lg:mb-24 gap-6">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center gap-3 mb-4">
              <motion.div className="w-2 h-2 rounded-full bg-purple-500"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-xs font-mono text-neutral-500 tracking-[0.3em] uppercase">What I Offer</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extralight text-white leading-none">
              Services &<br />
              <span className="italic font-light text-neutral-500">Expertise</span>
            </h2>
          </motion.div>
          <Link to="/services" className="group flex items-center gap-2 text-sm text-neutral-600 hover:text-white transition-colors self-start lg:self-end">
            <span className="font-mono tracking-wider uppercase text-xs">View All</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* ═══ 3D Constellation — Desktop ═══ */}
        <motion.div className="hidden lg:block relative" style={{ perspective: 1000, height: 650 }}>
          <motion.div className="relative w-full h-full"
            style={{ rotateX: sceneRx, rotateY: sceneRy, transformStyle: 'preserve-3d' }}>

            {/* SVG constellation lines & orbit ring */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <ellipse cx="50%" cy="46%" rx="38%" ry="33%" fill="none"
                stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" strokeDasharray="4 8" />
              {nodePositions.map((pos, i) => (
                <line key={`h-${i}`} className="svc-line"
                  x1={`${hub.cx}%`} y1={`${hub.cy}%`}
                  x2={`${pos.cx}%`} y2={`${pos.cy}%`}
                  stroke={serviceColors[i]} strokeWidth="0.5" strokeOpacity="0.15" />
              ))}
              {nodePositions.map((pos, i) => {
                const next = nodePositions[(i + 1) % 5];
                return (
                  <line key={`e-${i}`} className="svc-line"
                    x1={`${pos.cx}%`} y1={`${pos.cy}%`}
                    x2={`${next.cx}%`} y2={`${next.cy}%`}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                );
              })}
            </svg>

            {/* Central hub pulse */}
            <div className="absolute pointer-events-none"
              style={{ left: `${hub.cx}%`, top: `${hub.cy}%`, transform: 'translate(-50%,-50%)' }}>
              <motion.div className="w-4 h-4 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.5), transparent)' }}
                animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0.1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
              <motion.div className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.6), transparent)' }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />
            </div>

            {/* Service nodes */}
            {services.map((service, i) => {
              const Icon = serviceIcons[service.icon] || Globe;
              const color = serviceColors[i];
              const pos = nodePositions[i];
              const isActive = activeId === service.id;
              const expandUp = pos.cy > 60;

              return (
                <motion.div key={service.id} ref={(el) => (nodesRef.current[i] = el)}
                  className="absolute cursor-pointer"
                  style={{ left: `${pos.cx}%`, top: `${pos.cy}%`, x: '-50%', y: '-50%',
                    zIndex: isActive ? 50 : 10, transformStyle: 'preserve-3d' }}
                  onClick={(e) => { e.stopPropagation(); setActiveId(isActive ? null : service.id); }}>

                  {/* Float bob */}
                  <motion.div animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: 'easeInOut' }}>
                    <motion.div className="relative flex flex-col items-center"
                      whileHover={{ scale: 1.15, z: 50 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}>

                      {/* Under-glow */}
                      <motion.div className="absolute rounded-full pointer-events-none"
                        style={{ width: 130, height: 130,
                          background: `radial-gradient(circle, ${color}25, transparent 70%)`,
                          filter: 'blur(25px)', top: -25, left: '50%', x: '-50%' }}
                        animate={isActive
                          ? { scale: [1, 1.6, 1], opacity: [0.5, 0.9, 0.5] }
                          : { opacity: 0.25 }}
                        transition={{ duration: 2, repeat: isActive ? Infinity : 0 }} />

                      {/* Number badge */}
                      <span className="absolute -top-2 -right-4 text-[10px] font-mono tracking-wider transition-colors duration-300"
                        style={{ color: isActive ? color : 'rgba(255,255,255,0.1)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      {/* Icon orb */}
                      <motion.div
                        className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center border backdrop-blur-sm"
                        style={{
                          background: isActive ? `${color}12` : 'rgba(255,255,255,0.02)',
                          borderColor: isActive ? `${color}50` : 'rgba(255,255,255,0.08)',
                          boxShadow: isActive
                            ? `0 0 40px ${color}20, 0 0 80px ${color}08, inset 0 0 20px ${color}08`
                            : 'none',
                        }}
                        whileHover={{ borderColor: `${color}60`, boxShadow: `0 0 35px ${color}25` }}>
                        <Icon className="w-6 h-6" style={{ color }} />
                        {/* Orbiting particle */}
                        <div className="absolute inset-0 service-orbit-ring pointer-events-none"
                          style={{ animationDuration: `${4 + i}s` }}>
                          <div className="absolute w-1 h-1 rounded-full"
                            style={{ background: color, top: -0.5, left: 'calc(50% - 2px)' }} />
                        </div>
                      </motion.div>

                      {/* Title label */}
                      <span className="mt-3 text-[11px] font-mono tracking-wider text-center whitespace-nowrap transition-colors duration-300"
                        style={{ color: isActive ? color : 'rgba(255,255,255,0.35)' }}>
                        {service.title}
                      </span>

                      {/* Expanded detail panel */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: expandUp ? -8 : 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: expandUp ? -8 : 8 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            className="absolute w-64 rounded-xl border backdrop-blur-xl p-5"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              background: 'rgba(8,8,8,0.92)',
                              borderColor: `${color}20`,
                              boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${color}06`,
                              left: '50%', x: '-50%',
                              ...(expandUp
                                ? { bottom: '100%', marginBottom: 12 }
                                : { top: '100%', marginTop: 12 }),
                            }}>
                            {/* Accent line */}
                            <div className="absolute left-4 right-4 h-[1px]"
                              style={{
                                background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
                                ...(expandUp ? { bottom: 0 } : { top: 0 }),
                              }} />
                            <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">{service.description}</p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {service.features.map((f, fi) => (
                                <motion.span key={fi}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.08 + fi * 0.05, type: 'spring', stiffness: 250 }}
                                  className="px-2 py-1 rounded-md text-[9px] font-mono tracking-wider border"
                                  style={{ background: `${color}08`, borderColor: `${color}15`, color }}>
                                  {f}
                                </motion.span>
                              ))}
                            </div>
                            <Link to="/services"
                              className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest transition-all hover:gap-2.5"
                              style={{ color }}>
                              EXPLORE <ArrowRight className="w-3 h-3" />
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* ═══ Mobile layout ═══ */}
        <div className="lg:hidden space-y-6">
          {services.map((service, i) => {
            const Icon = serviceIcons[service.icon] || Globe;
            const color = serviceColors[i];
            const isActive = activeId === service.id;
            return (
              <motion.div key={service.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => setActiveId(isActive ? null : service.id)}>
                <motion.div className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center border"
                  style={{
                    background: isActive ? `${color}12` : 'rgba(255,255,255,0.02)',
                    borderColor: isActive ? `${color}40` : 'rgba(255,255,255,0.08)',
                    boxShadow: isActive ? `0 0 25px ${color}15` : 'none',
                  }}
                  whileTap={{ scale: 0.92 }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </motion.div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-neutral-600">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="text-sm font-light text-white">{service.title}</h3>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">{service.description}</p>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mt-3 overflow-hidden">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {service.features.map((f, fi) => (
                            <motion.span key={fi}
                              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: fi * 0.04 }}
                              className="px-2 py-1 rounded text-[9px] font-mono tracking-wider"
                              style={{ background: `${color}10`, color }}>
                              {f}
                            </motion.span>
                          ))}
                        </div>
                        <Link to="/services" className="text-[10px] font-mono tracking-widest inline-flex items-center gap-1.5" style={{ color }}>
                          LEARN MORE <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


/* ═══════════════════════════════════════════════════════════
   6. EXPERIENCE CINEMATIC — Horizontal scroll filmstrip
   GSAP-pinned horizontal scroll with each experience as
   a "film frame", scroll-driven progress, staggered reveals
   ═══════════════════════════════════════════════════════════ */
const ExperienceCinematic = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [activeExp, setActiveExp] = useState(0);

  const typeConfig = {
    experience: { color: '#60a5fa', label: 'WORK', icon: '◆' },
    education: { color: '#34d399', label: 'EDU', icon: '▲' },
    acheivement: { color: '#fbbf24', label: 'WIN', icon: '★' },
    achievement: { color: '#fbbf24', label: 'WIN', icon: '★' },
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;
      const cards = gsap.utils.toArray('.exp-card');
      if (cards.length === 0) return;

      const totalScroll = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1.5,
          end: () => `+=${totalScroll}`,
          onUpdate: (self) => {
            const idx = Math.min(Math.round(self.progress * (cards.length - 1)), cards.length - 1);
            setActiveExp(idx);
          }
        }
      });

      // Card entrance animations
      cards.forEach((card, i) => {
        gsap.fromTo(card.querySelector('.exp-card-inner'),
          { y: 30, opacity: 0, rotateY: -5, scale: 0.95 },
          {
            y: 0, opacity: 1, rotateY: 0, scale: 1,
            duration: 0.8, delay: i * 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '+=300', scrub: 1 }
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden bg-[#030303]">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Top bar - section info */}
      <div className="absolute top-0 left-0 right-0 z-20 p-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-neutral-600 tracking-[0.3em] uppercase">Journey</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extralight text-white">
            Experience & <span className="italic text-neutral-500">Education</span>
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <span className="text-3xl font-extralight text-white">{String(activeExp + 1).padStart(2, '0')}</span>
            <span className="text-xs text-neutral-600 font-mono"> / {String(experiences.length).padStart(2, '0')}</span>
          </div>
          <Link to="/experience" className="group flex items-center gap-2 text-xs font-mono text-neutral-600 hover:text-white transition-colors tracking-wider">
            FULL JOURNEY <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-neutral-900 z-30">
        <motion.div className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500"
          style={{ width: `${((activeExp + 1) / experiences.length) * 100}%` }}
          transition={{ duration: 0.3 }} />
      </div>

      {/* Horizontal track */}
      <div ref={trackRef} className="flex items-center h-full pt-28 pb-16 gap-8 px-8 lg:px-16" style={{ width: 'max-content' }}>
        {experiences.map((exp, i) => {
          const config = typeConfig[exp.type] || typeConfig.experience;
          return (
            <div key={exp.id + '-' + i} className="exp-card flex-shrink-0 w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw] h-full flex items-center">
              <div className="exp-card-inner w-full" style={{ perspective: '1000px' }}>
                <motion.div
                  className="relative rounded-2xl border border-neutral-800 overflow-hidden h-full"
                  whileHover={{ scale: 1.02, rotateY: 2, transition: { duration: 0.4 } }}
                  style={{ background: `linear-gradient(135deg, ${config.color}05, transparent, ${config.color}03)` }}
                >
                  {/* Type indicator */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                    style={{ background: `linear-gradient(90deg, ${config.color}, transparent)` }} />

                  <div className="p-8 lg:p-10 flex flex-col h-[420px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-base" style={{ color: config.color }}>{config.icon}</span>
                        <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: config.color }}>
                          {config.label}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-neutral-700">{exp.duration}</span>
                    </div>

                    {/* Big number */}
                    <span className="text-6xl font-extralight text-white/[0.04] leading-none mb-4 select-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Content */}
                    <h3 className="text-xl lg:text-2xl font-light text-white mb-2 leading-snug">{exp.title}</h3>
                    <p className="text-sm font-light text-neutral-500 mb-3">{exp.organization} — {exp.location}</p>
                    <p className="text-sm font-light text-neutral-600 leading-relaxed flex-1 line-clamp-4">{exp.description}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-6">
                      {exp.skills.slice(0, 5).map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider"
                          style={{ background: `${config.color}10`, color: `${config.color}cc` }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-neutral-700">
        <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ArrowRight className="w-3 h-3" />
        </motion.div>
        <span className="text-[10px] font-mono tracking-wider uppercase">Scroll to explore</span>
      </div>
    </section>
  );
};


/* ═══════════════════════════════════════════════════════════
   7. CONTACT PORTAL — Magnetic CTA with orbiting text,
   particle field, interactive letter physics,
   gravitational cursor distortion & portal effect
   ═══════════════════════════════════════════════════════════ */
const ContactPortal = () => {
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [hoveredButton, setHoveredButton] = useState(null);
  const mouseXSpring = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const mouseYSpring = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
      mouseXSpring.set((x - 0.5) * 40);
      mouseYSpring.set((y - 0.5) * 40);
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, [mouseXSpring, mouseYSpring]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Letter-by-letter entrance with 3D flip
      gsap.fromTo('.portal-letter',
        { y: 120, opacity: 0, rotateX: -90, scale: 0.5 },
        {
          y: 0, opacity: 1, rotateX: 0, scale: 1,
          duration: 0.8, stagger: 0.025, ease: 'back.out(2)',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', toggleActions: 'play none none reverse' }
        }
      );
      // Portal rings
      gsap.fromTo('.portal-ring',
        { scale: 0, opacity: 0, rotation: -90 },
        {
          scale: 1, opacity: 1, rotation: 0,
          duration: 1.2, stagger: 0.2, ease: 'elastic.out(1, 0.6)',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', toggleActions: 'play none none reverse' }
        }
      );
      // CTA buttons float up
      gsap.fromTo('.portal-cta',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 50%', toggleActions: 'play none none reverse' }
        }
      );
      // Floating particles
      gsap.utils.toArray('.portal-particle').forEach(p => {
        gsap.to(p, {
          y: 'random(-40, 40)', x: 'random(-30, 30)', rotation: 'random(-180, 180)',
          duration: 'random(4, 8)', repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const line1 = "Let's Build";
  const line2 = "Something Epic";

  return (
    <section ref={sectionRef} className="relative py-40 lg:py-56 overflow-hidden bg-black min-h-screen flex items-center">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <motion.div className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(96,165,250,0.06), transparent), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(192,132,252,0.06), transparent)',
              'radial-gradient(ellipse 80% 60% at 60% 30%, rgba(192,132,252,0.06), transparent), radial-gradient(ellipse 60% 80% at 30% 70%, rgba(96,165,250,0.06), transparent)',
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(96,165,250,0.06), transparent), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(192,132,252,0.06), transparent)',
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      {/* Portal rings — decorative orbiting rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[280, 380, 500].map((size, i) => (
          <motion.div key={i} className="portal-ring absolute rounded-full border"
            style={{
              width: size, height: size, left: -size / 2, top: -size / 2,
              borderColor: `rgba(255,255,255,${0.03 - i * 0.008})`,
            }}
            animate={{ rotate: [0, i % 2 === 0 ? 360 : -360] }}
            transition={{ duration: 30 + i * 15, repeat: Infinity, ease: 'linear' }} />
        ))}
      </div>

      {/* Mouse-reactive gradient spotlight */}
      <motion.div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none blur-[140px] opacity-30"
        animate={{ x: (mousePos.x - 0.5) * 300, y: (mousePos.y - 0.5) * 200 }}
        transition={{ type: 'spring', stiffness: 30, damping: 20 }}
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.15), rgba(192,132,252,0.1), transparent)', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />

      {/* Floating particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="portal-particle absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
            background: `rgba(255,255,255,${Math.random() * 0.08 + 0.02})`,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`
          }} />
      ))}

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8 text-center">
        {/* Label */}
        <motion.div className="flex items-center justify-center gap-3 mb-12"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="w-8 h-px bg-neutral-800" />
          <span className="text-[10px] font-mono text-neutral-600 tracking-[0.4em] uppercase">Get In Touch</span>
          <div className="w-8 h-px bg-neutral-800" />
        </motion.div>

        {/* Giant heading with per-letter interactivity */}
        <div style={{ perspective: '1200px' }} className="mb-6">
          <motion.div style={{ rotateX: mouseYSpring, rotateY: mouseXSpring }} className="inline-block">
            <div className="flex flex-wrap items-center justify-center">
              {line1.split('').map((char, i) => (
                <motion.span key={`a-${i}`}
                  className="portal-letter text-5xl md:text-7xl lg:text-[7rem] font-extralight text-white inline-block cursor-default"
                  style={{ width: char === ' ' ? '0.35em' : 'auto' }}
                  whileHover={{ y: -15, scale: 1.15, color: '#60a5fa', transition: { duration: 0.15, type: 'spring', stiffness: 400 } }}>
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center -mt-2">
              {line2.split('').map((char, i) => (
                <motion.span key={`b-${i}`}
                  className="portal-letter text-5xl md:text-7xl lg:text-[7rem] font-extralight italic text-neutral-600 inline-block cursor-default"
                  style={{ width: char === ' ' ? '0.35em' : 'auto' }}
                  whileHover={{ y: -15, scale: 1.15, color: '#c084fc', transition: { duration: 0.15, type: 'spring', stiffness: 400 } }}>
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Subtext */}
        <motion.p className="text-neutral-600 font-light text-sm md:text-base max-w-md mx-auto mb-14 font-mono tracking-wide"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.4 }}>
          Have a vision? Let's turn it into reality together.
        </motion.p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
          <Link to="/contact" className="portal-cta">
            <motion.div
              className="relative group px-10 py-5 rounded-full overflow-hidden cursor-pointer"
              onHoverStart={() => setHoveredButton('contact')} onHoverEnd={() => setHoveredButton(null)}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-full p-[1px] overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc, #f472b6, #60a5fa)', backgroundSize: '200% 200%', animation: 'gradient-rotate 4s linear infinite' }}>
                <div className="w-full h-full rounded-full bg-black" />
              </div>
              {/* Hover fill */}
              <motion.div className="absolute inset-[1px] rounded-full"
                animate={hoveredButton === 'contact' ? { opacity: 1 } : { opacity: 0 }}
                style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc)' }}
                transition={{ duration: 0.3 }} />
              <span className="relative z-10 flex items-center gap-3 text-xs font-mono tracking-[0.15em] uppercase text-white">
                <Send className="w-4 h-4" />
                Start Conversation
              </span>
            </motion.div>
          </Link>

          <Link to="/hire-me" className="portal-cta">
            <motion.div
              className="px-10 py-5 rounded-full text-xs font-mono tracking-[0.15em] uppercase text-neutral-600
                border border-neutral-800 hover:border-neutral-600 hover:text-white transition-all duration-500 flex items-center gap-3"
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
              <Zap className="w-4 h-4" />
              Hire Me
            </motion.div>
          </Link>
        </div>

        {/* Info row */}
        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-neutral-700 mb-12"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
          <a href={`mailto:${personalInfo.email}`} className="text-xs font-mono hover:text-white transition-colors tracking-wider">
            {personalInfo.email}
          </a>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-neutral-800" />
          <span className="text-xs font-mono tracking-wider">{personalInfo.location}</span>
        </motion.div>

        {/* Bottom links */}
        <motion.div className="flex items-center justify-center gap-6 flex-wrap"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }}>
          {[
            { to: '/have-an-idea', label: 'Have an Idea?' },
            { to: '/projects', label: 'View Projects' },
            { to: '/resume', label: 'Download Resume' },
          ].map((link, i) => (
            <React.Fragment key={link.to}>
              {i > 0 && <div className="w-1 h-1 rounded-full bg-neutral-900" />}
              <Link to={link.to} className="text-[10px] font-mono text-neutral-800 hover:text-neutral-400 tracking-[0.15em] uppercase transition-colors">
                {link.label}
              </Link>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};


/* ═══════════════════════════════════════════════════
   HOME — Main page component
   ═══════════════════════════════════════════════════ */
const Home = () => {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div>
      <HeroSection />
      <MarqueeStrip />
      <AboutPreview />
      <SkillsHolographic />
      <ProjectsImmersive />
      <ServicesGrid />
      <ExperienceCinematic />
      <ContactPortal />
    </div>
  );
};

export default Home;
