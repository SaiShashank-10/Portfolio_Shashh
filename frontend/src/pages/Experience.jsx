import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GraduationCap, Briefcase, Award, Calendar, MapPin, ArrowRight, ArrowUpRight, ChevronDown, Trophy, BookOpen } from 'lucide-react';
import { experiences } from '../data/mock';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

/* Type config */
const TYPE = {
  education:   { color: '#34d399', icon: GraduationCap, label: 'Education' },
  experience:  { color: '#60a5fa', icon: Briefcase,     label: 'Experience' },
  acheivement: { color: '#fbbf24', icon: Award,         label: 'Achievement' },
  achievement: { color: '#fbbf24', icon: Award,         label: 'Achievement' },
};

/* Noise texture overlay */
const NoiseSVG = () => (
  <svg className="pointer-events-none fixed inset-0 w-full h-full z-[100] opacity-[0.018]" style={{ mixBlendMode: 'overlay' }}>
    <filter id="expnoise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" /></filter>
    <rect width="100%" height="100%" filter="url(#expnoise)" />
  </svg>
);

/* Magnetic wrapper */
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

/* Interactive letter-by-letter heading — 3D mouse proximity + hover glitch */
const InteractiveHeading = ({ smoothMX, smoothMY }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let letters = [];
    let raf = null;

    const init = () => {
      letters = Array.from(container.querySelectorAll('.exp-hero-letter'));
    };

    /* Mouse proximity wave — GSAP driven for performance */
    const onMove = (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!letters.length) init();
        letters.forEach((el) => {
          if (el.dataset.glitch === '1') return;
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);
          const p = Math.max(0, 1 - dist / 220);
          const p2 = p * p;
          const isEdu = el.dataset.line === '2';
          const rgb = isEdu ? '52,211,153' : '96,165,250';
          gsap.to(el, {
            y: -p2 * 28,
            z: p2 * 50,
            scale: 1 + p2 * 0.22,
            rotateX: (dy / 260) * p * -14,
            rotateY: (dx / 260) * p * 10,
            textShadow: p > 0.08
              ? `0 0 ${p2 * 35}px rgba(${rgb},${p2 * 0.6}), 0 0 ${p2 * 70}px rgba(${rgb},${p2 * 0.2}), 0 ${p2 * 8}px ${p2 * 25}px rgba(0,0,0,${p2 * 0.25})`
              : '0 0 0 transparent',
            color: p > 0.2
              ? (isEdu ? `rgba(110,231,183,${0.4 + p * 0.6})` : `rgba(255,255,255,${0.4 + p * 0.6})`)
              : '',
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

  /* Hover glitch burst on individual letter */
  const onLetterEnter = useCallback((e) => {
    const el = e.currentTarget;
    if (el.dataset.glitch === '1') return;
    el.dataset.glitch = '1';
    const burst = el.dataset.line === '2' ? '#34d399' : '#60a5fa';
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
            className={`exp-hero-letter inline-block cursor-default select-none ${extra}`}
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>{ch}</span>
    )
  ), [onLetterEnter]);

  return (
    <div ref={containerRef} style={{ perspective: '1200px' }} className="relative">
      <motion.h1 className="mb-2"
        style={{
          rotateX: useTransform(smoothMY, [-1, 1], [3, -3]),
          rotateY: useTransform(smoothMX, [-1, 1], [-2, 2]),
          transformStyle: 'preserve-3d',
        }}>
        <div style={{ transformStyle: 'preserve-3d' }}>
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[8.5rem] font-extralight tracking-tight leading-[1.1]">
            {renderLetters('Experience', '1')}
            <span className="inline-block w-3 lg:w-5" />
            {renderLetters('&', '1')}
          </div>
        </div>
        <div className="-mt-2 lg:-mt-4" style={{ transformStyle: 'preserve-3d' }}>
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[8.5rem] font-extralight tracking-tight text-neutral-500 italic leading-[1.1]">
            {renderLetters('Education', '2', 'italic')}
          </div>
        </div>
      </motion.h1>
      {/* Reflected ghost */}
      <div className="pointer-events-none select-none overflow-hidden h-12 md:h-20 lg:h-28 -mt-1" aria-hidden="true"
        style={{ transform: 'scaleY(-1)', opacity: 0.025,
          maskImage: 'linear-gradient(to bottom, black, transparent 60%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 60%)' }}>
        <div className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[8.5rem] font-extralight tracking-tight leading-[1.1] text-white">
          Experience &amp; Education
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   MAIN PAGE
   ================================================================ */
const Experience = () => {
  const heroRef = useRef(null);
  const horizontalRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const smoothMY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  /* Cursor */
  useEffect(() => {
    const onMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  /* GSAP master */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero entrance */
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo('.exp-hero-line', { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' })
        .fromTo('.exp-hero-letter',
          { y: 120, rotateX: -90, rotateZ: () => gsap.utils.random(-15, 15), scale: 0.4, opacity: 0, z: -100 },
          { y: 0, rotateX: 0, rotateZ: 0, scale: 1, opacity: 1, z: 0,
            stagger: { each: 0.025, from: 'random' }, duration: 1.1, ease: 'expo.out' }, '-=0.6')
        .fromTo('.exp-hero-sub', { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3')
        .fromTo('.exp-hero-stat', { y: 40, opacity: 0, scale: 0.85 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.3')
        .fromTo('.exp-hero-dot', { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'back.out(2)' }, '-=0.2');

      /* Horizontal scroll */
      const panels = gsap.utils.toArray('.exp-panel');
      if (panels.length > 0 && horizontalRef.current) {
        gsap.to(panels, {
          xPercent: -100 * (panels.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: horizontalRef.current,
            pin: true,
            scrub: 1.2,
            snap: { snapTo: 1 / (panels.length - 1), duration: 0.4, ease: 'power2.inOut' },
            end: () => '+=' + (window.innerWidth * panels.length * 0.8),
            onUpdate: (self) => {
              const idx = Math.round(self.progress * (panels.length - 1));
              setActiveIdx(idx);
            }
          }
        });
      }

      /* Float orbs */
      gsap.utils.toArray('.exp-float').forEach((el) => {
        gsap.to(el, { y: 'random(-25,25)', x: 'random(-15,15)', rotation: 'random(-8,8)',
          duration: 'random(4,8)', repeat: -1, yoyo: true, ease: 'sine.inOut' });
      });

      /* CTA */
      gsap.fromTo('.exp-cta-inner', { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.exp-cta', start: 'top 75%', toggleActions: 'play none none reverse' } });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => () => ScrollTrigger.getAll().forEach(t => t.kill()), []);

  const navItems = useMemo(() => experiences.map((exp, i) => ({
    idx: i, label: exp.title.length > 25 ? exp.title.slice(0, 22) + '...' : exp.title,
    type: TYPE[exp.type] || TYPE.experience,
  })), []);

  return (
    <div className="bg-black text-white selection:bg-blue-500/30 overflow-x-hidden">
      <NoiseSVG />

      {/* Custom cursor */}
      <motion.div className="fixed top-0 left-0 w-5 h-5 rounded-full border border-white/20 pointer-events-none z-[90] mix-blend-difference hidden lg:block"
        animate={{ x: cursorPos.x - 10, y: cursorPos.y - 10, scale: hoveredIdx !== null ? 2.5 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }} />

      {/* ====== HERO ====== */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-end pb-16 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <motion.div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle,#60a5fa 0%,transparent 70%)', filter: 'blur(120px)',
              x: useTransform(smoothMX, [-1,1], [40,-40]), y: useTransform(smoothMY, [-1,1], [30,-30]) }} />
          <motion.div className="absolute bottom-[-15%] left-[-15%] w-[600px] h-[600px] rounded-full opacity-[0.05]"
            style={{ background: 'radial-gradient(circle,#34d399 0%,transparent 70%)', filter: 'blur(100px)',
              x: useTransform(smoothMX, [-1,1], [-30,30]), y: useTransform(smoothMY, [-1,1], [-25,25]) }} />
          <motion.div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle,#fbbf24 0%,transparent 70%)', filter: 'blur(90px)',
              x: useTransform(smoothMX, [-1,1], [20,-20]) }} />
        </div>

        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="exp-float absolute rounded-full pointer-events-none"
            style={{ width: Math.random()*3+1, height: Math.random()*3+1,
              background: `rgba(255,255,255,${Math.random()*0.08+0.02})`,
              left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }} />
        ))}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible">
          <motion.span className="text-[14rem] sm:text-[18rem] md:text-[24rem] lg:text-[30rem] font-thin leading-none text-white/[0.018] tracking-tighter"
            style={{ x: useTransform(smoothMX, [-1,1], [-20,20]), y: useTransform(smoothMY, [-1,1], [-15,15]) }}>
            {String(activeIdx + 1).padStart(2, '0')}
          </motion.span>
        </div>

        <div className="relative z-10 max-w-[90rem] mx-auto w-full px-6 lg:px-12">
          <div className="exp-hero-line origin-left h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent mb-12 w-48" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] font-mono text-neutral-500 tracking-[0.5em] uppercase">Journey & Growth</span>
          </div>

          <InteractiveHeading smoothMX={smoothMX} smoothMY={smoothMY} />

          <p className="exp-hero-sub text-neutral-500 font-light text-sm md:text-base max-w-lg leading-relaxed mt-8 font-mono tracking-wide">
            Scroll through my professional milestones, academic foundation, and key achievements.
          </p>

          <div className="flex flex-wrap gap-10 lg:gap-20 mt-14">
            {[
              { icon: BookOpen, val: experiences.filter(e => e.type === 'education').length, label: 'Education', color: '#34d399' },
              { icon: Briefcase, val: experiences.filter(e => e.type === 'experience').length, label: 'Work', color: '#60a5fa' },
              { icon: Trophy, val: experiences.filter(e => e.type === 'acheivement' || e.type === 'achievement').length, label: 'Awards', color: '#fbbf24' },
            ].map((s, i) => (
              <MagneticWrap key={i} strength={0.2}>
                <div className="exp-hero-stat group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-neutral-800 group-hover:border-neutral-600 transition-colors"
                      style={{ background: `${s.color}08` }}>
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    <span className="text-4xl md:text-5xl font-thin tabular-nums">{String(s.val).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-600 tracking-[0.3em] uppercase mt-2 block">{s.label}</span>
                </div>
              </MagneticWrap>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-16">
            {navItems.map((item, i) => (
              <MagneticWrap key={i} strength={0.35}>
                <button className="exp-hero-dot group relative flex items-center gap-2"
                  onClick={() => { horizontalRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${activeIdx === i ? 'scale-150' : 'scale-100 opacity-40 group-hover:opacity-80'}`}
                    style={{ background: item.type.color }} />
                  <span className={`text-[10px] font-mono tracking-wider transition-all duration-300 hidden md:inline ${activeIdx === i ? 'text-neutral-300 opacity-100' : 'text-neutral-700 opacity-0 group-hover:opacity-70'}`}>
                    {item.label}
                  </span>
                </button>
              </MagneticWrap>
            ))}
          </div>

          <motion.div className="mt-12 flex items-center gap-3 text-neutral-700"
            animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="w-5 h-8 rounded-full border border-neutral-700 flex items-start justify-center pt-1.5">
              <motion.div className="w-1 h-1.5 rounded-full bg-neutral-600"
                animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase">Scroll to explore</span>
          </motion.div>
        </div>
      </section>

      {/* ====== HORIZONTAL SCROLL ====== */}
      <section ref={horizontalRef} className="relative overflow-hidden" style={{ height: '100vh' }}>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {experiences.map((_, i) => (
            <div key={i} className="relative h-1 rounded-full overflow-hidden bg-neutral-800/80 transition-all duration-500"
              style={{ width: activeIdx === i ? 48 : 16 }}>
              <motion.div className="absolute inset-0 rounded-full"
                style={{ background: (TYPE[experiences[i].type] || TYPE.experience).color }}
                animate={{ scaleX: activeIdx === i ? 1 : 0 }} transition={{ duration: 0.5 }} />
            </div>
          ))}
        </div>

        <div className="flex h-full" style={{ width: `${experiences.length * 100}vw` }}>
          {experiences.map((exp, i) => {
            const t = TYPE[exp.type] || TYPE.experience;
            return (
              <ExperiencePanel key={`${exp.id}-${exp.type}-${i}`}
                exp={exp} index={i} total={experiences.length}
                typeConfig={t} Icon={t.icon} isActive={activeIdx === i}
                onHover={setHoveredIdx} smoothMX={smoothMX} smoothMY={smoothMY} />
            );
          })}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
      </section>

      {/* ====== CTA ====== */}
      <section className="exp-cta relative py-40 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle,#818cf8,transparent)', filter: 'blur(120px)' }} />
        </div>
        <div className="exp-cta-inner relative z-10 text-center max-w-2xl mx-auto px-6">
          <span className="text-[10px] font-mono text-neutral-700 tracking-[0.5em] uppercase">What Comes Next</span>
          <h3 className="text-3xl md:text-5xl font-extralight mt-6 mb-3">Let's build something</h3>
          <h3 className="text-3xl md:text-5xl font-extralight italic text-neutral-500 mb-10">remarkable together</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticWrap strength={0.15}>
              <Link to="/contact"
                className="group relative px-10 py-5 rounded-full text-xs font-mono tracking-[0.2em] uppercase overflow-hidden border border-neutral-700 hover:border-white/30 transition-all duration-500 flex items-center gap-3">
                <span className="relative z-10">Get In Touch</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
                <div className="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Link>
            </MagneticWrap>
            <MagneticWrap strength={0.15}>
              <Link to="/projects"
                className="group px-10 py-5 rounded-full text-xs font-mono tracking-[0.2em] uppercase text-neutral-500 hover:text-white transition-colors duration-300 flex items-center gap-3">
                View Projects
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </Link>
            </MagneticWrap>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ================================================================
   HORIZONTAL PANEL
   ================================================================ */
const ExperiencePanel = ({ exp, index, total, typeConfig: t, Icon, isActive, onHover, smoothMX, smoothMY }) => {
  return (
    <div className="exp-panel relative w-screen h-full flex-shrink-0 flex items-center overflow-hidden"
      onMouseEnter={() => onHover(index)} onMouseLeave={() => onHover(null)}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ background: `radial-gradient(circle at 70% 50%, ${t.color}, transparent 60%)` }} />
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: `linear-gradient(${t.color}15 1px, transparent 1px), linear-gradient(90deg, ${t.color}15 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <motion.div className="absolute right-4 md:right-8 lg:right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{ x: useTransform(smoothMX, [-1,1], [30,-30]) }}>
        <span className="text-[12rem] sm:text-[16rem] md:text-[22rem] lg:text-[28rem] font-thin leading-none tracking-tighter"
          style={{ color: `${t.color}06`, WebkitTextStroke: `1px ${t.color}10` }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </motion.div>

      <div className="panel-content relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-4 xl:col-span-3">
          <motion.div className="flex items-center gap-3 mb-8"
            animate={isActive ? { x: 0, opacity: 1 } : { x: -20, opacity: 0.5 }} transition={{ duration: 0.5 }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${t.color}12`, border: `1px solid ${t.color}20` }}>
              <Icon className="w-4 h-4" style={{ color: t.color }} />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase block" style={{ color: t.color }}>{t.label}</span>
              <span className="text-[9px] font-mono text-neutral-700 tracking-wider">{String(index+1).padStart(2,'0')} / {String(total).padStart(2,'0')}</span>
            </div>
          </motion.div>
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-sm font-mono text-neutral-400 tracking-wider">{exp.duration}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-sm font-mono text-neutral-500 tracking-wider">{exp.location}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {exp.skills.map((skill, si) => (
              <motion.span key={skill}
                initial={{ opacity: 0, y: 12 }} animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 4 }}
                transition={{ delay: si * 0.05, duration: 0.4 }}
                className="px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider border"
                style={{ color: `${t.color}cc`, borderColor: `${t.color}18`, background: `${t.color}06` }}>
                {skill}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          <motion.div style={{ x: useTransform(smoothMX, [-1,1], [-8,8]), y: useTransform(smoothMY, [-1,1], [-5,5]) }}>
            <span className="text-sm font-mono text-neutral-600 tracking-wider block mb-3">{exp.organization}</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extralight leading-[1.1] mb-8">
              {exp.title.split(' ').map((word, wi) => (
                <span key={wi} className="inline-block mr-3 lg:mr-4 hover:text-white/60 transition-colors duration-200 cursor-default">{word}</span>
              ))}
            </h2>
            <div className="relative max-w-2xl">
              <div className="absolute -inset-4 rounded-2xl opacity-40"
                style={{ background: `linear-gradient(135deg, ${t.color}05, transparent)` }} />
              <p className="relative text-neutral-400 font-light leading-relaxed text-sm md:text-base">{exp.description}</p>
            </div>
            <motion.div className="mt-10 h-px w-24"
              style={{ background: `linear-gradient(90deg, ${t.color}60, transparent)` }}
              animate={isActive ? { width: 96, opacity: 1 } : { width: 48, opacity: 0.3 }}
              transition={{ duration: 0.6 }} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
