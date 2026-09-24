import { create } from "zustand";

export type ParticleState = {
  showParticle: boolean;
};

export const useParticleManagerStore = create<ParticleState>(() => ({
  showParticle: true,
}));

export const setParticleActive = (value: boolean) => {
  useParticleManagerStore.setState({ showParticle: value });
};
