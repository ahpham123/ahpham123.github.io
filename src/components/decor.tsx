/**
 * Hand-drawn-style decorative SVGs used across the site.
 * All are purely decorative and hidden from assistive tech.
 */

export function FlowerMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {/* petals */}
      <ellipse cx="16" cy="8" rx="4" ry="6" fill="#d9a3a0" />
      <ellipse cx="16" cy="24" rx="4" ry="6" fill="#d9a3a0" />
      <ellipse cx="8" cy="16" rx="6" ry="4" fill="#d9a3a0" />
      <ellipse cx="24" cy="16" rx="6" ry="4" fill="#d9a3a0" />
      <ellipse cx="10.3" cy="10.3" rx="4.4" ry="3.4" transform="rotate(-45 10.3 10.3)" fill="#e4b8b5" />
      <ellipse cx="21.7" cy="10.3" rx="4.4" ry="3.4" transform="rotate(45 21.7 10.3)" fill="#e4b8b5" />
      <ellipse cx="10.3" cy="21.7" rx="4.4" ry="3.4" transform="rotate(45 10.3 21.7)" fill="#e4b8b5" />
      <ellipse cx="21.7" cy="21.7" rx="4.4" ry="3.4" transform="rotate(-45 21.7 21.7)" fill="#e4b8b5" />
      {/* center */}
      <circle cx="16" cy="16" r="4.5" fill="#e9c87f" />
      <circle cx="16" cy="16" r="4.5" stroke="#d4a94e" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

export function Sprig({
  className = "",
  stroke = "#8a9a78",
}: {
  className?: string;
  stroke?: string;
}) {
  return (
    <svg viewBox="0 0 48 64" className={className} aria-hidden="true" fill="none">
      {/* stem */}
      <path
        d="M24 62 C22 44 26 28 24 6"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* leaves */}
      <path d="M24 50 C16 48 10 42 10 34 C18 36 23 42 24 50 Z" fill={stroke} opacity="0.75" />
      <path d="M24 40 C32 38 38 32 38 24 C30 26 25 32 24 40 Z" fill={stroke} opacity="0.75" />
      <path d="M24 28 C17 26 12 21 12 14 C19 16 23 21 24 28 Z" fill={stroke} opacity="0.6" />
      {/* bud */}
      <circle cx="24" cy="6" r="3.5" fill="#d9a3a0" />
    </svg>
  );
}

export function Mushroom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      {/* stem */}
      <path
        d="M20 26 C20 36 19 40 18 44 L30 44 C29 40 28 36 28 26 Z"
        fill="#f3e9d4"
        stroke="#a05a3d"
        strokeWidth="1.5"
      />
      {/* cap */}
      <path
        d="M6 26 C6 14 14 6 24 6 C34 6 42 14 42 26 Z"
        fill="#c1704e"
        stroke="#a05a3d"
        strokeWidth="1.5"
      />
      {/* spots */}
      <circle cx="16" cy="18" r="2.5" fill="#fbf6ec" />
      <circle cx="26" cy="13" r="2" fill="#fbf6ec" />
      <circle cx="33" cy="20" r="2.5" fill="#fbf6ec" />
    </svg>
  );
}

/**
 * Gently irregular wave used between sections.
 * `fill` should match the background of the section it leads into.
 */
export function WavyDivider({
  fill,
  flip = false,
  className = "",
}: {
  fill: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 72"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block w-full h-12 md:h-18 ${flip ? "rotate-180" : ""} ${className}`}
    >
      <path
        d="M0,34 C120,58 240,10 360,30 C480,50 600,14 720,26 C840,38 960,60 1080,38 C1200,16 1320,42 1440,30 L1440,72 L0,72 Z"
        fill={fill}
      />
    </svg>
  );
}
