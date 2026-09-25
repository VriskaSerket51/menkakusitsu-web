import Particles from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { seasonalOptions } from "./options";

const options: ISourceOptions = {
  ...seasonalOptions,
  particles: {
    ...seasonalOptions.particles,
    number: { ...seasonalOptions.particles?.number, value: 100 },
    shape: { type: "circle" },
    paint: { color: { value: ["#ffffff", "#e3edf7", "#ceddea"] }, fill: { enable: true } },
    size: { value: { min: 1.2, max: 4 } },
    opacity: { value: { min: 0.25, max: 0.7 } },
    move: {
      ...seasonalOptions.particles?.move,
      speed: { min: 0.35, max: 1.2 },
      direction: "bottom",
    },
    wobble: { enable: true, distance: { min: 3, max: 10 }, speed: { min: 1, max: 3 } },
    rotate: { animation: { enable: false } },
  },
};

export function SnowParticle() {
  return <Particles id="seasonal-snow" options={options} />;
}
