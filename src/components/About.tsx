import { Mushroom } from "@/components/decor";
import { Reveal } from "@/components/motion";

export default function About() {
  return (
    <section id="about" className="relative bg-parchment">
      <div className="mx-auto max-w-5xl px-6 pb-10 pt-6 md:px-8 md:pb-12 md:pt-7">
        <Reveal>
          <p className="font-hand text-2xl text-clay md:text-3xl">
            a little about me
          </p>
          <h2 className="mt-1 font-display text-4xl font-semibold text-pine md:text-5xl">
            About
          </h2>
        </Reveal>

        <div className="mt-7 grid items-start gap-8 md:grid-cols-[2fr_3fr]">
          {/* embroidery-hoop portrait placeholder */}
          <Reveal
            delay={0.1}
            className="mx-auto flex aspect-square w-48 items-center justify-center rounded-full border-8 border-clay/50 bg-cream shadow-soft md:w-56"
          >
            <div className="flex h-[88%] w-[88%] flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-sage">
              <Mushroom className="h-14 w-14" />
              <span className="font-hand text-xl text-ink-soft">
                photo soon
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-lg leading-relaxed text-ink">
              I&rsquo;m a computer science student at California State
              University, Fullerton (B.A. in Computer Science with a Data
              Science minor, graduating May 2027). I like building software
              that feels warm and considered — data platforms, tiny web
              experiments, and everything in between.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Most recently I interned at Amazon Alexa, where I built a
              self-service data aggregation platform end to end. Before that
              I simulated hardware on a Raspberry Pi at Diversified Technical
              Systems and taught a robot to follow lines at L3Harris. Around
              campus, I serve as the Open Source Team Officer for ACM at
              CSUF, helping students make their first contributions.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
