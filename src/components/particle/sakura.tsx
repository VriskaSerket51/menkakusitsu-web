import Particles from "@tsparticles/react";

import sakura1 from "@/assets/particles/sakura/1.png";
import sakura4 from "@/assets/particles/sakura/4.png";

export function SakuraParticle() {
  return (
      <Particles
        options={{
          particles: {
            shape: {
              type: "images",
              options: {
                images: [
                  {
                    src: sakura1,
                    width: 73,
                    height: 60,
                  },
                  {
                    src: sakura4,
                    width: 82,
                    height: 82,
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
            // tilt: {
            //     direction: "random",
            //     enable: true,
            //     move: true,
            //     value: {
            //         min: 0,
            //         max: 360,
            //     },
            //     animation: {
            //         enable: true,
            //         speed: 30,
            //     },
            // },
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
              value: { min: 0.3, max: 0.7 },
            },
            size: {
              value: { min: 15, max: 25 },
            },
            number: {
              value: 15,
            },
          },
        }}
      />
  );
}
