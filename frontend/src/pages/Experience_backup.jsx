import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GraduationCap, Briefcase, Award, Calendar, MapPin, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { experiences } from '../data/mock';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

/* ─── Type Configuration ─── */
const typeConfig = {
  education: { color: '#34d399', label: 'Education', icon: GraduationCap, symbol: '▲', gradient: 'from-emerald-500/20 to-teal-500/10' },
  experience: { color: '#60a5fa', label: 'Experience', icon: Briefcase, symbol: '◆', gradient: 'from-blue-500/20 to-indigo-500/10' },
  acheivement: { color: '#fbbf24', label: 'Achievement', icon: Award, symbol: '★', gradient: 'from-amber-500/20 to-orange-500/10' },
  achievement: { color: '#fbbf24', label: 'Achievement', icon: Award, symbol: '★', gradient: 'from-amber-500/20 to-orange-500/10' },
};

/* ─── Stagger groups by type ─── */
const grouped = {
  education: experiences.filter(e => e.type === 'education'),
  work: experiences.filter(e => e.type === 'experience'),
  awards: experiences.filter(e => e.type === 'acheivement' || e.type === 'achievement'),
};


/* ═══════════════════════════════════════════════════════════════
   EXPERIENCE PAGE — Cinematic Redesign
   ═══════════════════════════════════════════════════════════════ */
