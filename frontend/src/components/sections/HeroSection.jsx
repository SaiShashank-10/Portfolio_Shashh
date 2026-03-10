import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import {
  ArrowDown,
  Github,
  Linkedin,
  Instagram,
  Download,
  ArrowRight,
} from 'lucide-react';
import { personalInfo, socialLinks, stats } from '../../data/mock';

/* ═══════════════════════════════════════════════════════════════
   NOISE OVERLAY
   ═══════════════════════════════════════════════════════════════ */
const NoiseSVG = () => (
  <svg className="pointer-events-none fixed inset-0 w-full h-full z-[100] opacity-[0.022]"
    style={{ mixBlendMode: 'overlay' }}>
    <filter id="hNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#hNoise)" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   TEXT SCRAMBLE HOOK — decode effect for role text
   ═══════════════════════════════════════════════════════════════ */
const useTextScramble = (text, active = true, speed = 28) => {
  const [out, setOut] = useState('');
  useEffect(() => {
    if (!active) { setOut(''); return; }
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm0123456789!@#$%&*<>';
    let it = 0;
    const iv = setInterval(() => {
      setOut(
        text.split('').map((c, i) =>
          c === ' ' ? ' ' : i < it ? text[i] : glyphs[Math.floor(Math.random() * glyphs.length)]
        ).join('')
      );
      it += 0.4;
      if (it >= text.length) { setOut(text); clearInterval(iv); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, active, speed]);
  return out;
};

/* ═══════════════════════════════════════════════════════════════
   MAGNETIC WRAPPER — spring-physics cursor follow
   ═══════════════════════════════════════════════════════════════ */
const MagneticWrap = ({ children, className = '', strength = 0.4 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ARCHITECTURAL NAME — viewport-spanning outlined text
   Acts as the structural design foundation of the hero.
   Letters are stroke-only with near-invisible opacity,
   brightening + lifting on cursor proximity with 3D depth.
   ═══════════════════════════════════════════════════════════════ */
const ArchitecturalName = ({ springX, springY }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let letters = [];
    let raf;

    const init = () => {
      letters = Array.from(el.querySelectorAll('.arch-letter'));
    };

    const onMove = (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!letters.length) init();
        letters.forEach((l) => {
          if (l.dataset.busy === '1') return;
          const r = l.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const d = Math.hypot(e.clientX - cx, e.clientY - cy);
          const p = Math.max(0, 1 - d / 400);
          const p2 = p * p;
          const isDark = document.documentElement.classList.contains('dark');
          const fill = isDark ? '240,238,235' : '23,23,23';
          const glowC = isDark ? '255,255,255' : '0,0,0';
          gsap.to(l, {
            y: -p2 * 28,
            z: p2 * 70,
            scale: 1 + p2 * 0.1,
            rotateY: ((e.clientX - cx) / 500) * p * 7,
            opacity: 0.035 + p2 * 0.96,
            color: p2 > 0.06 ? `rgba(${fill},${p2 * 1.1})` : 'transparent',
            WebkitTextStrokeWidth: `${1.5 - p2 * 0.8}px`,
            textShadow: p > 0.05
              ? `0 0 ${p2 * 40}px rgba(${glowC},${isDark ? p2 * 0.18 : p2 * 0.08})`
              : '0 0 0 transparent',
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      });
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      letters.forEach((l) => {
        gsap.to(l, {
          y: 0, z: 0, scale: 1, rotateY: 0, opacity: 0.035,
          color: 'transparent',
          WebkitTextStrokeWidth: '1.5px',
          textShadow: '0 0 0 transparent',
          duration: 1.5, ease: 'elastic.out(1,0.3)', overwrite: 'auto',
        });
      });
    };

    const tid = setTimeout(() => {
      init();
      window.addEventListener('mousemove', onMove);
      document.addEventListener('mouseleave', onLeave);
    }, 300);

    return () => {
      clearTimeout(tid);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  /* Glitch burst on individual letter hover */
  const onHover = useCallback((e) => {
    const l = e.currentTarget;
    if (l.dataset.busy === '1') return;
    l.dataset.busy = '1';
    const line = l.dataset.line;
    const isDark = document.documentElement.classList.contains('dark');
    const fill = isDark ? '240,238,235' : '23,23,23';
    const glowC = isDark ? '255,255,255' : '0,0,0';
    gsap.timeline({ onComplete: () => { l.dataset.busy = '0'; } })
      .to(l, { scale: 1.2, z: 110, opacity: 1, color: `rgb(${fill})`, textShadow: `0 0 30px rgba(${glowC},${isDark ? 0.2 : 0.1})`, WebkitTextStrokeWidth: '0px', duration: 0.12, ease: 'power3.out' })
      .to(l, { skewX: 20, duration: 0.04 }, 0)
      .to(l, { skewX: -14, duration: 0.04 }, 0.04)
      .to(l, { skewX: 0, scale: 1, z: 0, opacity: 0.035, color: 'transparent', textShadow: '0 0 0 transparent', WebkitTextStrokeWidth: '1.5px', duration: 0.9, ease: 'elastic.out(1,0.35)' }, 0.12);
  }, []);

  const renderLetters = useCallback((text, line) => (
    text.split('').map((ch, i) =>
      ch === ' '
        ? <span key={`${line}s${i}`} className="inline-block w-[0.15em]" />
        : <span
            key={`${line}-${i}`}
            data-line={line}
            onMouseEnter={onHover}
            className="arch-letter inline-block cursor-default select-none"
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              WebkitTextStroke: '1.5px currentColor',
              color: 'transparent',
              opacity: 0.035,
            }}
          >
            {ch}
          </span>
    )
  ), [onHover]);

  /* Parallax: rows move in opposite directions for depth feel */
  const x1 = useTransform(springX, [-1, 1], [25, -25]);
  const y1 = useTransform(springY, [-1, 1], [10, -10]);
  const x2 = useTransform(springX, [-1, 1], [-20, 20]);
  const y2 = useTransform(springY, [-1, 1], [-8, 8]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex flex-col justify-center items-center z-[2] overflow-hidden pointer-events-auto"
      style={{ perspective: '1200px' }}
    >
      {/* "SAI" — massive, font-black, stroke-only */}
      <motion.div style={{ x: x1, y: y1, transformStyle: 'preserve-3d' }}>
        <div className="text-[28vw] sm:text-[26vw] md:text-[25vw] lg:text-[26vw] font-black tracking-[-0.08em] leading-[0.75] text-neutral-600 dark:text-neutral-400">
          {renderLetters('SAI', '1')}
        </div>
      </motion.div>
      {/* "SHASHANK" — lighter weight, slightly smaller */}
      <motion.div style={{ x: x2, y: y2, transformStyle: 'preserve-3d' }} className="-mt-[2vw]">
        <div className="text-[12vw] sm:text-[11.5vw] md:text-[12vw] lg:text-[13vw] font-extralight tracking-[-0.03em] leading-[0.8] text-neutral-600 dark:text-neutral-400">
          {renderLetters('SHASHANK', '2')}
        </div>
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HOLOGRAPHIC PORTRAIT — 3D tilt + chromatic aberration
   + rotating gradient ring + circular text arc + scan line
   ═══════════════════════════════════════════════════════════════ */
const HolographicPortrait = ({ mouseX, mouseY }) => {
  const rotX = useSpring(useTransform(mouseY, [-1, 1], [14, -14]), { stiffness: 80, damping: 25 });
  const rotY = useSpring(useTransform(mouseX, [-1, 1], [-14, 14]), { stiffness: 80, damping: 25 });
  /* Chromatic aberration offset */
  const caX = useSpring(useTransform(mouseX, [-1, 1], [-3, 3]), { stiffness: 150, damping: 25 });
  const caY = useSpring(useTransform(mouseY, [-1, 1], [-2, 2]), { stiffness: 150, damping: 25 });
  const negCaX = useTransform(caX, (v) => -v);
  const negCaY = useTransform(caY, (v) => -v);

  return (
    <motion.div
      className="hero-portrait-container relative z-30"
      style={{ perspective: '900px', rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
    >
      {/* Rotating gradient ring */}
      <div className="absolute -inset-5 md:-inset-7 rounded-full hero-gradient-ring pointer-events-none" />

      {/* Rotating text arc — circular typography */}
      <motion.div
        className="absolute -inset-14 md:-inset-20 pointer-events-none z-[5]"
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 300 300" className="w-full h-full opacity-[0.14] dark:opacity-[0.10]">
          <defs>
            <path id="heroArc" d="M 150,150 m -130,0 a 130,130 0 1,1 260,0 a 130,130 0 1,1 -260,0" />
          </defs>
          <text
            className="fill-neutral-500 dark:fill-neutral-500"
            style={{ fontSize: '10.5px', letterSpacing: '0.35em', textTransform: 'uppercase' }}
          >
            <textPath href="#heroArc">
              DEVELOPER &bull; DESIGNER &bull; CREATOR &bull; AI LEARNER &bull; INNOVATOR &bull; BUILDER &bull;
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Counter-rotating outer ring */}
      <motion.div
        className="absolute -inset-20 md:-inset-28 rounded-full border border-neutral-200/[0.05] dark:border-neutral-700/[0.06] pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400/40" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 rounded-full bg-emerald-400/30" />
      </motion.div>

      {/* Portrait with chromatic aberration */}
      <div className="relative w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72">
        {/* Red-shifted channel */}
        <motion.img
          src="/nobg2.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-auto object-cover hero-portrait-mask opacity-[0.18] dark:opacity-25"
          style={{
            x: caX, y: caY,
            filter: 'hue-rotate(-35deg) saturate(2.5) brightness(1.4)',
            mixBlendMode: 'screen',
          }}
        />
        {/* Blue-shifted channel */}
        <motion.img
          src="/nobg2.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-auto object-cover hero-portrait-mask opacity-[0.18] dark:opacity-25"
          style={{
            x: negCaX, y: negCaY,
            filter: 'hue-rotate(35deg) saturate(2.5) brightness(1.4)',
            mixBlendMode: 'screen',
          }}
        />
        {/* Main portrait image */}
        <img
          src="/nobg2.png"
          alt={personalInfo.name}
          className="relative z-10 w-full h-auto object-cover profile-image-enhanced hero-portrait-mask"
        />
        {/* Scan line overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <div className="hero-scan-line w-full" />
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10 scale-[2] blur-[90px] pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-emerald-500/[0.03]" />
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STAT NODE — individual stat with animated count-up
   ═══════════════════════════════════════════════════════════════ */
const StatNode = ({ stat, index, active }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const target = stat.value;
    const dur = 2200;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    const tid = setTimeout(() => requestAnimationFrame(step), index * 200);
    return () => clearTimeout(tid);
  }, [active, stat.value, index]);

  return (
    <motion.div
      className="hero-stat-node group relative cursor-default text-center px-3 md:px-8 py-5 md:py-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 2.2 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
      <div className="absolute inset-1 rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/30 backdrop-blur-sm
        opacity-0 group-hover:opacity-100 transition-opacity duration-400
        border border-neutral-200/20 dark:border-neutral-800/20" />
      <div className="relative z-10">
        <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight text-black dark:text-white tabular-nums">
          {count}{stat.suffix}
        </span>
        <span className="block text-[8px] sm:text-[9px] md:text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mt-1.5 font-light">
          {stat.label}
        </span>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION — cinematic center-stage orchestrator
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const heroRef = useRef(null);
  const [cur, setCur] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const sx = useSpring(mouseX, { stiffness: 45, damping: 28 });
  const sy = useSpring(mouseY, { stiffness: 45, damping: 28 });

  /* Role text scramble-decode */
  const roleText = useTextScramble(
    `${personalInfo.role}  \u2022  ${personalInfo.tagline}`,
    loaded,
    28
  );

  const socialIcons = [
    { icon: Github, link: socialLinks.github, label: 'GitHub' },
    { icon: Linkedin, link: socialLinks.linkedin, label: 'LinkedIn' },
    { icon: Instagram, link: socialLinks.instagram, label: 'Instagram' },
  ];

  /* Global mouse tracking */
  useEffect(() => {
    const onMove = (e) => {
      setCur({ x: e.clientX, y: e.clientY });
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  /* ── GSAP cinematic entrance timeline ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => setLoaded(true),
      });

      /* Cinema overlay fade-out */
      tl.to('.hero-cinema', { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 0);

      /* Architectural name letters — dramatic 3D staggered entrance */
      tl.fromTo('.arch-letter',
        { y: 250, opacity: 0, rotateX: -100, rotateZ: () => gsap.utils.random(-35, 35), scale: 0.05, z: -300 },
        {
          y: 0, opacity: 0.035, rotateX: 0, rotateZ: 0, scale: 1, z: 0,
          stagger: { each: 0.025, from: 'random' },
          duration: 1.8,
        },
        0.3
      );

      /* Greeting text — clip reveal */
      tl.fromTo('.hero-greeting',
        { y: 40, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
        { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.9 },
        0.2
      );

      /* Role line */
      tl.fromTo('.hero-role-line',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        1.1
      );

      /* Bio */
      tl.fromTo('.hero-bio-text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        1.3
      );

      /* CTA buttons */
      tl.fromTo('.hero-cta-btn',
        { y: 40, opacity: 0, scale: 0.85 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.8 },
        1.5
      );

      /* Social icons */
      tl.fromTo('.hero-social-icon',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.08, duration: 0.6 },
        1.7
      );

      /* Side labels */
      tl.fromTo('.hero-side-label',
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        2.2
      );

      /* Scroll indicator bounce */
      gsap.to('.hero-scroll-arrow', {
        y: 8, duration: 1.4, yoyo: true, repeat: -1, ease: 'power1.inOut', delay: 3.2,
      });

      /* Ambient floating shapes */
      gsap.utils.toArray('.hero-ambient').forEach((el) => {
        gsap.to(el, {
          y: `random(-22,22)`,
          x: `random(-14,14)`,
          rotation: `random(-8,8)`,
          duration: `random(5,9)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-white dark:bg-black"
    >
      <NoiseSVG />

      {/* ── Cinema overlay (entrance animation) ── */}
      <div className="hero-cinema absolute inset-0 z-[60] bg-white dark:bg-black pointer-events-none" />

      {/* ── Cursor spotlight gradient ── */}
      <div
        className="hidden lg:block absolute inset-0 z-[3] pointer-events-none transition-none"
        style={{
          background: `radial-gradient(650px circle at ${cur.x}px ${cur.y}px, rgba(129,140,248,0.025), transparent 55%)`,
        }}
      />

      {/* ── Custom cursor ── */}
      <motion.div
        className="hidden lg:block fixed w-4 h-4 rounded-full pointer-events-none z-[999]"
        style={{ border: '1.5px solid rgba(120,120,120,0.3)', mixBlendMode: 'difference' }}
        animate={{ x: cur.x - 8, y: cur.y - 8 }}
        transition={{ type: 'spring', stiffness: 600, damping: 28 }}
      />

      {/* ═══════ BACKGROUND SYSTEM ═══════ */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(128,128,128,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.18) 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />

        {/* Aurora blobs */}
        <motion.div
          className="hero-ambient absolute -top-[10%] right-[5%] w-[35rem] h-[35rem] rounded-full bg-indigo-500/[0.025] dark:bg-indigo-400/[0.03] blur-[120px] pointer-events-none"
          animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hero-ambient absolute bottom-[5%] -left-[8%] w-[30rem] h-[30rem] rounded-full bg-emerald-500/[0.02] dark:bg-emerald-400/[0.025] blur-[100px] pointer-events-none"
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hero-ambient absolute top-[30%] left-[50%] w-72 h-72 rounded-full bg-violet-500/[0.012] dark:bg-violet-400/[0.018] blur-[80px] pointer-events-none"
          animate={{ y: [0, -25, 0], x: [0, 25, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating particles */}
        {[
          { l: '6%', t: '18%', s: 2.5 },
          { l: '22%', t: '10%', s: 2 },
          { l: '45%', t: '6%', s: 1.5 },
          { l: '68%', t: '22%', s: 2 },
          { l: '88%', t: '14%', s: 2.5 },
          { l: '12%', t: '72%', s: 3 },
          { l: '78%', t: '68%', s: 2 },
          { l: '92%', t: '55%', s: 1.5 },
          { l: '35%', t: '88%', s: 2 },
          { l: '55%', t: '78%', s: 2.5 },
          { l: '3%', t: '45%', s: 1.5 },
          { l: '95%', t: '38%', s: 2 },
        ].map((dot, i) => (
          <div
            key={i}
            className="hero-ambient absolute rounded-full bg-neutral-400 dark:bg-neutral-600 pointer-events-none"
            style={{ width: dot.s, height: dot.s, left: dot.l, top: dot.t, opacity: 0.1 + Math.random() * 0.15 }}
          />
        ))}

        {/* Diagonal accent lines */}
        <div className="absolute top-0 left-[18%] w-px h-[140%] bg-gradient-to-b from-transparent via-neutral-300/[0.08] dark:via-neutral-700/[0.08] to-transparent rotate-[22deg] origin-top pointer-events-none" />
        <div className="absolute top-0 right-[28%] w-px h-[130%] bg-gradient-to-b from-transparent via-neutral-300/[0.05] dark:via-neutral-700/[0.05] to-transparent rotate-[-18deg] origin-top pointer-events-none" />
        <div className="absolute top-0 left-[55%] w-px h-[120%] bg-gradient-to-b from-transparent via-neutral-300/[0.04] dark:via-neutral-700/[0.04] to-transparent rotate-[10deg] origin-top pointer-events-none" />
      </div>

      {/* ═══════ ARCHITECTURAL NAME (deepest content layer) ═══════ */}
      <ArchitecturalName springX={sx} springY={sy} />

      {/* ═══════ FOREGROUND CONTENT ═══════ */}
      <div className="relative z-[10] min-h-screen flex flex-col">

        {/* ── Vertical social rail (left edge, desktop) ── */}
        <div className="hidden lg:flex absolute left-5 xl:left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-40">
          <div className="hero-social-icon w-px h-10 bg-neutral-300 dark:bg-neutral-700" />
          {socialIcons.map((s) => (
            <motion.a
              key={s.label}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-social-icon p-2 text-neutral-400 dark:text-neutral-500
                hover:text-black dark:hover:text-white transition-colors duration-300"
              whileHover={{ x: 5, scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={s.label}
            >
              <s.icon className="w-[15px] h-[15px]" />
            </motion.a>
          ))}
          <div className="hero-social-icon w-px h-10 bg-neutral-300 dark:bg-neutral-700" />
        </div>

        {/* ── Center stage ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-10 lg:pt-0 lg:pb-0">

          {/* Greeting eyebrow */}
          <div className="hero-greeting mb-5 lg:mb-8">
            <span className="text-[10px] sm:text-xs md:text-sm tracking-[0.35em] uppercase text-neutral-400 dark:text-neutral-500 font-light">
              Hello &mdash; Welcome to my world
            </span>
          </div>

          {/* Holographic portrait — center stage, overlapping architectural name */}
          <div className="relative mb-5 lg:mb-7">
            <HolographicPortrait mouseX={sx} mouseY={sy} />
          </div>

          {/* Role — scramble decode */}
          <div className="hero-role-line mb-3">
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-light text-neutral-500 dark:text-neutral-400 tracking-wide font-mono">
              {roleText || '\u00A0'}
            </span>
          </div>

          {/* Bio */}
          <p className="hero-bio-text max-w-lg text-center text-[11px] sm:text-xs md:text-sm text-neutral-400 dark:text-neutral-500 font-light leading-relaxed mb-7 lg:mb-9 px-2">
            {personalInfo.bio}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-6">
            <MagneticWrap className="hero-cta-btn" strength={0.45}>
              <Link
                to="/hire-me"
                className="group relative inline-flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full overflow-hidden
                  bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-light
                  transition-shadow duration-500 hover:shadow-[0_0_50px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_0_50px_rgba(255,255,255,0.12)]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-transparent to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10">Hire Me</span>
                <span className="relative z-10 block w-0 group-hover:w-5 overflow-hidden transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </MagneticWrap>

            <MagneticWrap className="hero-cta-btn" strength={0.35}>
              <a
                href={personalInfo.resumeUrl}
                download
                className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full
                  border border-neutral-300 dark:border-neutral-700 text-black dark:text-white text-xs sm:text-sm font-light
                  hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-300"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
                Resume
              </a>
            </MagneticWrap>

            <MagneticWrap className="hero-cta-btn" strength={0.3}>
              <Link
                to="/projects"
                className="group inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full
                  text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm font-light
                  hover:text-black dark:hover:text-white transition-colors duration-300"
              >
                Projects
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </MagneticWrap>
          </div>

          {/* Mobile social icons */}
          <div className="flex lg:hidden items-center gap-4 mb-4">
            {socialIcons.map((s) => (
              <a
                key={s.label}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-social-icon p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors duration-300"
                aria-label={s.label}
              >
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Stats bar (bottom edge) ── */}
        <div className="relative z-20 border-t border-neutral-200/30 dark:border-neutral-800/30">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 md:divide-x divide-neutral-200/25 dark:divide-neutral-800/25">
            {stats.map((s, i) => (
              <StatNode key={i} stat={s} index={i} active={loaded} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2 }}
      >
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[8px] sm:text-[9px] text-neutral-400 tracking-[0.25em] uppercase font-light">
            Scroll
          </span>
          <ArrowDown className="hero-scroll-arrow w-3 h-3 text-neutral-400" />
        </div>
      </motion.div>

      {/* ── Corner typographic labels ── */}
      <div className="hero-side-label absolute top-5 right-5 lg:right-8 z-20 hidden md:block">
        <span className="text-[8px] lg:text-[9px] text-neutral-300 dark:text-neutral-700 tracking-[0.35em] uppercase font-light">
          Portfolio / 2025
        </span>
      </div>
      <div className="hero-side-label absolute bottom-12 right-5 lg:right-8 z-20 hidden md:block">
        <span className="text-[8px] lg:text-[9px] text-neutral-300 dark:text-neutral-700 tracking-[0.35em] uppercase font-light">
          {personalInfo.name}
        </span>
      </div>
      <div className="hero-side-label absolute top-5 left-5 lg:left-8 z-20 hidden lg:block">
        <span className="text-[8px] lg:text-[9px] text-neutral-300 dark:text-neutral-700 tracking-[0.35em] uppercase font-light">
          &lt;/&gt; Full Stack
        </span>
      </div>
    </section>
  );
};

export default HeroSection;
