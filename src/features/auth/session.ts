import * as client from "@/api/generated/client";
import { isSessionError } from "@/api/errors";
import { createSessionRefresher } from "./refresh-session";
import { getAccessToken, getSessionRevision, setAccessToken } from "./session-state";
import { decodeTokenPayload } from "./token";
import { removeLegacyTokens } from "@/utils/storage";

// Serialize every cookie mutation across tabs, including login and logout.
export const sessionLock = <T>(run: () => Promise<T>): Promise<T> => typeof navigator !== "undefined" && navigator.locks
  ? navigator.locks.request("menkakusitsu-session", run) : run();
let channel: BroadcastChannel | undefined;
let initialized = false;
export const refreshSession = createSessionRefresher({
  read: getAccessToken, revision: getSessionRevision, save: setAccessToken,
  needsRefresh: token => {
    const claims = decodeTokenPayload(token);
    return !claims.sid || claims.exp - Date.now() / 1000 < 60;
  },
  lock: sessionLock,
  refresh: () => client.postRefresh({}, { timeout: 15000 }).catch(error => {
    if (isSessionError(error)) return null;
    throw error;
  }),
});

export const restoreSession = async () => {
  if (!initialized) {
    initialized = true;
    removeLegacyTokens();
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("menkakusitsu-session");
      // Other tabs reload their account-specific data without sharing tokens.
      channel.onmessage = event => {
        if (event.data === "changed") {
          setAccessToken(null);
          window.location.reload();
        }
      };
    }
  }
  await refreshSession();
};

export const onLogout = () => { setAccessToken(null); };

export const notifySessionChange = () => channel?.postMessage("changed");
