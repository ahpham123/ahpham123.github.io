/**
 * Whether the 3D garden can mount: desktop-width viewport, no
 * reduced-motion preference, and working WebGL. The nav uses this to
 * decide whether its section buttons are the primary navigation
 * (scene unavailable) or a visually-hidden accessible fallback
 * (scene showing — rocks in the garden take over).
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const DESKTOP = "(min-width: 768px)";

export function subscribeSceneAvailable(onChange: () => void): () => void {
  const reduced = window.matchMedia(REDUCED_MOTION);
  const desktop = window.matchMedia(DESKTOP);
  reduced.addEventListener("change", onChange);
  desktop.addEventListener("change", onChange);
  return () => {
    reduced.removeEventListener("change", onChange);
    desktop.removeEventListener("change", onChange);
  };
}

let webglSupported: boolean | null = null;

export function getSceneAvailable(): boolean {
  if (webglSupported === null) {
    const probe = document.createElement("canvas");
    webglSupported = Boolean(
      probe.getContext("webgl2") ?? probe.getContext("webgl"),
    );
  }
  return (
    webglSupported &&
    !window.matchMedia(REDUCED_MOTION).matches &&
    window.matchMedia(DESKTOP).matches
  );
}

export function getSceneAvailableServerSnapshot(): boolean {
  return false;
}
