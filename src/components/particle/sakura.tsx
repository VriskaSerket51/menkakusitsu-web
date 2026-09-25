import Particles from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import sakura1 from "@/assets/particles/sakura/1.png";
import sakura4 from "@/assets/particles/sakura/4.png";
import { seasonalOptions } from "./options";

const options: ISourceOptions = {
  ...seasonalOptions,
  particles: {
    ...seasonalOptions.particles,
    number: { ...seasonalOptions.particles?.number, value: 32 },
    shape: { type: "image", options: { image: [
      { src: sakura1, width: 73, height: 60 },
      { src: sakura4, width: 82, height: 82 },
    ] } },
    move: { ...seasonalOptions.particles?.move, speed: { min: 0.5, max: 1.25 } },
    size: { value: { min: 6, max: 13 } },
    roll: { enable: true, speed: { min: 1, max: 4 } },
    wobble: { enable: true, distance: { min: 12, max: 28 }, speed: { min: 2, max: 4 } },
  },
};

export function SakuraParticle() {
  return <Particles id="seasonal-petals" options={options} />;
}
