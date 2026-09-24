import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { decodeTokenPayload, type TokenPayload } from "./token.ts";

type AuthState = { accessToken: string | null; revision: number; payload: TokenPayload };

/** One memory-only store for requests and React; never persist credentials. */
export const authStore = createStore<AuthState>()(subscribeWithSelector((): AuthState => ({
  accessToken: null, revision: 0, payload: decodeTokenPayload(null),
})));

export const getAccessToken = () => authStore.getState().accessToken;
export const getSessionRevision = () => authStore.getState().revision;
export const getTokenPayload = () => authStore.getState().payload;
export const setAccessToken = (accessToken: string | null) => {
  const payload = decodeTokenPayload(accessToken);
  // Increment even for repeated logout: it must invalidate pending refresh work.
  authStore.setState(state => ({ accessToken, payload, revision: state.revision + 1 }));
};
