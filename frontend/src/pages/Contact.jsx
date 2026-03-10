import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Send, CheckCircle, AlertCircle, User, Mail, MessageSquare,
  FileText, Loader2, MapPin, Phone, ArrowUpRight, Sparkles,
} from 'lucide-react';
import { personalInfo, socialLinks } from '../data/mock';
import { Github, Linkedin, Instagram, Twitter } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════
   ACCENT COLOUR
   ═══════════════════════════════════════════════════ */
const ACCENT = '139, 92, 246';

/* ═══════════════════════════════════════════════════
   MAGNETIC BUTTON — cursor-attracted micro-interaction
   ═══════════════════════════════════════════════════ */
const MagneticWrap = ({ children, strength = 0.35 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });

  const move = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  }, [x, y, strength]);

  const leave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={leave} style={{ x: sx, y: sy }}>
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════
   FLOATING LABEL INPUT — animated label + glow border
   ═══════════════════════════════════════════════════ */
const FloatingField = ({ id, label, icon: Icon, type = 'text', textarea, value, onChange, required }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  const Tag = textarea ? 'textarea' : 'input';

  return (
    <div className="ct-field group relative">
      {/* Glow border on focus */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none"
        style={{
          opacity: focused ? 1 : 0,
          boxShadow: `0 0 28px rgba(${ACCENT}, 0.12), inset 0 0 0 1px rgba(${ACCENT}, 0.35)`,
        }}
      />

      <div
        className={`relative rounded-2xl border transition-all duration-300 overflow-hidden
          ${focused
            ? 'border-white/20 bg-white/[0.04]'
            : 'border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12]'}`}
      >
        {/* Icon */}
        <Icon
          className="absolute left-5 transition-colors duration-300 w-4 h-4"
          style={{
            top: textarea ? '1.25rem' : '50%',
            transform: textarea ? 'none' : 'translateY(-50%)',
            color: focused ? `rgb(${ACCENT})` : 'rgba(255,255,255,0.25)',
          }}
        />

        {/* Floating label */}
        <span
          className="absolute left-12 pointer-events-none transition-all duration-300 font-light"
          style={{
            top: active ? '0.5rem' : textarea ? '1.15rem' : '50%',
            transform: active ? 'none' : textarea ? 'none' : 'translateY(-50%)',
            fontSize: active ? '0.625rem' : '0.875rem',
            letterSpacing: active ? '0.12em' : '0',
            textTransform: active ? 'uppercase' : 'none',
            color: focused ? `rgb(${ACCENT})` : 'rgba(255,255,255,0.3)',
          }}
        >
          {label}
        </span>

        <Tag
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={textarea ? 5 : undefined}
          className={`w-full bg-transparent text-white/80 font-light outline-none resize-none
            placeholder-transparent
            ${textarea ? 'pl-12 pr-5 pt-7 pb-4' : 'pl-12 pr-5 pt-6 pb-2 h-16'}`}
          style={{ fontSize: '0.9375rem' }}
        />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   CONTACT PAGE
   ═══════════════════════════════════════════════════ */
const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const Contact = () => {
  const wrapperRef = useRef(null);
  const heroRef = useRef(null);

  /* ── form state ── */
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  /* ── Mouse tracking for spotlight + parallax ── */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const spotX = useSpring(mx, { stiffness: 200, damping: 30 });
  const spotY = useSpring(my, { stiffness: 200, damping: 30 });

  /* Parallax transforms */
  const heroRotX = useTransform(smy, [0, typeof window !== 'undefined' ? window.innerHeight : 900], [4, -4]);
  const heroRotY = useTransform(smx, [0, typeof window !== 'undefined' ? window.innerWidth : 1440], [-4, 4]);

  const handleMouse = useCallback((e) => {
    mx.set(e.clientX);
    my.set(e.clientY);
  }, [mx, my]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ── Real submission → backend /api/contact ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Server responded with ${res.status}`);
      }

      setStatus({ type: 'success', message: "Message sent! I'll get back to you soon." });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── GSAP scroll animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero words */
      gsap.fromTo('.ct-hero-word',
        { yPercent: 110, rotateX: 60 },
        {
          yPercent: 0, rotateX: 0,
          stagger: 0.08, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: heroRef.current, start: 'top 85%' },
        },
      );
      gsap.fromTo('.ct-hero-desc',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.5,
          scrollTrigger: { trigger: heroRef.current, start: 'top 85%' } },
      );

      /* Info items stagger */
      gsap.fromTo('.ct-info-item',
        { opacity: 0, x: -40, rotateY: 8 },
        {
          opacity: 1, x: 0, rotateY: 0,
          stagger: 0.1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.ct-info-col', start: 'top 82%' },
        },
      );

      /* Form fields stagger */
      gsap.fromTo('.ct-field',
        { opacity: 0, y: 50, rotateX: 8 },
        {
          opacity: 1, y: 0, rotateX: 0,
          stagger: 0.1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.ct-form', start: 'top 82%' },
        },
      );

      /* Social icons */
      gsap.fromTo('.ct-social',
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1, scale: 1,
          stagger: 0.07, duration: 0.5, ease: 'back.out(2)',
          scrollTrigger: { trigger: '.ct-socials', start: 'top 90%' },
        },
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const socials = [
    { icon: Github, link: socialLinks.github, label: 'GitHub' },
    { icon: Linkedin, link: socialLinks.linkedin, label: 'LinkedIn' },
    { icon: Instagram, link: socialLinks.instagram, label: 'Instagram' },
    { icon: Twitter, link: socialLinks.twitter, label: 'Twitter' },
  ];

  /* ── spotlight gradient ── */
  const spotlightBg = useTransform(
    [spotX, spotY],
    ([x, y]) => `radial-gradient(700px circle at ${x}px ${y}px, rgba(${ACCENT}, 0.045) 0%, transparent 65%)`,
  );

  /* ── grid parallax ── */
  const gridX = useTransform(smx, [0, typeof window !== 'undefined' ? window.innerWidth : 1440], [-8, 8]);
  const gridY = useTransform(smy, [0, typeof window !== 'undefined' ? window.innerHeight : 900], [-8, 8]);

  return (
    <div ref={wrapperRef} onMouseMove={handleMouse} className="min-h-screen bg-black text-white overflow-hidden">

      {/* ═══ Mouse spotlight ═══ */}
      <motion.div className="pointer-events-none fixed inset-0 z-0" style={{ background: spotlightBg }} />

      {/* Film grain */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* ════════════════════ HERO ════════════════════ */}
      <section ref={heroRef} className="relative pt-28 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        {/* Background grid with parallax */}
        <motion.div className="absolute inset-[-60px] pointer-events-none" style={{ x: gridX, y: gridY }}>
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
        </motion.div>

        {/* Ambient orb */}
        <div className="absolute top-20 right-[15%] w-96 h-96 pointer-events-none">
          <div className="w-full h-full rounded-full blur-[140px] opacity-[0.07]" style={{ background: `rgb(${ACCENT})` }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8 overflow-hidden">
            <div className="ct-hero-word w-10 h-px" style={{ background: `rgb(${ACCENT})` }} />
            <span className="ct-hero-word text-[10px] tracking-[0.35em] uppercase font-light" style={{ color: `rgb(${ACCENT})` }}>
              Get In Touch
            </span>
          </div>

          {/* 3D perspective title */}
          <motion.div style={{ perspective: 900, rotateX: heroRotX, rotateY: heroRotY }}>
            <h1>
              {["Let's", 'Start', 'a'].map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-3 md:mr-5">
                  <span className="ct-hero-word inline-block text-4xl md:text-6xl lg:text-[5.5rem] font-extralight leading-[1.1]">
                    {word}
                  </span>
                </span>
              ))}
              <br className="hidden md:block" />
              {['Conversation'].map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-3 md:mr-5">
                  <span className="ct-hero-word inline-block text-4xl md:text-6xl lg:text-[5.5rem] font-normal leading-[1.1]">
                    {word}
                  </span>
                </span>
              ))}
            </h1>
          </motion.div>

          <p className="ct-hero-desc mt-8 text-base md:text-lg text-white/35 font-light max-w-xl leading-relaxed">
            Have a project in mind or just want to say hello? Fill out the form and I'll
            get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* ═══ Gradient divider ═══ */}
      <div className="relative h-px max-w-7xl mx-auto px-6 lg:px-8">
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(${ACCENT}, 0.25), transparent)` }} />
      </div>

      {/* ════════════════════ MAIN CONTENT — split layout ════════════════════ */}
      <section className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-14 lg:gap-20">

            {/* ──────── LEFT: Contact info + socials ──────── */}
            <div className="ct-info-col lg:col-span-5 space-y-10">
              {[
                { icon: Mail, label: 'Email', value: personalInfo.email, href: `mailto:${personalInfo.email}` },
                { icon: Phone, label: 'Phone', value: personalInfo.phone, href: `tel:${personalInfo.phone}` },
                { icon: MapPin, label: 'Location', value: personalInfo.location },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="ct-info-item group"
                  whileHover={{ x: 6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  style={{ perspective: 800 }}
                >
                  <div
                    className="relative p-7 rounded-2xl border border-white/[0.06] bg-white/[0.015]
                      backdrop-blur-sm overflow-hidden transition-all duration-500
                      hover:border-white/[0.14] hover:bg-white/[0.03]"
                  >
                    <span className="absolute -top-3 -right-2 text-[5rem] font-black leading-none pointer-events-none select-none"
                      style={{ color: `rgba(${ACCENT}, 0.03)` }}>
                      0{i + 1}
                    </span>

                    <div className="flex items-center gap-5 relative">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                          transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `rgba(${ACCENT}, 0.08)`, border: `1px solid rgba(${ACCENT}, 0.15)` }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: `rgb(${ACCENT})` }} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-light block">
                          {item.label}
                        </span>
                        {item.href ? (
                          <a href={item.href} className="text-white/80 font-light hover:text-white transition-colors duration-300 text-sm md:text-base">
                            {item.value}
                          </a>
                        ) : (
                          <span className="text-white/80 font-light text-sm md:text-base">{item.value}</span>
                        )}
                      </div>
                    </div>

                    <div
                      className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(to right, transparent, rgb(${ACCENT}), transparent)` }}
                    />
                  </div>
                </motion.div>
              ))}

              {/* Social icons — magnetic */}
              <div className="ct-socials pt-6">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-light block mb-5">
                  Follow Me
                </span>
                <div className="flex gap-3">
                  {socials.map((s) => (
                    <MagneticWrap key={s.label} strength={0.4}>
                      <motion.a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ct-social w-12 h-12 rounded-xl border border-white/[0.06] bg-white/[0.015]
                          flex items-center justify-center text-white/30 hover:text-white
                          hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-300"
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                      >
                        <s.icon className="w-5 h-5" />
                      </motion.a>
                    </MagneticWrap>
                  ))}
                </div>
              </div>

              {/* Response time card */}
              <div className="ct-info-item">
                <div
                  className="relative p-7 rounded-2xl overflow-hidden"
                  style={{ background: `linear-gradient(135deg, rgba(${ACCENT}, 0.1), rgba(${ACCENT}, 0.03))` }}
                >
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: `rgb(${ACCENT})` }} />
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-1">Quick Response</h4>
                      <p className="text-xs text-white/35 font-light leading-relaxed">
                        I typically respond within 24 hours. For urgent matters, reach out on LinkedIn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ──────── RIGHT: Contact form ──────── */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="flex flex-col items-center justify-center text-center py-32 relative"
                  >
                    <motion.div
                      className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
                      style={{ border: `2px solid rgb(${ACCENT})`, background: `rgba(${ACCENT}, 0.06)` }}
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    >
                      <CheckCircle className="w-10 h-10" style={{ color: `rgb(${ACCENT})` }} />
                    </motion.div>
                    <h3 className="text-2xl md:text-3xl font-extralight text-white mb-3">Message Sent!</h3>
                    <p className="text-white/35 font-light text-sm max-w-sm">
                      Thank you for reaching out. I'll review your message and get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="ct-form space-y-5"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-px" style={{ background: `rgb(${ACCENT})`, opacity: 0.5 }} />
                      <span className="text-[10px] tracking-[0.35em] uppercase font-light" style={{ color: `rgb(${ACCENT})` }}>
                        Send a Message
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <FloatingField
                        id="name" label="Your Name" icon={User}
                        value={formData.name} onChange={handleChange} required
                      />
                      <FloatingField
                        id="email" label="Email Address" icon={Mail} type="email"
                        value={formData.email} onChange={handleChange} required
                      />
                    </div>

                    <FloatingField
                      id="subject" label="Subject" icon={FileText}
                      value={formData.subject} onChange={handleChange} required
                    />

                    <FloatingField
                      id="message" label="Your Message" icon={MessageSquare} textarea
                      value={formData.message} onChange={handleChange} required
                    />

                    {/* Status banner */}
                    <AnimatePresence>
                      {status.message && (
                        <motion.div
                          initial={{ opacity: 0, y: -12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          className={`flex items-center gap-3 p-4 rounded-xl border ${
                            status.type === 'success'
                              ? 'border-green-500/20 bg-green-500/5 text-green-400'
                              : 'border-red-500/20 bg-red-500/5 text-red-400'
                          }`}
                        >
                          {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                          <span className="text-sm font-light">{status.message}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit button */}
                    <div className="pt-2">
                      <MagneticWrap strength={0.18}>
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          className="ct-field group relative w-full h-14 rounded-full overflow-hidden
                            text-white text-sm font-light flex items-center justify-center gap-2.5
                            disabled:opacity-50 disabled:cursor-not-allowed transition-shadow duration-300
                            hover:shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, rgb(${ACCENT}), rgba(${ACCENT}, 0.75))`,
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Sending…</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 relative z-10" />
                              <span className="relative z-10">Send Message</span>
                              <ArrowUpRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </>
                          )}

                          {/* Shine sweep */}
                          <div
                            className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                              transition-transform duration-700
                              bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                          />
                        </motion.button>
                      </MagneticWrap>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Bottom gradient divider ═══ */}
      <div className="relative h-px max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="h-px"
          style={{ background: `linear-gradient(90deg, transparent, rgba(${ACCENT}, 0.25), transparent)` }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        />
      </div>

      {/* ════════════════════ BOTTOM CTA ════════════════════ */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none">
          <div className="w-full h-full rounded-full blur-[160px] opacity-[0.05]" style={{ background: `rgb(${ACCENT})` }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-extralight text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            Prefer a direct chat?
          </motion.h2>
          <motion.p
            className="mt-5 text-white/30 font-light text-sm max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            Feel free to drop a mail or connect via social platforms — I'm always open to interesting conversations.
          </motion.p>

          <motion.div
            className="mt-10 flex items-center justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <MagneticWrap strength={0.2}>
              <motion.a
                href={`mailto:${personalInfo.email}`}
                className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full
                  border border-white/[0.1] text-white/60 text-sm font-light
                  hover:border-white/20 hover:text-white transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                <Mail className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Email Me</span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(135deg, rgba(${ACCENT}, 0.1), transparent 60%)` }}
                />
              </motion.a>
            </MagneticWrap>

            <MagneticWrap strength={0.2}>
              <motion.a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full
                  text-white text-sm font-light overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, rgb(${ACCENT}), rgba(${ACCENT}, 0.8))` }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                <Linkedin className="w-4 h-4 relative z-10" />
                <span className="relative z-10">LinkedIn</span>
                <ArrowUpRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                    transition-transform duration-700
                    bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                />
              </motion.a>
            </MagneticWrap>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
