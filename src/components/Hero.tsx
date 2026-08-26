import HeroSceneMount from "@/components/HeroSceneMount";

/**
 * Full-viewport garden. On desktop the 3D scene is the whole show —
 * navigation happens by clicking the pebble words on the grass. The
 * illustrated backdrop is the fallback for small screens, reduced
 * motion, and missing WebGL; on phones the name shows here since
 * there's no 3D scene to carry it.
 */
export default function Hero() {
  return (
    <section id="home" className="relative h-full overflow-hidden">
      {/* backdrop: crossfading day/night sky + rolling hills */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="sky-day absolute inset-0" />
        <div className="sky-night absolute inset-0" />
        {/* sun by day, cratered moon by night — stays put, only transforms */}
        <div className="celestial absolute right-[12%] top-[14%] h-24 w-24 blur-[1px] md:h-32 md:w-32" />
        {/* hills */}
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-40 w-full md:h-56"
        >
          <path
            d="M0,180 C240,100 420,220 720,170 C1020,120 1200,230 1440,160 L1440,320 L0,320 Z"
            fill="var(--hill-1)"
            opacity="0.55"
          />
          <path
            d="M0,240 C300,170 560,270 860,220 C1160,170 1320,260 1440,230 L1440,320 L0,320 Z"
            fill="var(--hill-2)"
            opacity="0.75"
          />
        </svg>
        {/* 3D cottage garden — draws over the hills when it mounts */}
        <HeroSceneMount />
      </div>

      {/* name: visible on phones (no 3D scene), sr-only on desktop */}
      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-5xl items-center px-6">
        <div>
          <p className="font-hand text-2xl text-clay md:hidden">
            hello, wanderer&nbsp;&nbsp;✿
          </p>
          <h1 className="mt-2 font-display text-5xl font-semibold leading-[1.05] text-pine md:sr-only">
            Anna Pham
          </h1>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-ink md:hidden">
            I grow software with care — CS student at Cal State Fullerton,
            lately building data platforms at Amazon Alexa.
          </p>
        </div>
      </div>

      {/* tiny footer, since the page no longer scrolls */}
      <p className="absolute bottom-3 right-4 z-10 text-xs text-ink-soft">
        © {new Date().getFullYear()} Anna Pham ·{" "}
        <a
          href="https://github.com/ahpham123"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-wavy underline-offset-2 hover:text-clay"
        >
          GitHub
        </a>
      </p>
    </section>
  );
}
