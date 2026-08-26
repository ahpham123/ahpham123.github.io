/**
 * Which section overlay is open. Set by the pebble-word rocks in the
 * 3D garden and by the nav fallback buttons; read by SectionOverlay.
 */

export type SectionId = "about" | "experience" | "works" | null;

let current: SectionId = null;
const listeners = new Set<() => void>();

export function subscribeSection(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getSection(): SectionId {
  return current;
}

export function getSectionServerSnapshot(): SectionId {
  return null;
}

export function setSection(id: SectionId): void {
  current = id;
  listeners.forEach((listener) => listener());
}
