import React from 'react';
import { motion } from 'framer-motion';

const SVG_SIZE = 506;
const CX = 253;
const CY = 253;
const RING_PADDING = 24;
const RADIUS_PRIMARY = 250;
const RADIUS_SECONDARY = 253;

const RotatingBorder = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* ── Outer orbit path (decorative thin circle) ── */}
      <div className="absolute pointer-events-none" style={{ inset: '-18px' }} aria-hidden="true">
        <svg viewBox="0 0 542 542" className="w-full h-full orbit-ring-outer">
          <circle cx="271" cy="271" r="268" fill="none" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>

      {/* ── Orbiting dot on outer ring ── */}
      <div className="absolute pointer-events-none" style={{ inset: '-18px' }} aria-hidden="true">
        <svg viewBox="0 0 542 542" className="w-full h-full orbit-dot-track">
          <circle cx="271" cy="3" r="3" fill="currentColor" className="text-neutral-400 dark:text-neutral-500" />
        </svg>
      </div>

      {/* ── Primary animated dashed ring ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-full" style={{ padding: `${RING_PADDING}px` }}>
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a3a3a3" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#a3a3a3" />
            </linearGradient>
          </defs>
          <motion.circle
            cx={CX} cy={CY} r={RADIUS_PRIMARY}
            fill="none"
            stroke="url(#ringGrad)"
            opacity="0.7"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ strokeDasharray: '24 10 0 0', rotate: 0 }}
            animate={{
              strokeDasharray: ['15 120 25 25', '16 25 92 72', '4 250 22 22'],
              rotate: [120, 360],
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            style={{ transformOrigin: '50% 50%' }}
          />
        </svg>
      </div>

      {/* ── Secondary counter-rotating ring ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-full" style={{ padding: `${RING_PADDING - 2}px` }}>
          <motion.circle
            cx={CX} cy={CY} r={RADIUS_SECONDARY}
            fill="none"
            stroke="currentColor"
            className="text-neutral-300 dark:text-neutral-700"
            opacity="0.35"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="6 14"
            initial={{ rotate: 0 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '50% 50%' }}
          />
        </svg>
      </div>

      {/* ── Inner glow ring (static, soft) ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-full" style={{ padding: `${RING_PADDING + 6}px` }}>
          <circle
            cx={CX} cy={CY} r={232}
            fill="none"
            stroke="currentColor"
            className="text-neutral-200 dark:text-neutral-800"
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* ── Image container with border ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 z-10 rounded-full overflow-hidden profile-image-border"
        style={{ inset: `${RING_PADDING + 8}px` }}
      >
        {children}
      </motion.div>

      {/* ── Decorative dots (pulsing) ── */}
      {[
        { pos: 'absolute -top-2 left-1/2 -translate-x-1/2', delay: 0 },
        { pos: 'absolute -bottom-2 left-1/2 -translate-x-1/2', delay: 0.5 },
        { pos: 'absolute top-1/2 -left-2 -translate-y-1/2', delay: 1 },
        { pos: 'absolute top-1/2 -right-2 -translate-y-1/2', delay: 1.5 },
      ].map((dot, i) => (
        <div key={i} className={`${dot.pos} transform`}>
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2 h-2 rounded-full bg-black dark:bg-white"
          />
        </div>
      ))}

      {/* ── Diagonal accent dots (45° positions) ── */}
      {[
        { cls: 'top-[12%] right-[12%]', delay: 0.3, size: 'w-1.5 h-1.5' },
        { cls: 'bottom-[12%] left-[12%]', delay: 0.8, size: 'w-1.5 h-1.5' },
        { cls: 'top-[12%] left-[12%]', delay: 1.2, size: 'w-1 h-1' },
        { cls: 'bottom-[12%] right-[12%]', delay: 1.6, size: 'w-1 h-1' },
      ].map((dot, i) => (
        <div key={`diag-${i}`} className={`absolute ${dot.cls}`}>
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
            className={`${dot.size} rounded-full bg-neutral-400 dark:bg-neutral-600`}
          />
        </div>
      ))}
    </div>
  );
};

export default RotatingBorder;
