import React, { useState, useRef, useCallback, useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, ExternalLink, X, ArrowUpRight, Lightbulb, Route, CheckCircle2 } from 'lucide-react';
import { projects } from '../data/mock';
import { Button } from '../components/ui/button';

gsap.registerPlugin(ScrollTrigger);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CONSTANTS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const PROJECT_COLORS = [
  '99, 102, 241',
  '236, 72, 153',
  '16, 185, 129',
  '245, 158, 11',
  '139, 92, 246',
  '59, 130, 246',
];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   3D TILT CARD â€” mouse-reactive perspective rotation
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const TiltCard = ({ children, className, intensity = 15, ...props }) => {
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * intensity);
    rotateY.set(x * intensity);
  }, [rotateX, rotateY, intensity]);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000, rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/* Interactive letter-by-letter heading — 3D mouse proximity + hover distortion */
const InteractiveProjectsHeading = ({ springMouseX, springMouseY }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let letters = [];
    let raf = null;

    const init = () => {
      letters = Array.from(container.querySelectorAll('.pj-hero-letter'));
    };

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
          const p = Math.max(0, 1 - dist / 250);
          const p2 = p * p;
          const line = el.dataset.line;
          const rgb = line === '1' ? '99,102,241' : line === '2' ? '236,72,153' : '16,185,129';
          gsap.to(el, {
            y: -p2 * 32,
            z: p2 * 60,
            scale: 1 + p2 * 0.25,
            rotateX: (dy / 280) * p * -16,
            rotateY: (dx / 280) * p * 12,
            textShadow: p > 0.08
              ? `0 0 ${p2 * 40}px rgba(${rgb},${p2 * 0.6}), 0 0 ${p2 * 80}px rgba(${rgb},${p2 * 0.18}), 0 ${p2 * 10}px ${p2 * 30}px rgba(0,0,0,${p2 * 0.2})`
              : '0 0 0 transparent',
            color: p > 0.15 ? `rgba(${rgb},${0.5 + p * 0.5})` : '',
            duration: 0.4, ease: 'power2.out', overwrite: 'auto',
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
          duration: 1.4, ease: 'elastic.out(1,0.3)', overwrite: 'auto',
        });
      });
    };

    const tid = setTimeout(() => {
      init();
      window.addEventListener('mousemove', onMove);
      container.addEventListener('mouseleave', onLeave);
    }, 150);

    return () => {
      clearTimeout(tid);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  /* Hover glitch burst per letter */
  const onLetterEnter = useCallback((e) => {
    const el = e.currentTarget;
    if (el.dataset.glitch === '1') return;
    el.dataset.glitch = '1';
    const line = el.dataset.line;
    const burst = line === '1' ? '#6366f1' : line === '2' ? '#ec4899' : '#10b981';
    gsap.timeline({ onComplete: () => { el.dataset.glitch = '0'; } })
      .to(el, { z: 90, scale: 1.6, duration: 0.08, ease: 'power3.out' })
      .to(el, { skewX: 25, duration: 0.04 }, 0)
      .to(el, { skewX: -18, duration: 0.04 }, 0.04)
      .to(el, { skewX: 10, duration: 0.03 }, 0.08)
      .to(el, { skewX: 0, duration: 0.22, ease: 'elastic.out(1,0.4)' }, 0.11)
      .to(el, { rotateZ: gsap.utils.random(-6, 6), duration: 0.06 }, 0)
      .to(el, { rotateZ: 0, duration: 0.3, ease: 'elastic.out(1,0.4)' }, 0.12)
      .to(el, { color: burst, duration: 0.08 }, 0)
      .to(el, { color: '', duration: 0.6, ease: 'power2.inOut' }, 0.2);
  }, []);

  const renderLetters = useCallback((text, line, extraClass = '') => (
    text.split('').map((ch, i) =>
      ch === ' '
        ? <span key={`s${line}-${i}`} className="inline-block w-[0.22em]" />
        : <span key={`${line}-${i}`} data-line={line} onMouseEnter={onLetterEnter}
            className={`pj-hero-letter inline-block cursor-default select-none transition-none ${extraClass}`}
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>{ch}</span>
    )
  ), [onLetterEnter]);

  return (
    <div ref={containerRef} style={{ perspective: '1000px' }} className="relative">
      <motion.h1
        style={{
          rotateX: useTransform(springMouseY, v => v * -0.08),
          rotateY: useTransform(springMouseX, v => v * 0.06),
          transformStyle: 'preserve-3d',
        }}>
        <div className="text-5xl md:text-7xl lg:text-[7rem] font-extralight text-black dark:text-white leading-[1.1]" style={{ transformStyle: 'preserve-3d' }}>
          {renderLetters('My', '1')}
          <span className="inline-block w-3 md:w-5" />
          {renderLetters('Work,', '1')}
        </div>
        <div className="text-5xl md:text-7xl lg:text-[7rem] leading-[1.1] -mt-1 md:-mt-2" style={{ transformStyle: 'preserve-3d' }}>
          <span className="font-extralight text-black dark:text-white">
            {renderLetters('Selected', '2')}
          </span>
          <span className="inline-block w-3 md:w-5" />
          <span className="font-normal text-black dark:text-white">
            {renderLetters('Projects', '3')}
          </span>
        </div>
      </motion.h1>
      {/* Reflected ghost */}
      <div className="pointer-events-none select-none overflow-hidden h-10 md:h-16 lg:h-24 -mt-1" aria-hidden="true"
        style={{ transform: 'scaleY(-1)', opacity: 0.02,
          maskImage: 'linear-gradient(to bottom, black, transparent 55%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 55%)' }}>
        <div className="text-5xl md:text-7xl lg:text-[7rem] font-extralight text-black dark:text-white leading-[1.1]">
          My Work, Selected Projects
        </div>
      </div>
    </div>
  );
};




