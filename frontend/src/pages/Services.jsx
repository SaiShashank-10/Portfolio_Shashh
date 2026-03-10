import React, { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import {
  Globe, Layers, Palette, Brain, MessageSquare, ArrowRight,
} from 'lucide-react';
import { services } from '../data/mock';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */
const iconMap = { Globe, Layers, Palette, Brain, MessageSquare };

const serviceThemes = [
  { rgb: '59, 130, 246' },
  { rgb: '139, 92, 246' },
  { rgb: '236, 72, 153' },
  { rgb: '16, 185, 129' },
  { rgb: '245, 158, 11' },
];

const categoryLabels = {
  Globe: 'Development',
  Layers: 'Engineering',
  Palette: 'Design',
  Brain: 'Intelligence',
  MessageSquare: 'Strategy',
};

/* ═══════════════════════════════════════════════════
   MAGNETIC HOOK
   ═══════════════════════════════════════════════════ */
const useMagnetic = (strength = 0.25) => {
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
   MAIN SERVICES PAGE — GSAP PINNED STACKING CARDS
   The entire section PINS in place. Cards slide up
   from below and stack on top of each other as the
   user scrolls. Scrolling up reverses the stack.
   ═══════════════════════════════════════════════════ */
const Services = () => {
  const wrapperRef = useRef(null);
  const pinRef = useRef(null);
  const stInstanceRef = useRef(null);
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });
  const [activeCard, setActiveCard] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const { ref: btn1Ref, springX: b1X, springY: b1Y, handleMouse: b1Move, reset: b1Reset } = useMagnetic(0.2);
  const { ref: btn2Ref, springX: b2X, springY: b2Y, handleMouse: b2Move, reset: b2Reset } = useMagnetic(0.2);

  /* Track active card via ref to avoid re-renders on every scroll tick */
  const activeRef = useRef(0);
  const rafId = useRef(0);

  /* ═══ GSAP PINNED SCROLL STACKING ═══ */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({

        /* ——— DESKTOP / TABLET: pinned stacking ——— */
        '(min-width: 768px)': () => {
          const cards = gsap.utils.toArray('.gs-card');
          const total = cards.length;

          /* Promote every card to its own GPU layer up-front */
          cards.forEach((card, i) => {
            gsap.set(card, {
              force3D: true,
              ...(i > 0 ? { yPercent: 100 } : {}),
            });
            if (i > 0) {
              gsap.set(card.querySelectorAll('.gs-reveal'), { opacity: 0, y: 30 });
              gsap.set(card.querySelectorAll('.gs-feat'), { opacity: 0, x: -15 });
              gsap.set(card.querySelectorAll('.gs-line'), { scaleX: 0 });
              gsap.set(card.querySelectorAll('.gs-num'), { opacity: 0, y: 40, scale: 0.8 });
            }
          });

          /* Master pinned timeline —
             The section freezes (pin: true). Scroll drives the timeline.
             Each card transition = 1 unit. Total = (total - 1) units.
             scrub: true → ~0.15 s, ultra-responsive to scroll input. */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: pinRef.current,
              pin: true,
              anticipatePin: 1,
              scrub: true,
              start: 'top top',
              end: () => `+=${window.innerHeight * (total - 1)}`,
              onUpdate: (self) => {
                /* Throttle React state to only fire when card index actually changes */
                const idx = Math.min(Math.round(self.progress * (total - 1)), total - 1);
                if (idx !== activeRef.current) {
                  activeRef.current = idx;
                  cancelAnimationFrame(rafId.current);
                  rafId.current = requestAnimationFrame(() => setActiveCard(idx));
                }
              },
              onEnter: () => setShowNav(true),
              onLeave: () => setShowNav(false),
              onEnterBack: () => setShowNav(true),
              onLeaveBack: () => setShowNav(false),
            },
          });

          stInstanceRef.current = tl.scrollTrigger;

          /* Build stacking transitions for cards 1 → N-1 */
          for (let i = 1; i < total; i++) {
            const pos = i - 1; /* timeline position: 0, 1, 2, 3 */

            /* Previous card: scale down + fade (GPU-friendly opacity instead of filter) */
            tl.to(cards[i - 1], {
              scale: 0.9,
              opacity: 0.4,
              borderRadius: '2rem',
              duration: 1,
              ease: 'none',
              force3D: true,
            }, pos);

            /* New card: slide up from below — ease: 'none' for scrub smoothness */
            tl.fromTo(cards[i],
              { yPercent: 100 },
              { yPercent: 0, duration: 1, ease: 'none', force3D: true },
              pos,
            );

            /* Content animations — wider durations for smoother feel */

            /* Background number */
            tl.fromTo(cards[i].querySelectorAll('.gs-num'),
              { opacity: 0, y: 40, scale: 0.8 },
              { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'none' },
              pos + 0.35,
            );

            /* Content reveal */
            tl.fromTo(cards[i].querySelectorAll('.gs-reveal'),
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, stagger: 0.03, duration: 0.35, ease: 'none' },
              pos + 0.4,
            );

            /* Feature pills */
            tl.fromTo(cards[i].querySelectorAll('.gs-feat'),
              { opacity: 0, x: -15 },
              { opacity: 1, x: 0, stagger: 0.02, duration: 0.3, ease: 'none' },
              pos + 0.55,
            );

            /* Accent line */
            tl.fromTo(cards[i].querySelectorAll('.gs-line'),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.25, ease: 'none' },
              pos + 0.65,
            );
          }
        },

        /* ——— MOBILE: simple entrance animations, no pin ——— */
        '(max-width: 767px)': () => {
          gsap.utils.toArray('.gs-card').forEach((card) => {
            gsap.fromTo(card, { opacity: 0, y: 60 }, {
              opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
            });
            gsap.fromTo(card.querySelectorAll('.gs-feat'), { opacity: 0, x: -15 }, {
              opacity: 1, x: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 75%', toggleActions: 'play none none none' },
            });
          });
        },
      });
    }, wrapperRef);

    return () => {
      cancelAnimationFrame(rafId.current);
      ctx.revert();
    };
  }, []);

  /* Side-nav click → scroll to specific card progress */
  const handleNavClick = (i) => {
    const st = stInstanceRef.current;
    if (!st) return;
    const targetProgress = services.length > 1 ? i / (services.length - 1) : 0;
    const target = st.start + targetProgress * (st.end - st.start);
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <div ref={wrapperRef} className="min-h-screen bg-white dark:bg-black">

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="pt-24 pb-8 lg:pt-36 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-12 h-px bg-neutral-400 dark:bg-neutral-600"
                initial={{ scaleX: 0 }}
                animate={heroInView ? { scaleX: 1 } : {}}
                style={{ transformOrigin: 'left' }}
                transition={{ delay: 0.2, duration: 0.7 }}
              />
              <span className="text-xs tracking-[0.3em] uppercase text-neutral-500 font-light">
                What I Offer
              </span>
            </motion.div>

            <div style={{ perspective: 800 }}>
              {['Services', 'that', 'deliver'].map((word, i) => (
                <motion.span
                  key={i}
                  className={`inline-block mr-3 md:mr-4 text-4xl md:text-5xl lg:text-7xl
                              ${i === 0 ? 'font-normal' : 'font-light'} text-black dark:text-white`}
                  initial={{ opacity: 0, y: 40, rotateX: 50 }}
                  animate={heroInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 100, damping: 18 }}
                >
                  {word}
                </motion.span>
              ))}
              <br />
              {['real', 'results'].map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-3 md:mr-4 text-4xl md:text-5xl lg:text-7xl
                             font-normal text-black dark:text-white"
                  initial={{ opacity: 0, y: 40, rotateX: 50 }}
                  animate={heroInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                  transition={{ delay: 0.45 + i * 0.1, type: 'spring', stiffness: 100, damping: 18 }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <motion.p
              className="mt-8 text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              From concept to deployment, I provide end-to-end solutions that help businesses
              and individuals achieve their digital goals. Each project is crafted with
              attention to detail and a focus on user experience.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── SIDE PROGRESS NAV (fixed, outside the pin) ─── */}
      <div
        className={`fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-4
                    transition-all duration-500
                    ${showNav ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
      >
        {services.map((s, i) => (
          <button
            key={i}
            className="group relative flex items-center"
            onClick={() => handleNavClick(i)}
          >
            <div
              className={`rounded-full transition-all duration-300
                ${activeCard === i
                  ? 'w-3 h-3'
                  : 'w-2 h-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600'
                }`}
              style={
                activeCard === i
                  ? { background: `rgb(${serviceThemes[i].rgb})`, boxShadow: `0 0 12px rgba(${serviceThemes[i].rgb}, 0.6)` }
                  : {}
              }
            />
            <span className="absolute right-7 px-3 py-1.5 rounded-lg text-xs font-light whitespace-nowrap
                           bg-neutral-900 dark:bg-white text-white dark:text-black
                           opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {s.title}
            </span>
          </button>
        ))}
        <div className="absolute top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 -z-10" />
      </div>

      {/* ─── PINNED STACKING SECTION ───
           On desktop: this section is 100vh, pinned in place.
           Cards are absolutely positioned and slide up via GSAP.
           On mobile: cards flow normally in a column. */}
      <div ref={pinRef} className="gs-pin-section md:h-screen relative md:overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 md:h-full md:flex md:items-center">
          <div className="md:relative w-full md:h-[calc(100vh-100px)]">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon];
              const theme = serviceThemes[index];

              return (
                <div
                  key={service.id}
                  className="gs-card mb-8 md:mb-0 md:absolute md:inset-0
                             rounded-2xl md:rounded-3xl overflow-hidden shadow-xl
                             bg-white dark:bg-neutral-950
                             border border-neutral-200/40 dark:border-neutral-800/40"
                  style={{
                    zIndex: index + 1,
                    transformOrigin: 'top center',
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Top accent gradient */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent, rgb(${theme.rgb}), transparent)` }}
                  />

                  {/* Corner glows */}
                  <div
                    className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, rgba(${theme.rgb}, 0.08) 0%, transparent 70%)` }}
                  />
                  <div
                    className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, rgba(${theme.rgb}, 0.04) 0%, transparent 70%)` }}
                  />

                  {/* Background number */}
                  <div className="gs-num absolute right-4 md:right-10 bottom-4 md:bottom-6 pointer-events-none select-none">
                    <span
                      className="text-[6rem] md:text-[9rem] lg:text-[12rem] font-black leading-none tracking-tighter"
                      style={{ WebkitTextStroke: `1.5px rgba(${theme.rgb}, 0.08)`, color: 'transparent' }}
                    >
                      0{service.id}
                    </span>
                  </div>

                  {/* Card content — vertically centered on desktop */}
                  <div className="relative z-10 p-6 md:p-10 lg:p-14 h-full flex flex-col justify-center">
                    {/* Category label */}
                    <div className="gs-reveal flex items-center gap-3 mb-5">
                      <div className="w-8 h-px" style={{ background: `rgb(${theme.rgb})` }} />
                      <span
                        className="text-[11px] tracking-[0.25em] uppercase font-light"
                        style={{ color: `rgb(${theme.rgb})` }}
                      >
                        {categoryLabels[service.icon]}
                      </span>
                    </div>

                    {/* Icon + Title */}
                    <div className="gs-reveal flex items-center gap-4 mb-4">
                      <div
                        className="p-3.5 md:p-4 rounded-xl md:rounded-2xl border border-neutral-200/20 dark:border-neutral-700/30 flex-shrink-0"
                        style={{
                          background: `radial-gradient(circle, rgba(${theme.rgb}, 0.12) 0%, rgba(${theme.rgb}, 0.02) 70%)`,
                          boxShadow: `0 0 30px rgba(${theme.rgb}, 0.08)`,
                        }}
                      >
                        <Icon
                          className="w-6 h-6 md:w-8 md:h-8"
                          style={{ color: `rgb(${theme.rgb})` }}
                          strokeWidth={1.5}
                        />
                      </div>
                      <h2 className="text-2xl md:text-3xl lg:text-5xl font-light text-black dark:text-white leading-tight">
                        {service.title}
                      </h2>
                    </div>

                    {/* Description */}
                    <p className="gs-reveal text-sm md:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-xl mb-6 md:mb-8">
                      {service.description}
                    </p>

                    {/* Accent gradient line */}
                    <div
                      className="gs-line mb-6 md:mb-8 h-px max-w-md origin-left"
                      style={{ background: `linear-gradient(90deg, rgb(${theme.rgb}), transparent)` }}
                    />

                    {/* Features grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 max-w-lg">
                      {service.features.map((feat, fi) => (
                        <div key={fi} className="gs-feat flex items-center gap-2.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: `rgb(${theme.rgb})` }}
                          />
                          <span className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 font-light">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── CTA ─── */}
      <section ref={ctaRef} className="py-24 lg:py-36 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-50/50 dark:via-neutral-950/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-light text-black dark:text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              Ready to start your project?
            </motion.h2>

            <motion.p
              className="mt-6 text-neutral-600 dark:text-neutral-400 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              Let's discuss how I can help bring your vision to life.
              Whether it's a new project or an existing one that needs improvement.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link to="/have-an-idea">
                <motion.div ref={btn1Ref} onMouseMove={b1Move} onMouseLeave={b1Reset} style={{ x: b1X, y: b1Y }}>
                  <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full px-8 py-6 text-base font-light">
                    Start a Project
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>

              <Link to="/contact">
                <motion.div ref={btn2Ref} onMouseMove={b2Move} onMouseLeave={b2Reset} style={{ x: b2X, y: b2Y }}>
                  <Button
                    variant="outline"
                    className="border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-full px-8 py-6 text-base font-light"
                  >
                    Get in Touch
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
