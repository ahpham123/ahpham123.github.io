import { FlowerMark } from "@/components/decor";
import { Reveal } from "@/components/motion";

interface Role {
  org: string;
  title: string;
  where: string;
  when: string;
  bullets: string[];
}

const roles: Role[] = [
  {
    org: "Amazon Alexa",
    title: "Software Development Engineer Intern",
    where: "Bellevue, WA",
    when: "Jun – Sep 2026",
    bullets: [
      "Launched a self-service data aggregation platform — data model, REST API, and orchestration layer across 9 services in Java, Python, and TypeScript (AWS CDK), shipping 30+ production code reviews in 12 weeks.",
      "Automated analytics over 250M+ daily interaction records with Airflow DAGs fanning out one AWS Glue Spark job per schedule, writing idempotent, partitioned output to S3.",
      "Replaced manual SQL report workflows by exposing the API as MCP tools and authoring an AI agent skill, so users create schedules and fetch results conversationally.",
      "Ended recurring silent data loss by root-causing empty-output failures and shipping pre-submission validation of user parameters against live data.",
    ],
  },
  {
    org: "Diversified Technical Systems",
    title: "Embedded Software Engineer Intern",
    where: "Remote",
    when: "Jun – Aug 2025",
    bullets: [
      "Built a hardware simulator in C on a Raspberry Pi 5 emulating a data acquisition board — concurrent streams across 3 UART ports with interrupt-driven transmission latency under 100 µs.",
      "Scaled to 8 independent streams per port with configurable sampling rates and sine frequencies, plus a C + HTML/CSS/JS configuration GUI for repeatable timing tests.",
      "Packaged the simulator as a persistent systemd service so it survives reboots with no monitor or SSH session required.",
    ],
  },
  {
    org: "L3Harris",
    title: "Software Engineer Intern",
    where: "Anaheim, CA",
    when: "Jun – Jul 2022",
    bullets: [
      "Built a computer-vision line-following system using a downward-facing camera for fully autonomous navigation of an obstacle course.",
      "Integrated front-facing sensor input with motor control for collision avoidance — dynamic stopping and rerouting with no human intervention.",
      "Delivered the full autonomous system in a 4-week Agile timeline, iterating on edge-case failures with the team.",
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="relative bg-cream">
      <div className="mx-auto max-w-5xl px-6 pb-10 pt-6 md:px-8 md:pb-12 md:pt-7">
        <Reveal>
          <p className="font-hand text-2xl text-clay md:text-3xl">
            my journey
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-pine md:text-5xl">
            Experience
          </h2>
        </Reveal>

        <ol className="mt-7 space-y-8 border-l-2 border-dashed border-clay/40 pl-8 md:ml-3">
          {roles.map((role, i) => (
            <li key={role.org} className="relative">
              <FlowerMark className="absolute -left-[52px] top-1 h-8 w-8 rounded-full bg-cream p-0.5 md:-left-[53px]" />
              <Reveal delay={i * 0.08}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-2xl font-semibold text-pine">
                    {role.org}
                  </h3>
                  <span className="font-hand text-xl text-clay">
                    {role.when}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-bold uppercase tracking-wide text-moss">
                  {role.title} · {role.where}
                </p>
                <ul className="mt-3 space-y-2">
                  {role.bullets.map((bullet) => (
                    <li
                      key={bullet.slice(0, 32)}
                      className="flex gap-2.5 text-[15px] leading-relaxed text-ink-soft"
                    >
                      <span aria-hidden="true" className="mt-0.5 text-sage">
                        ❀
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
