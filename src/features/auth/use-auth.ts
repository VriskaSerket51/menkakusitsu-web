import { useStore } from "zustand";
import { authStore } from "./session-state";

type AuthState = ReturnType<typeof authStore.getState>;
export const useAuth = <T>(selector: (state: AuthState) => T): T => useStore(authStore, selector);