/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PROJECT DETAIL â€” Cinematic Editorial Overlay v3
   Venetian-blind entrance, dual-layer custom cursor,
   full-bleed parallax hero with marquee, alternating
   journey cards, orbital tech badges, magnetic CTA
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* Pre-generated floating particle positions */
const OVERLAY_PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  left: `${8 + ((i * 43 + 17) % 84)}%`,
  top: `${12 + ((i * 29 + 11) % 76)}%`,
  size: 1 + (i % 3),
  alpha: 0.12 + (i % 4) * 0.06,
  dur: 4 + (i % 5),
  delay: (i % 6) * 0.5,
}));

const ProjectDetailOverlay = ({ project, color, onClose }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  /* â”€â”€ Mouse tracking for custom cursor â”€â”€ */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const dotX = useSpring(mx, { stiffness: 800, damping: 35 });
  const dotY = useSpring(my, { stiffness: 800, damping: 35 });
  const ringX = useSpring(mx, { stiffness: 180, damping: 22 });
  const ringY = useSpring(my, { stiffness: 180, damping: 22 });

  /* Scroll progress */
  const scrollProgress = useMotionValue(0);
  const progressWidth = useTransform(scrollProgress, [0, 1], ['0%', '100%']);

  const handleMouse = useCallback((e) => {
    mx.set(e.clientX);
    my.set(e.clientY);
  }, [mx, my]);

  /* â”€â”€ GSAP entrance + scroll-driven animations â”€â”€ */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const scroller = contentRef.current;
      const tl = gsap.timeline();

      /* 1 Â· Venetian-blind entrance â€” 8 horizontal bars sweep apart */
      tl.to('.dto-slice', {
        scaleY: 0,
        duration: 0.8,
        stagger: { each: 0.045, from: 'edges' },
        ease: 'power4.inOut',
        onComplete() {
          document.querySelectorAll('.dto-slice').forEach(el => {
            el.style.display = 'none';
          });
        },
      });

      /* 2 Â· Hero content cascade */
      tl.fromTo('.dto-hero-badge',
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' },
        '-=0.15',
      );
      tl.fromTo('.dto-title-word',
        { yPercent: 110, rotateX: 50 },
        { yPercent: 0, rotateX: 0, stagger: 0.09, duration: 0.85, ease: 'power3.out' },
        '-=0.2',
      );
      tl.fromTo('.dto-hero-desc',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.4',
      );
      tl.fromTo('.dto-hero-stat',
        { opacity: 0, y: 14, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.07, duration: 0.4, ease: 'back.out(1.4)' },
        '-=0.25',
      );
      tl.fromTo('.dto-marquee',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power1.out' },
        '-=0.3',
      );
      tl.fromTo('.dto-scroll-hint',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.2',
      );

      /* 3 Â· Hero image â€” parallax zoom + blur on scroll */
      gsap.to('.dto-hero-img', {
        yPercent: 22,
        scale: 1.15,
        filter: 'blur(6px) brightness(0.7)',
        ease: 'none',
        scrollTrigger: {
          trigger: '.dto-hero',
          scroller,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      /* 4 Â· Journey progress line draw */
      gsap.fromTo('.dto-journey-line', { strokeDashoffset: 900 }, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.dto-journey',
          scroller,
          start: 'top 65%',
          end: 'bottom 35%',
          scrub: true,
        },
      });

      /* 5 Â· Process step cards â€” alternating entrances */
      gsap.utils.toArray('.dto-step').forEach((step, i) => {
        gsap.fromTo(step,
          { opacity: 0, x: i % 2 === 0 ? -70 : 70, rotateY: i % 2 === 0 ? 6 : -6 },
          {
            opacity: 1, x: 0, rotateY: 0,
            duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: step, scroller, start: 'top 84%' },
          },
        );
      });

      /* 6 Â· Timeline dots */
      gsap.utils.toArray('.dto-dot').forEach(dot => {
        gsap.fromTo(dot,
          { scale: 0 },
          {
            scale: 1, duration: 0.5, ease: 'back.out(2.5)',
            scrollTrigger: { trigger: dot, scroller, start: 'top 82%' },
          },
        );
      });

      /* 7 Â· Tech badges â€” random stagger */
      gsap.fromTo('.dto-tech-badge',
        { opacity: 0, scale: 0.6, y: 24, rotate: -8 },
        {
          opacity: 1, scale: 1, y: 0, rotate: 0,
          stagger: { each: 0.055, from: 'random' },
          duration: 0.55, ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.dto-tech-grid', scroller, start: 'top 82%' },
        },
      );

      /* 8 Â· CTA fade-up */
      gsap.fromTo('.dto-cta-btn',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          stagger: 0.12, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: '.dto-cta', scroller, start: 'top 88%' },
        },
      );

      /* 9 Â· Scroll-progress tracker */
      ScrollTrigger.create({
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => scrollProgress.set(self.progress),
      });
    }, overlayRef);

    return () => ctx.revert();
  }, [scrollProgress]);

  /* â”€â”€ Body scroll lock â”€â”€ */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const steps = [
    { label: 'The Challenge', text: project.challenge, icon: Lightbulb, num: '01' },
    { label: 'The Approach', text: project.approach, icon: Route, num: '02' },
    { label: 'The Solution', text: project.solution, icon: CheckCircle2, num: '03' },
  ];

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 z-[9999]"
      onMouseMove={handleMouse}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* â”€â”€ VENETIAN-BLIND ENTRANCE â”€â”€ 8 horizontal bars */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="dto-slice fixed left-0 right-0 bg-black z-[10000]"
          style={{
            top: `${(i / 8) * 100}%`,
            height: `${100 / 8 + 0.5}%`,
            transformOrigin: i < 4 ? 'top' : 'bottom',
          }}
        />
      ))}

      {/* â”€â”€ CUSTOM DUAL-LAYER CURSOR â”€â”€ */}
      <motion.div
        className="fixed w-1.5 h-1.5 rounded-full bg-white pointer-events-none z-[10002] mix-blend-difference"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="fixed w-11 h-11 rounded-full border border-white/25 pointer-events-none z-[10002] mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
      />

      {/* â”€â”€ SCROLL PROGRESS BAR â”€â”€ */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] z-[10001] origin-left"
        style={{ width: progressWidth, background: `rgb(${color})` }}
      />

      {/* â”€â”€ CLOSE BUTTON (rotate 90Â° on hover) â”€â”€ */}
      <motion.button
        onClick={onClose}
        className="fixed top-6 right-6 z-[10001] w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl
          border border-white/10 flex items-center justify-center text-white/60
          hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
        whileHover={{ scale: 1.1, rotate: 90 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SCROLLABLE CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        ref={contentRef}
        className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-black"
        style={{ cursor: 'none' }}
      >
        {/* Film noise texture */}
        <div
          className="fixed inset-0 pointer-events-none z-50 opacity-[0.022]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section className="dto-hero relative min-h-screen flex items-end overflow-hidden">
          {/* Background image with scroll-driven parallax */}
          <div className="dto-hero-img absolute inset-[-10%] will-change-transform">
            <img
              src={project.image}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Multi-layer gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 25% 75%, rgba(${color}, 0.14) 0%, transparent 55%)`,
            }}
          />

          {/* Cinematic vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
            }}
          />

          {/* Giant ghost project number */}
          <div className="absolute top-1/4 right-4 md:right-12 pointer-events-none select-none">
            <span
              className="text-[10rem] md:text-[18rem] lg:text-[22rem] font-black leading-none opacity-[0.035]"
              style={{ WebkitTextStroke: `2px rgba(${color}, 0.35)`, color: 'transparent' }}
            >
              {String(project.id).padStart(2, '0')}
            </span>
          </div>

          {/* Floating particles */}
          {OVERLAY_PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{ left: p.left, top: p.top, width: p.size, height: p.size, opacity: p.alpha }}
              animate={{ y: [0, -18, 0], x: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: 'easeInOut' }}
            />
          ))}

          {/* Infinite marquee â€” cinematic title scroll */}
          <div className="dto-marquee absolute bottom-32 left-0 right-0 overflow-hidden pointer-events-none">
            <motion.div
              className="whitespace-nowrap"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block text-[6rem] md:text-[8rem] font-black leading-none opacity-[0.025] mx-8"
                  style={{ WebkitTextStroke: `1px rgba(${color}, 0.15)`, color: 'transparent' }}
                >
                  {project.title}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Hero content â€” bottom-left editorial layout */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-16 md:pb-24 w-full">
            {/* Badge */}
            <div className="dto-hero-badge flex items-center gap-3 mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40"
                  style={{ background: `rgb(${color})` }}
                />
                <span
                  className="relative inline-flex rounded-full h-2.5 w-2.5"
                  style={{ background: `rgb(${color})` }}
                />
              </span>
              <span
                className="text-[10px] tracking-[0.35em] uppercase font-light"
                style={{ color: `rgb(${color})` }}
              >
                {project.featured ? 'Featured Project' : 'Project'} &mdash;{' '}
                {String(project.id).padStart(2, '0')}
              </span>
            </div>

            {/* Title â€” word-by-word 3D flip reveal */}
            <h1 style={{ perspective: 1000 }}>
              {project.title.split(' ').map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-3 md:mr-5">
                  <span className="dto-title-word inline-block text-4xl md:text-6xl lg:text-[5.5rem] font-extralight text-white leading-[1.1]">
                    {word}
                  </span>
                </span>
              ))}
            </h1>

            {/* Description */}
            <p className="dto-hero-desc mt-7 text-base md:text-lg text-white/45 font-light max-w-2xl leading-relaxed">
              {project.longDescription || project.description}
            </p>

            {/* Stats row */}
            <div className="mt-10 flex items-center gap-8 md:gap-12 flex-wrap">
              {[
                { val: project.techStack.length, label: 'Technologies' },
                { val: `#${String(project.id).padStart(2, '0')}`, label: 'Project' },
                { val: project.featured ? 'â˜…' : 'â€”', label: 'Featured' },
              ].map((s, i) => (
                <div key={i} className="dto-hero-stat flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-extralight text-white tracking-tight">
                    {s.val}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-[0.2em]"
                    style={{ color: `rgba(${color}, 0.7)` }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <div className="dto-scroll-hint absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-[8px] uppercase tracking-[0.35em] text-white/20 font-light">
              Scroll to explore
            </span>
            <motion.div
              className="w-px h-10 origin-top"
              style={{ background: `linear-gradient(to bottom, rgb(${color}), transparent)` }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </section>

        {/* â•â•â• Gradient Divider â•â•â• */}
        <div className="relative h-px">
          <motion.div
            className="absolute inset-x-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgb(${color}) 50%, transparent 100%)`,
              opacity: 0.3,
            }}
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          />
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• JOURNEY / PROCESS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section className="dto-journey relative py-24 md:py-40">
          {/* Section intro */}
          <div className="max-w-6xl mx-auto px-6 md:px-10 mb-20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-px" style={{ background: `rgb(${color})` }} />
              <span
                className="text-[10px] tracking-[0.35em] uppercase font-light"
                style={{ color: `rgb(${color})` }}
              >
                Project Journey
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extralight text-white">
              From Challenge<br className="hidden md:block" /> to Solution
            </h2>
          </div>

          {/* Central SVG progress line (desktop) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-px" style={{ top: 220, bottom: 100 }}>
            <svg className="w-[2px] h-full" viewBox="0 0 2 900" preserveAspectRatio="none">
              <line
                x1="1" y1="0" x2="1" y2="900"
                className="dto-journey-line"
                stroke={`rgba(${color}, 0.35)`}
                strokeWidth="2"
                strokeDasharray="900"
                strokeDashoffset="900"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Mobile vertical line */}
          <div
            className="md:hidden absolute left-8 top-52 bottom-24 w-px"
            style={{ background: `linear-gradient(to bottom, rgb(${color}), transparent)`, opacity: 0.15 }}
          />

          {/* Process steps â€” alternating left/right */}
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLeft = i % 2 === 0;

              return (
                <div
                  key={i}
                  className={`dto-step relative flex flex-col md:flex-row items-start md:items-center
                    mb-20 md:mb-28 last:mb-0 ${isLeft ? '' : 'md:flex-row-reverse'}`}
                  style={{ perspective: 900 }}
                >
                  {/* Timeline dot */}
                  <div className="dto-dot absolute left-[29px] md:left-1/2 md:-translate-x-1/2 z-10 flex items-center justify-center">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: `rgba(${color}, 0.12)`, border: `2px solid rgb(${color})` }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: `rgb(${color})` }}
                      />
                    </div>
                    {/* Ping on the dot */}
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-15"
                      style={{ background: `rgb(${color})` }}
                    />
                  </div>

                  {/* Card */}
                  <div
                    className={`ml-16 md:ml-0 w-full md:w-[44%] ${
                      isLeft ? 'md:pr-14' : 'md:pl-14'
                    }`}
                  >
                    <div
                      className="group relative p-7 md:p-9 rounded-2xl border border-white/[0.06]
                        bg-white/[0.015] backdrop-blur-sm overflow-hidden
                        transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.03]"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Giant background phase number */}
                      <span
                        className="absolute -top-5 -right-3 text-[7rem] md:text-[8rem] font-black leading-none
                          pointer-events-none select-none"
                        style={{ color: `rgba(${color}, 0.04)` }}
                      >
                        {step.num}
                      </span>

                      {/* Phase icon + label */}
                      <div className="flex items-center gap-3 mb-5 relative">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center
                            transition-transform duration-300 group-hover:scale-110"
                          style={{
                            background: `rgba(${color}, 0.08)`,
                            border: `1px solid rgba(${color}, 0.15)`,
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: `rgb(${color})` }} />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-light">
                            Phase {step.num}
                          </span>
                          <h3 className="text-sm font-medium text-white/80">{step.label}</h3>
                        </div>
                      </div>

                      <p className="text-white/50 font-light leading-relaxed text-sm md:text-base relative">
                        {step.text}
                      </p>

                      {/* Hover gradient glow */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                          transition-opacity duration-500 pointer-events-none"
                        style={{
                          boxShadow: `inset 0 1px 40px rgba(${color}, 0.06), 0 0 60px rgba(${color}, 0.03)`,
                        }}
                      />

                      {/* Bottom accent line */}
                      <div
                        className="absolute bottom-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100
                          transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(to right, transparent, rgb(${color}), transparent)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* â•â•â• Gradient Divider â•â•â• */}
        <div className="relative h-px">
          <div
            className="absolute inset-x-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgb(${color}) 50%, transparent 100%)`,
              opacity: 0.2,
            }}
          />
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• TECH STACK â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section className="relative py-24 md:py-40 overflow-hidden">
          {/* Ambient orb â€” left */}
          <div className="absolute top-1/2 left-[15%] -translate-y-1/2 w-80 h-80 pointer-events-none">
            <div
              className="w-full h-full rounded-full blur-[120px] opacity-[0.07]"
              style={{ background: `rgb(${color})` }}
            />
          </div>
          {/* Ambient orb â€” right */}
          <div className="absolute top-1/3 right-[10%] w-56 h-56 pointer-events-none">
            <div
              className="w-full h-full rounded-full blur-[90px] opacity-[0.05]"
              style={{ background: `rgb(${color})` }}
            />
          </div>

          <div className="max-w-5xl mx-auto px-6 md:px-10 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-px" style={{ background: `rgb(${color})`, opacity: 0.5 }} />
              <span
                className="text-[10px] tracking-[0.35em] uppercase font-light"
                style={{ color: `rgb(${color})` }}
              >
                Built With
              </span>
              <div className="w-8 h-px" style={{ background: `rgb(${color})`, opacity: 0.5 }} />
            </div>
            <h2 className="mt-3 text-2xl md:text-4xl lg:text-5xl font-extralight text-white">
              Technology Stack
            </h2>

            {/* Tech badges â€” staggered with shimmer + glow */}
            <div className="dto-tech-grid mt-16 flex flex-wrap justify-center gap-3 md:gap-4">
              {project.techStack.map((tech, i) => (
                <motion.div
                  key={tech}
                  className="dto-tech-badge group relative"
                  whileHover={{ scale: 1.12, y: -8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  <div
                    className="relative px-5 py-3 md:px-7 md:py-3.5 rounded-full
                      border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm
                      overflow-hidden cursor-pointer transition-all duration-300
                      group-hover:border-white/20 group-hover:bg-white/[0.06]"
                  >
                    {/* Shimmer sweep */}
                    <div
                      className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                        transition-transform duration-[700ms]
                        bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
                    />

                    <span className="relative text-sm font-light text-white/60 group-hover:text-white transition-colors duration-300">
                      {tech}
                    </span>
                  </div>

                  {/* Outer glow ring */}
                  <div
                    className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100
                      transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: `0 0 24px rgba(${color}, 0.18), 0 0 48px rgba(${color}, 0.06)`,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section className="dto-cta py-24 md:py-36 relative">
          <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extralight text-white mb-4">
              Explore This Project
            </h2>
            <p className="text-white/25 font-light text-sm mb-14 max-w-md mx-auto leading-relaxed">
              Dive into the source code or experience the live application
            </p>

            <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
              {project.github && (
                <motion.a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dto-cta-btn group relative inline-flex items-center gap-2.5 px-9 py-4
                    rounded-full border border-white/[0.12] text-white/70 text-sm font-light
                    overflow-hidden transition-all duration-300 hover:border-white/25 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <Github className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">View Source</span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, rgba(${color}, 0.12), transparent 60%)`,
                    }}
                  />
                </motion.a>
              )}
              {project.liveDemo && (
                <motion.a
                  href={project.liveDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dto-cta-btn group relative inline-flex items-center gap-2.5 px-9 py-4
                    rounded-full text-white text-sm font-light overflow-hidden
                    transition-shadow duration-300 hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, rgb(${color}), rgba(${color}, 0.8))`,
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <ExternalLink className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Live Demo</span>
                  <ArrowUpRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  {/* Shine sweep */}
                  <div
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                      transition-transform duration-[700ms]
                      bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                </motion.a>
              )}
            </div>
          </div>

          {/* CTA ambient orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none -z-10">
            <div
              className="w-full h-full rounded-full blur-[130px] opacity-[0.06]"
              style={{ background: `rgb(${color})` }}
            />
          </div>
        </section>

        {/* Bottom spacer */}
        <div className="h-8 bg-black" />
      </div>
    </motion.div>
  );
};
/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN PROJECTS PAGE
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const wrapperRef = useRef(null);
  const heroRef = useRef(null);
  const showcaseRef = useRef(null);
  const activeRef = useRef(0);
  const rafId = useRef(0);

  /* Mouse tracking for hero parallax */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  /* Pre-compute orb transforms (hooks can't be called inside a loop) */
  const orbX1 = useTransform(springMouseX, v => v * 1);
  const orbY1 = useTransform(springMouseY, v => v * 1);
  const orbX2 = useTransform(springMouseX, v => v * 1.5);
  const orbY2 = useTransform(springMouseY, v => v * 1.5);
  const orbX3 = useTransform(springMouseX, v => v * 2);
  const orbY3 = useTransform(springMouseY, v => v * 2);
  const orbTransforms = [
    { x: orbX1, y: orbY1 }, { x: orbX2, y: orbY2 }, { x: orbX3, y: orbY3 },
  ];

  const featuredProjects = projects.filter(p => p.featured);
  const otherProjects = projects.filter(p => !p.featured);

  const handleHeroMouse = useCallback((e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    mouseX.set((clientX / width - 0.5) * 40);
    mouseY.set((clientY / height - 0.5) * 40);
  }, [mouseX, mouseY]);

  /* â•â•â• GSAP ANIMATIONS â•â•â• */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      /* Hero text â€” 3D flip reveal */
      gsap.fromTo('.pj-hero-letter',
        { y: 100, opacity: 0, rotateX: -90, rotateZ: () => gsap.utils.random(-18, 18), scale: 0.3, z: -120 },
        {
          y: 0, opacity: 1, rotateX: 0, rotateZ: 0, scale: 1, z: 0,
          stagger: { each: 0.02, from: 'random' }, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: heroRef.current, start: 'top 80%', toggleActions: 'play none none none' },
        }
      );
      gsap.fromTo('.pj-hero-eyebrow',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: heroRef.current, start: 'top 80%', toggleActions: 'play none none none' },
        }
      );
      gsap.fromTo('.pj-hero-desc',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.5,
          scrollTrigger: { trigger: heroRef.current, start: 'top 80%', toggleActions: 'play none none none' },
        }
      );

      ScrollTrigger.matchMedia({

        /* â€”â€”â€” DESKTOP: pinned featured showcase â€”â€”â€” */
        '(min-width: 768px)': () => {
          const slides = gsap.utils.toArray('.pj-slide');
          const total = slides.length;
          if (total < 2) return;

          slides.forEach((slide, i) => {
            gsap.set(slide, { force3D: true, ...(i > 0 ? { xPercent: 100, opacity: 0 } : {}) });
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: showcaseRef.current,
              pin: true,
              anticipatePin: 1,
              scrub: true,
              start: 'top top',
              end: () => `+=${window.innerHeight * total}`,
              onUpdate: (self) => {
                const idx = Math.min(Math.round(self.progress * (total - 1)), total - 1);
                if (idx !== activeRef.current) {
                  activeRef.current = idx;
                  cancelAnimationFrame(rafId.current);
                  rafId.current = requestAnimationFrame(() => setActiveSlide(idx));
                }
              },
            },
          });

          for (let i = 1; i < total; i++) {
            const pos = i - 1;
            tl.to(slides[i - 1], {
              xPercent: -30, opacity: 0, scale: 0.88,
              duration: 1, ease: 'none', force3D: true,
            }, pos);
            tl.fromTo(slides[i],
              { xPercent: 100, opacity: 0, scale: 0.9 },
              { xPercent: 0, opacity: 1, scale: 1, duration: 1, ease: 'none', force3D: true },
              pos,
            );
          }

          /* Grid staggered reveal */
          gsap.utils.toArray('.pj-grid-item').forEach((item, i) => {
            gsap.fromTo(item,
              { opacity: 0, y: 80, rotateX: 12 },
              {
                opacity: 1, y: 0, rotateX: 0,
                duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none none' },
                delay: (i % 3) * 0.1,
              }
            );
          });
        },

        /* â€”â€”â€” MOBILE: simple fade-in â€”â€”â€” */
        '(max-width: 767px)': () => {
          gsap.utils.toArray('.pj-slide, .pj-grid-item').forEach(item => {
            gsap.fromTo(item,
              { opacity: 0, y: 50 },
              {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none none' },
              }
            );
          });
        },
      });
    }, wrapperRef);

    return () => { cancelAnimationFrame(rafId.current); ctx.revert(); };
  }, []);

  return (
    <div ref={wrapperRef} className="min-h-screen bg-white dark:bg-black">

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• HERO â€” 3D text + mouse parallax â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouse}
        className="relative min-h-[70vh] flex items-center overflow-hidden"
      >
        {/* Mouse-reactive grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div style={{ x: springMouseX, y: springMouseY }} className="absolute inset-[-50px]">
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
          </motion.div>

          {/* Floating orbs reacting to cursor */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 200 + i * 100,
                height: 200 + i * 100,
                background: `radial-gradient(circle, rgba(${PROJECT_COLORS[i]}, 0.07) 0%, transparent 70%)`,
                left: `${20 + i * 25}%`,
                top: `${15 + i * 18}%`,
                x: orbTransforms[i].x,
                y: orbTransforms[i].y,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8 overflow-hidden">
            <div className="pj-hero-eyebrow w-10 h-px bg-neutral-400 dark:bg-neutral-600" />
            <span className="pj-hero-eyebrow text-xs tracking-[0.3em] uppercase text-neutral-500 font-light">
              Selected Work
            </span>
          </div>

          {/* Title - interactive letter-by-letter with 3D proximity effects */}
          <InteractiveProjectsHeading springMouseX={springMouseX} springMouseY={springMouseY} />

          <p className="pj-hero-desc mt-8 text-lg md:text-xl text-neutral-500 dark:text-neutral-400 font-light max-w-xl leading-relaxed">
            Crafting digital experiences that blend creativity with technical excellence.
          </p>

          {/* Project count badges */}
          <div className="pj-hero-desc mt-12 flex items-center gap-8">
            <div>
              <span className="text-4xl md:text-5xl font-extralight text-black dark:text-white">
                {projects.length}
              </span>
              <span className="block text-[11px] text-neutral-400 uppercase tracking-widest mt-1">Projects</span>
            </div>
            <div className="w-px h-12 bg-neutral-200 dark:bg-neutral-800" />
            <div>
              <span className="text-4xl md:text-5xl font-extralight text-black dark:text-white">
                {featuredProjects.length}
              </span>
              <span className="block text-[11px] text-neutral-400 uppercase tracking-widest mt-1">Featured</span>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURED SHOWCASE â€” GSAP pinned cross-fade slides â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section ref={showcaseRef} className="md:h-screen relative md:overflow-hidden">
        {/* Progress indicator */}
        <div className="hidden md:flex absolute top-8 left-1/2 -translate-x-1/2 z-20 items-center gap-3">
          {featuredProjects.map((_, i) => (
            <div
              key={i}
              className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
              style={{ width: activeSlide === i ? 48 : 24 }}
            >
              <div className="absolute inset-0 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
              <div
                className="absolute inset-0 rounded-full transition-all duration-500"
                style={{
                  background: activeSlide === i ? `rgb(${PROJECT_COLORS[i]})` : 'transparent',
                  transform: activeSlide === i ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                }}
              />
            </div>
          ))}
        </div>

        {/* Slide counter */}
        <div className="hidden md:block absolute bottom-8 right-12 z-20">
          <span className="text-sm font-light text-neutral-400 tabular-nums">
            <span className="text-black dark:text-white text-lg">0{activeSlide + 1}</span>
            {' '}/{' '}0{featuredProjects.length}
          </span>
        </div>

        <div className="md:h-full md:relative">
          {featuredProjects.map((project, index) => {
            const color = PROJECT_COLORS[index];
            return (
              <div
                key={project.id}
                className="pj-slide md:absolute md:inset-0 mb-12 md:mb-0"
                style={{ zIndex: index + 1, willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
              >
                <div className="md:h-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-16 py-12 md:py-0">

                  {/* Left â€” project info */}
                  <div className="w-full md:w-[38%] relative z-10">
                    {/* Oversized background index */}
                    <div className="absolute -top-8 -left-4 pointer-events-none select-none">
                      <span
                        className="text-[7rem] md:text-[11rem] font-black leading-none opacity-[0.04]"
                        style={{ WebkitTextStroke: `2px rgba(${color}, 0.15)`, color: 'transparent' }}
                      >
                        0{index + 1}
                      </span>
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full" style={{ background: `rgb(${color})` }} />
                        <span className="text-[11px] uppercase tracking-[0.2em] font-light" style={{ color: `rgb(${color})` }}>
                          Featured Project
                        </span>
                      </div>

                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-black dark:text-white leading-tight">
                        {project.title}
                      </h2>

                      <p className="mt-4 text-neutral-500 dark:text-neutral-400 font-light leading-relaxed text-sm md:text-base">
                        {project.description}
                      </p>

                      {/* Tech pills */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {project.techStack.map(tech => (
                          <span
                            key={tech}
                            className="px-3 py-1.5 text-xs font-light rounded-full border"
                            style={{
                              borderColor: `rgba(${color}, 0.2)`,
                              color: `rgb(${color})`,
                              background: `rgba(${color}, 0.05)`,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="mt-8 flex items-center gap-3">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="group flex items-center gap-2 px-6 py-3 rounded-full text-sm font-light text-white transition-all duration-300 hover:shadow-lg"
                          style={{ background: `rgb(${color})` }}
                        >
                          View Details
                          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                        <a
                          href={project.liveDemo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right â€” 3D tilt image */}
                  <div className="w-full md:w-[62%]">
                    <TiltCard intensity={8} className="cursor-pointer" onClick={() => setSelectedProject(project)}>
                      <div className="relative rounded-2xl overflow-hidden group" style={{ transformStyle: 'preserve-3d' }}>
                        <div className="aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>

                        {/* Color overlay */}
                        <div
                          className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                          style={{ background: `linear-gradient(135deg, rgba(${color}, 0.3), transparent 60%)` }}
                        />

                        {/* Hover border glow */}
                        <div
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{ boxShadow: `inset 0 0 0 1px rgba(${color}, 0.3), 0 0 40px rgba(${color}, 0.1)` }}
                        />
                      </div>
                    </TiltCard>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• OTHER PROJECTS â€” asymmetric bento grid â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-24 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-px bg-neutral-300 dark:bg-neutral-700" />
            <span className="text-xs tracking-[0.3em] uppercase text-neutral-500 font-light">
              More Projects
            </span>
            <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-900" />
          </div>

          <div className="grid md:grid-cols-12 gap-6 md:gap-8" style={{ perspective: 1200 }}>
            {otherProjects.map((project, index) => {
              const color = PROJECT_COLORS[(index + featuredProjects.length) % PROJECT_COLORS.length];
              const isWide = index % 3 === 0;

              return (
                <div
                  key={project.id}
                  className={`pj-grid-item ${isWide ? 'md:col-span-7' : 'md:col-span-5'} ${
                    index % 3 === 2 ? 'md:col-start-4' : ''
                  }`}
                  style={{ perspective: 1000 }}
                >
                  <TiltCard
                    intensity={10}
                    className="group cursor-pointer h-full"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="relative h-full rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-900
                                    bg-neutral-50 dark:bg-neutral-950 transition-all duration-500
                                    group-hover:border-neutral-200 dark:group-hover:border-neutral-800">
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: `linear-gradient(to top, rgba(${color}, 0.15), transparent)` }}
                        />
                        {/* Hoverâ€”reveal number */}
                        <div className="absolute top-4 left-5 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
                          <span
                            className="text-5xl font-black"
                            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)', color: 'transparent' }}
                          >
                            0{index + featuredProjects.length + 1}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-light text-black dark:text-white">
                            {project.title}
                          </h3>
                          <ArrowUpRight className="w-4 h-4 text-neutral-400 transition-all duration-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                        <p className="text-sm text-neutral-500 font-light line-clamp-2 mb-4">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack.slice(0, 3).map(tech => (
                            <span
                              key={tech}
                              className="px-2.5 py-0.5 text-[11px] font-light rounded-full"
                              style={{ color: `rgb(${color})`, background: `rgba(${color}, 0.08)` }}
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="px-2 py-0.5 text-[11px] font-light text-neutral-400">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-light text-black dark:text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            Have a project in mind?
          </motion.h2>
          <motion.p
            className="mt-6 text-neutral-500 dark:text-neutral-400 font-light max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            I'd love to hear about it. Let's turn your ideas into reality together.
          </motion.p>
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <a href="/have-an-idea">
              <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full px-8 py-6 text-base font-light">
                Let's Talk
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• PROJECT DETAIL â€” full-screen immersive experience â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailOverlay
            project={selectedProject}
            color={PROJECT_COLORS[(selectedProject.id - 1) % PROJECT_COLORS.length]}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
