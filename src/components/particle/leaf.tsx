import Particles from "@tsparticles/react";

import leaf from "@/assets/particles/fall/leaf.png";

export function LeafParticle() {
  return (
      <Particles
        options={{
          particles: {
            shape: {
              type: "images",
              options: {
                images: [
                  {
                    src: leaf,
                    width: 128,
                    height: 117,
                  },
                ],
              },
            },
            move: {
              direction: "bottom-right",
              enable: true,
              random: false,
              straight: false,
              speed: 5,
            },
            rotate: {
              value: {
                min: 0,
                max: 360,
              },
              direction: "random",
              move: true,
              animation: {
                enable: true,
                speed: 10,
              },
            },
            tilt: {
              direction: "random",
              enable: true,
              move: true,
              value: {
                min: 0,
                max: 360,
              },
              animation: {
                enable: true,
                speed: 30,
              },
            },
            roll: {
              darken: {
                enable: true,
                value: 25,
              },
              enable: true,
              speed: {
                min: 5,
                max: 15,
              },
            },
            opacity: {
              value: { min: 0.5, max: 0.7 },
            },
            size: {
              value: { min: 15, max: 20 },
            },
            number: {
              value: 15,
            },
          },
        }}
      />
  );
}
