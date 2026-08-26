import { projects, type Accent } from "@/data/projects";
import { Sprig } from "@/components/decor";
import { Reveal } from "@/components/motion";

const accentStyles: Record<
  Accent,
  { band: string; chip: string; stem: string }
> = {
  sage: {
    band: "bg-sage-light/40",
    chip: "bg-sage/15 text-pine",
    stem: "#8a9a78",
  },
  terracotta: {
    band: "bg-terracotta/15",
    chip: "bg-terracotta/15 text-clay",
    stem: "#c1704e",
  },
  rose: {
    band: "bg-rose/25",
    chip: "bg-rose/25 text-rose-deep",
    stem: "#c07f7c",
  },
  butter: {
    band: "bg-butter/30",
    chip: "bg-butter/35 text-honey",
    stem: "#d4a94e",
  },
};

export default function Works() {
  return (
    <section id="works" className="relative bg-parchment">
      <div className="mx-auto max-w-5xl px-6 pb-10 pt-6 md:px-8 md:pb-12 md:pt-7">
        <Reveal>
          <p className="font-hand text-2xl text-clay md:text-3xl">
            things I&rsquo;ve grown
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-pine md:text-5xl">
            Works
          </h2>
        </Reveal>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          {projects.map((project, i) => {
            const accent = accentStyles[project.accent];
            return (
              <Reveal key={project.slug} delay={(i % 2) * 0.12}>
                <article className="h-full rounded-2xl border-2 border-clay/30 bg-cream p-1.5 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lifted">
                <div className="stitched flex h-full flex-col p-5">
                  {/* illustration band, like the front of a seed packet */}
                  <div
                    className={`relative flex h-28 items-center justify-center rounded-lg ${accent.band}`}
                  >
                    <Sprig className="h-20 w-14" stroke={accent.stem} />
                    <span className="absolute right-3 top-2 font-hand text-lg text-ink-soft">
                      no. {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-semibold text-pine">
                    {project.title}
                  </h3>
                  <p className="mt-2 grow text-[15px] leading-relaxed text-ink-soft">
                    {project.description}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <li
                        key={tag}
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${accent.chip}`}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex gap-4 border-t border-dashed border-clay/30 pt-3">
                    {project.links.map((link) => (
                      <a
                        key={link.href + link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-clay transition-colors hover:text-terracotta hover:underline decoration-wavy underline-offset-4"
                      >
                        {link.label} →
                      </a>
                    ))}
                  </div>
                </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
