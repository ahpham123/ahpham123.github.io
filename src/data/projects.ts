/**
 * Works section content. Edit this file to update the portfolio —
 * the cards render entirely from this data.
 */

export type Accent = "sage" | "terracotta" | "rose" | "butter";

export interface Project {
  slug: string;
  title: string;
  /** Short, friendly description — one or two sentences. */
  description: string;
  tags: string[];
  links: { label: string; href: string }[];
  /** Color family for the card's illustration band and chips. */
  accent: Accent;
}

export const projects: Project[] = [
  {
    slug: "mnist-digit-recognizer",
    title: "MNIST Digit Recognizer",
    description:
      "A neural network grown from scratch in NumPy — forward pass, backpropagation, and gradient descent with no ML framework — reaching 82% validation accuracy. A preprocessing pipeline (center-of-mass centering, resizing, Gaussian blur) bridges hand-drawn input to MNIST format, served live through a Flask web UI.",
    tags: ["Python", "NumPy", "Flask", "JavaScript"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ahpham123/DigitRecognition",
      },
    ],
    accent: "sage",
  },
  {
    slug: "acmcsuf-api",
    title: "API for acmcsuf.com",
    description:
      "Long-tended contribution to CSUF ACM's club API: database and schema design in SQLite for board members and events, plus data processing so the site pulls from the API instead of hand-loaded content — faster and far easier to keep fresh.",
    tags: ["Go", "SQLite", "OpenAPI"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/acmcsufoss/api.acmcsuf.com",
      },
    ],
    accent: "terracotta",
  },
  {
    slug: "ocean-guesser",
    title: "OceanGuesser",
    description:
      "A GeoGuessr-style game about oceans and coastlines. Guess where you are from a Street View panorama, or in hard mode from a lone satellite image of open water. Leaderboards, round timers, and distance-based scoring included.",
    tags: ["Next.js", "TypeScript", "Supabase", "Mapbox"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ahpham123/ocean-guesser",
      },
      { label: "Play", href: "https://ocean-guesser.vercel.app" },
    ],
    accent: "butter",
  },
  {
    slug: "cottage-garden",
    title: "This Cottage Garden",
    description:
      "The site you're wandering through. A low-poly 3D garden with a river, drifting petals, and a working day/night cycle, statically exported and deployed to GitHub Pages.",
    tags: ["Next.js", "TypeScript", "three.js", "Motion"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ahpham123/ahpham123.github.io",
      },
    ],
    accent: "rose",
  },
];
