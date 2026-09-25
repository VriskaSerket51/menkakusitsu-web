import type { ISourceOptions } from "@tsparticles/engine";

// Density is measured against a laptop-sized viewport; depth also scales speed.
export const seasonalOptions: ISourceOptions = {
  fullScreen: { enable: true, zIndex: 0 },
  style: { pointerEvents: "none" },
  fpsLimit: 45,
  detectRetina: true,
  pauseOnBlur: true,
  pauseOnOutsideViewport: true,
  particles: {
    number: { value: 24, density: { enable: true, width: 1440, height: 900 } },
    move: {
      enable: true,
      direction: 75,
      angle: { value: 20, offset: 0 },
      speed: { min: 0.7, max: 1.8 },
      drift: 0, // drift accumulates acceleration; the initial direction supplies the breeze.
      gravity: { enable: false },
      straight: false,
      outModes: { default: "out" },
    },
    zIndex: { value: { min: 0, max: 65 }, opacityRate: 0.6, sizeRate: 0.7, velocityRate: 0.7 },
    opacity: { value: { min: 0.45, max: 0.8 } },
    size: { value: { min: 7, max: 15 } },
    rotate: {
      value: { min: 0, max: 360 },
      direction: "random",
      animation: { enable: true, speed: { min: 2, max: 7 }, sync: false },
    },
    wobble: { enable: true, distance: { min: 8, max: 22 }, speed: { min: 2, max: 5 } },
  },
};
