import Particles from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import leaf from "@/assets/particles/fall/leaf.png";
import { seasonalOptions } from "./options";

const options: ISourceOptions = {
  ...seasonalOptions,
  particles: {
    ...seasonalOptions.particles,
    shape: { type: "image", options: { image: { src: leaf, width: 128, height: 117 } } },
    size: { value: { min: 9, max: 19 } },
    tilt: {
      enable: true, direction: "random", value: { min: 0, max: 360 },
      animation: { enable: true, speed: { min: 3, max: 8 }, sync: false },
    },
    roll: { enable: true, speed: { min: 2, max: 6 }, darken: { enable: true, value: 12 } },
  },
};

export function LeafParticle() {
  return <Particles id="seasonal-leaves" options={options} />;
}
