"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import {
  subscribeSceneAvailable,
  getSceneAvailable,
  getSceneAvailableServerSnapshot,
} from "@/lib/scene-available";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

/** Mounts the 3D garden when the environment supports it (see lib). */
export default function HeroSceneMount() {
  const show = useSyncExternalStore(
    subscribeSceneAvailable,
    getSceneAvailable,
    getSceneAvailableServerSnapshot,
  );
  if (!show) return null;
  return <HeroScene />;
}
