import { ParticlesProvider } from "@tsparticles/react";
import { useMediaQuery } from "@mui/material";
import { loadFull } from "tsparticles";
import { getThemeType } from "@/components/theme/theme";
import { LeafParticle } from "./leaf";
import { SakuraParticle } from "./sakura";
import { SnowParticle } from "./snow";
import { useParticleManagerStore } from "./hooks";

export function ParticleComponent() {
  const showParticle = useParticleManagerStore(state => state.showParticle);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const type = getThemeType();
  const Particle = type === "spring" ? SakuraParticle
    : type === "fall" ? LeafParticle
    : type === "winter" || type === "christmas" ? SnowParticle : null;

  if (!showParticle || reduceMotion || !Particle) return null;

  return (
    <div aria-hidden="true">
      <ParticlesProvider init={loadFull}>
        <Particle />
      </ParticlesProvider>
    </div>
  );
}
