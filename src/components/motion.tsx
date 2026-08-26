"use client";

/**
 * Small reusable animation primitives. Every one of them degrades to
 * a simple fade (or nothing) when the user prefers reduced motion.
 */

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait before animating in (for stagger effects). */
  delay?: number;
  className?: string;
}

/** Fade-and-rise into place the first time the element scrolls into view. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

interface IdleProps {
  children: ReactNode;
  className?: string;
  /** Full oscillation time in seconds. */
  duration?: number;
}

/** Gentle back-and-forth rotation, like a plant in a breeze. */
export function Sway({ children, className, duration = 3.6 }: IdleProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={{ transformOrigin: "bottom center" }}
      animate={{ rotate: [-2.5, 2.5] }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/** Slow vertical bob, for suns, petals, and scroll hints. */
export function Float({
  children,
  className,
  duration = 4.5,
  distance = 8,
}: IdleProps & { distance?: number }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