const Experience = () => {
  const heroRef = useRef(null);
  const journeyRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const mouseXVal = useMotionValue(0);
  const mouseYVal = useMotionValue(0);
  const smoothX = useSpring(mouseXVal, { stiffness: 40, damping: 20 });
  const smoothY = useSpring(mouseYVal, { stiffness: 40, damping: 20 });

  const filteredExperiences = useMemo(() => {
    if (activeFilter === 'all') return experiences;
    if (activeFilter === 'achievement') return experiences.filter(e => e.type === 'acheivement' || e.type === 'achievement');
    return experiences.filter(e => e.type === activeFilter);
  }, [activeFilter]);

  /* ─── Global Mouse Tracking ─── */
  useEffect(() => {
    const handleMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
      mouseXVal.set((x - 0.5) * 30);
      mouseYVal.set((y - 0.5) * 20);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseXVal, mouseYVal]);

  /* ─── GSAP Hero Animations ─── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero title letter reveal
      gsap.fromTo('.hero-char',
        { y: 120, opacity: 0, rotateX: -90 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.03, ease: 'back.out(1.7)', delay: 0.2 }
      );

      // Stats counter entrance
      gsap.fromTo('.stat-block',
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.stats-row', start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      );

      // Journey section entrance
      gsap.fromTo('.journey-header',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: journeyRef.current, start: 'top 70%', toggleActions: 'play none none reverse' }
        }
      );

      // Each journey card enters with stagger
      gsap.utils.toArray('.journey-card').forEach((card, i) => {
        gsap.fromTo(card,
          { y: 80, opacity: 0, scale: 0.92, rotateX: 8 },
          { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.9, ease: 'power4.out',
            scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' }
          }
        );
      });

      // Decorative floating orbs
      gsap.utils.toArray('.float-orb').forEach((orb) => {
        gsap.to(orb, {
          y: 'random(-30, 30)', x: 'random(-20, 20)', rotation: 'random(-10, 10)',
          duration: 'random(5, 9)', repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      });

      // Progress line fill on scroll
      gsap.fromTo('.progress-line-fill',
        { height: '0%' },
        { height: '100%', ease: 'none',
          scrollTrigger: { trigger: journeyRef.current, start: 'top 40%', end: 'bottom 60%', scrub: 1 }
        }
      );
    });
    return () => ctx.revert();
  }, []);

  /* ─── Cleanup ScrollTrigger on unmount ─── */
  useEffect(() => {
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  const filters = [
    { key: 'all', label: 'All', count: experiences.length },
    { key: 'education', label: 'Education', count: grouped.education.length },
    { key: 'experience', label: 'Work', count: grouped.work.length },
    { key: 'achievement', label: 'Awards', count: grouped.awards.length },
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden">

      {/* ────────────────────────────────────────────────────
          HERO — Dramatic Full-Screen Opening
          ──────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-end pb-20 lg:pb-28 overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
          {/* Ambient lights */}
          <motion.div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full blur-[200px] opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }}
            animate={{ x: (mousePos.x - 0.5) * 80, y: (mousePos.y - 0.5) * 60 }}
            transition={{ type: 'spring', stiffness: 20, damping: 25 }} />
          <motion.div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #34d399, transparent)' }}
            animate={{ x: (mousePos.x - 0.5) * -60, y: (mousePos.y - 0.5) * -40 }}
            transition={{ type: 'spring', stiffness: 15, damping: 20 }} />
        </div>

        {/* Floating decorative particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="float-orb absolute rounded-full pointer-events-none"
            style={{
              width: Math.random() * 4 + 1, height: Math.random() * 4 + 1,
              background: `rgba(255,255,255,${Math.random() * 0.06 + 0.02})`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`
            }} />
        ))}

        {/* Giant background text — decorative */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
          <span className="text-[12rem] md:text-[18rem] lg:text-[24rem] font-extralight leading-none text-white/[0.015] tracking-tighter">
            EXP
          </span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono text-neutral-600 tracking-[0.4em] uppercase">My Journey</span>
            <div className="w-16 h-px bg-neutral-800" />
          </div>

          {/* Main Title — Letter-by-letter with 3D perspective */}
          <div style={{ perspective: '1200px' }}>
            <motion.div style={{ rotateX: smoothY, rotateY: smoothX }}>
              <h1 className="mb-4">
                <div className="flex flex-wrap overflow-hidden">
                  {'Experience'.split('').map((char, i) => (
                    <motion.span key={`e-${i}`}
                      className="hero-char text-5xl md:text-7xl lg:text-[6.5rem] font-extralight text-white inline-block cursor-default"
                      style={{ display: 'inline-block' }}
                      whileHover={{ y: -12, scale: 1.1, color: '#60a5fa', transition: { duration: 0.15, type: 'spring', stiffness: 400 } }}>
                      {char}
                    </motion.span>
                  ))}
                  <span className="hero-char text-5xl md:text-7xl lg:text-[6.5rem] font-extralight text-white inline-block">&nbsp;&amp;&nbsp;</span>
                </div>
                <div className="flex flex-wrap overflow-hidden -mt-2">
                  {'Education'.split('').map((char, i) => (
                    <motion.span key={`d-${i}`}
                      className="hero-char text-5xl md:text-7xl lg:text-[6.5rem] font-extralight italic text-neutral-500 inline-block cursor-default"
                      whileHover={{ y: -12, scale: 1.1, color: '#34d399', transition: { duration: 0.15, type: 'spring', stiffness: 400 } }}>
                      {char}
                    </motion.span>
                  ))}
                </div>
              </h1>
            </motion.div>
          </div>

          {/* Subtitle */}
          <motion.p className="text-neutral-600 font-light text-sm md:text-base max-w-xl leading-relaxed mt-6 font-mono tracking-wide"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}>
            A chronological overview of my professional journey, educational background, 
            and notable achievements shaping my career in technology.
          </motion.p>

          {/* Stats Row */}
          <div className="stats-row flex flex-wrap gap-8 lg:gap-16 mt-14">
            {[
              { value: experiences.filter(e => e.type === 'education').length, label: 'Education', color: '#34d399' },
              { value: experiences.filter(e => e.type === 'experience').length, label: 'Experience', color: '#60a5fa' },
              { value: experiences.filter(e => e.type === 'acheivement' || e.type === 'achievement').length, label: 'Achievements', color: '#fbbf24' },
              { value: experiences.length, label: 'Total Milestones', color: '#f472b6' },
            ].map((stat, i) => (
              <div key={i} className="stat-block">
                <span className="text-3xl md:text-4xl font-extralight text-white">{String(stat.value).padStart(2, '0')}</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: stat.color }} />
                  <span className="text-[10px] font-mono text-neutral-600 tracking-wider uppercase">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <motion.div className="mt-16 flex items-center gap-2 text-neutral-700"
            animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4" />
            <span className="text-[10px] font-mono tracking-wider uppercase">Scroll to explore</span>
          </motion.div>
        </div>
      </section>


      {/* ────────────────────────────────────────────────────
          JOURNEY — Immersive Card-Based Timeline
          ──────────────────────────────────────────────────── */}
      <section ref={journeyRef} className="relative py-32 lg:py-40">
        {/* Vertical progress line */}
        <div className="hidden lg:block absolute left-12 xl:left-20 top-0 bottom-0 w-px bg-neutral-900">
          <div className="progress-line-fill absolute top-0 left-0 w-full bg-gradient-to-b from-blue-500 via-emerald-500 to-amber-500" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header + Filters */}
          <div className="journey-header lg:ml-24 xl:ml-32 mb-20">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-mono text-neutral-600 tracking-[0.3em] uppercase">Timeline</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-white mb-10">
              The <span className="italic text-neutral-500">Path</span> So Far
            </h2>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => {
                const isActive = activeFilter === f.key;
                const color = f.key === 'education' ? '#34d399' : f.key === 'experience' ? '#60a5fa' : f.key === 'achievement' ? '#fbbf24' : '#ffffff';
                return (
                  <button key={f.key} onClick={() => setActiveFilter(f.key)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-mono tracking-wider uppercase transition-all duration-400 border ${
                      isActive ? 'text-white border-transparent' : 'text-neutral-600 border-neutral-800 hover:border-neutral-700 hover:text-neutral-400'
                    }`}
                    style={isActive ? { background: `${color}12`, borderColor: `${color}35`, boxShadow: `0 0 20px ${color}10` } : {}}>
                    {f.label}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/10' : 'bg-neutral-900'}`}>
                      {f.count}
                    </span>
                    {isActive && <div className="absolute -bottom-px left-3 right-3 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {filteredExperiences.map((exp, i) => {
                const config = typeConfig[exp.type] || typeConfig.experience;
                const Icon = config.icon;
                const isExpanded = expandedId === `${exp.id}-${exp.type}-${i}`;
                const uniqueId = `${exp.id}-${exp.type}-${i}`;

                return (
                  <ExperienceCard
                    key={uniqueId}
                    exp={exp}
                    index={i}
                    config={config}
                    Icon={Icon}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedId(isExpanded ? null : uniqueId)}
                    total={filteredExperiences.length}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>


      {/* ────────────────────────────────────────────────────
          BOTTOM CTA
          ──────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #60a5fa, #c084fc)' }} />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[10px] font-mono text-neutral-700 tracking-[0.4em] uppercase">What's Next?</span>
            <h3 className="text-3xl md:text-4xl font-extralight text-white mt-4 mb-6">
              Let's create something<br/><span className="italic text-neutral-500">extraordinary</span> together
            </h3>
            <div className="flex items-center justify-center gap-4">
              <Link to="/contact"
                className="group px-8 py-4 rounded-full text-xs font-mono tracking-wider uppercase text-white
                  border border-neutral-700 hover:border-neutral-500 hover:bg-white/5 transition-all duration-400 flex items-center gap-2">
                Get In Touch
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/projects"
                className="px-8 py-4 rounded-full text-xs font-mono tracking-wider uppercase text-neutral-600
                  hover:text-white transition-colors">
                View Projects
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════════
   EXPERIENCE CARD — 3D Interactive Card Component
   Mouse-tilt, reveal animations, expandable content
   ═══════════════════════════════════════════════════════════════ */
const ExperienceCard = ({ exp, index, config, Icon, isExpanded, onToggle, total }) => {
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), { stiffness: 150, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), { stiffness: 150, damping: 25 });
  const glareX = useTransform(mouseX, [0, 1], [0, 100]);
  const glareY = useTransform(mouseY, [0, 1], [0, 100]);

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <div className="journey-card lg:ml-24 xl:ml-32 relative">
      {/* Left connector dot (desktop) */}
      <div className="hidden lg:flex absolute -left-[calc(3rem+5px)] xl:-left-[calc(4rem+5px)] top-10 items-center z-20">
        <div className="w-2.5 h-2.5 rounded-full border-2 border-neutral-800"
          style={{ background: config.color, boxShadow: `0 0 10px ${config.color}40` }} />
        <div className="w-12 xl:w-16 h-px" style={{ background: `linear-gradient(90deg, ${config.color}40, transparent)` }} />
      </div>

      {/* Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onToggle}
        style={{ perspective: 1000, rotateX, rotateY, transformStyle: 'preserve-3d' }}
        layout
        className="relative cursor-pointer group"
      >
        <div className={`relative rounded-2xl border overflow-hidden transition-all duration-500 ${
          isExpanded ? 'border-transparent bg-neutral-950' : 'border-neutral-800/60 bg-white/[0.015] hover:border-neutral-700'
        }`}
          style={isExpanded ? { borderColor: `${config.color}30`, boxShadow: `0 0 40px ${config.color}08, 0 20px 60px rgba(0,0,0,0.4)` } : {}}>

          {/* Mouse-following glare effect */}
          <motion.div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.03), transparent 60%)`) }} />

          {/* Top accent line */}
          <motion.div className="absolute top-0 left-0 h-[2px] z-10"
            style={{ background: `linear-gradient(90deg, ${config.color}, transparent)` }}
            animate={isExpanded ? { width: '100%' } : { width: '0%' }}
            transition={{ duration: 0.6 }} />

          {/* Background number — decorative */}
          <div className="absolute top-4 right-6 pointer-events-none select-none">
            <span className="text-[5rem] md:text-[7rem] font-extralight leading-none text-white/[0.02]">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10 p-6 md:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Left side — Type & Meta */}
              <div className="lg:w-48 flex-shrink-0">
                {/* Type indicator */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${config.color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                  </div>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: config.color }}>
                    {config.label}
                  </span>
                </div>

                {/* Duration & Location */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-mono tracking-wider">{exp.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-mono tracking-wider">{exp.location}</span>
                  </div>
                </div>

                {/* Index indicator */}
                <div className="hidden lg:flex items-center gap-2 mt-6">
                  <span className="text-lg font-extralight" style={{ color: config.color }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-neutral-800 font-mono">/ {String(total).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Right side — Main Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-white leading-snug group-hover:text-neutral-100 transition-colors">
                  {exp.title}
                </h3>
                <p className="text-sm font-light text-neutral-500 mt-1.5 mb-4">{exp.organization}</p>

                {/* Description — always visible preview, expanded shows full */}
                <AnimatePresence>
                  {isExpanded ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="text-sm font-light text-neutral-400 leading-relaxed mb-6">{exp.description}</p>

                      {/* Skills — Animated pills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {exp.skills.map((skill, si) => (
                          <motion.span key={skill}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: si * 0.04, duration: 0.3 }}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider"
                            style={{ background: `${config.color}10`, color: `${config.color}cc`, border: `1px solid ${config.color}15` }}>
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <p className="text-sm font-light text-neutral-600 leading-relaxed line-clamp-2">{exp.description}</p>
                  )}
                </AnimatePresence>

                {/* Collapsed skills preview */}
                {!isExpanded && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {exp.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="px-2 py-1 rounded-md text-[10px] font-mono tracking-wider text-neutral-700 bg-white/[0.03] border border-white/[0.04]">
                        {skill}
                      </span>
                    ))}
                    {exp.skills.length > 4 && (
                      <span className="px-2 py-1 rounded-md text-[10px] font-mono tracking-wider text-neutral-700">+{exp.skills.length - 4}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Expand indicator */}
              <div className="flex-shrink-0 self-center">
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center group-hover:border-neutral-600 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom accent — appears on expand */}
          <motion.div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${config.color}30, transparent)` }}
            animate={isExpanded ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4 }} />
        </div>
      </motion.div>
    </div>
  );
};

export default Experience;
