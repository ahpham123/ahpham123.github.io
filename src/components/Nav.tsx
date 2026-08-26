"use client";

import { useSyncExternalStore } from "react";
import { FlowerMark } from "@/components/decor";
import {
  subscribeTheme,
  isNight,
  isNightServerSnapshot,
  toggleTheme,
} from "@/lib/theme";
import {
  subscribeSceneAvailable,
  getSceneAvailable,
  getSceneAvailableServerSnapshot,
} from "@/lib/scene-available";
import { setSection, type SectionId } from "@/lib/section";

const links: { id: SectionId; label: string }[] = [
  { id: null, label: "home" },
  { id: "about", label: "about" },
  { id: "experience", label: "experience" },
  { id: "works", label: "works" },
];

export default function Nav() {
  const night = useSyncExternalStore(
    subscribeTheme,
    isNight,
    isNightServerSnapshot,
  );
  // When the 3D garden is showing, the pebble rocks are the visual
  // navigation — these buttons stay in the DOM for screen readers and
  // keyboards, appearing only on focus.
  const rocksActive = useSyncExternalStore(
    subscribeSceneAvailable,
    getSceneAvailable,
    getSceneAvailableServerSnapshot,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-linen bg-cream/85 backdrop-blur-sm">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3"
      >
        <button
          type="button"
          onClick={() => setSection(null)}
          className="flex items-center gap-2"
        >
          <FlowerMark className="h-7 w-7" />
          <span className="font-hand text-2xl text-pine">Anna Pham</span>
        </button>
        <div className="flex items-center gap-4 sm:gap-7">
          <ul className="flex items-center gap-4 sm:gap-7">
            {links.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={() => setSection(link.id)}
                  className={`text-sm font-semibold lowercase tracking-wide text-ink-soft transition-colors hover:text-clay hover:underline decoration-wavy decoration-terracotta underline-offset-6 ${
                    rocksActive
                      ? "sr-only focus:not-sr-only focus:rounded-full focus:bg-cream focus:px-3 focus:py-1"
                      : ""
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={night}
            aria-label={night ? "Switch to day" : "Switch to night"}
            title={night ? "Switch to day" : "Switch to night"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-sage bg-cream text-lg text-honey transition hover:border-moss hover:shadow-soft"
          >
            <span aria-hidden="true">{night ? "☾" : "☀"}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
