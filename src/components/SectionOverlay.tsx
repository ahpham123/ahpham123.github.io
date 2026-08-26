"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Works from "@/components/Works";
import {
  subscribeSection,
  getSection,
  getSectionServerSnapshot,
  setSection,
} from "@/lib/section";

const titles = {
  about: "About",
  experience: "Experience",
  works: "Works",
} as const;

/**
 * Sections open as a parchment panel floating over the garden —
 * the page itself never scrolls; the panel does.
 */
export default function SectionOverlay() {
  const section = useSyncExternalStore(
    subscribeSection,
    getSection,
    getSectionServerSnapshot,
  );
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!section) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSection(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [section]);

  if (!section) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-8">
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => setSection(null)}
        className="absolute inset-0 cursor-default bg-soil/45"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={titles[section]}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative max-h-[88svh] w-full max-w-3xl overflow-y-auto rounded-3xl border-2 border-clay/30 bg-cream shadow-lifted"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setSection(null)}
          aria-label="Close"
          className="sticky top-3 left-full z-10 mr-3 flex h-9 w-9 items-center justify-center rounded-full border border-sage bg-cream text-lg text-ink-soft shadow-soft transition hover:border-moss hover:text-clay"
        >
          <span aria-hidden="true">×</span>
        </button>
        <div className="-mt-9">
          {section === "about" && <About />}
          {section === "experience" && <Experience />}
          {section === "works" && <Works />}
        </div>
      </motion.div>
    </div>
  );
}
