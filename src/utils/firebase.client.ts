import { createFidRegistration, type RegistrationChange } from "./fid-registration";
import { createPageTracker, pageDetails, failureKind, type ActionResult } from "./telemetry";
import { initializeApp } from "firebase/app";
import { initializeAnalytics, logEvent, setDefaultEventParameters, type Analytics } from "firebase/analytics";
import {
  unregister,
  onRegistered,
  onUnregistered,
  getMessaging,
  register,
  Messaging,
} from "firebase/messaging";

import { isFirebaseEnabled } from "./firebase-policy";

const firebaseConfig = {
  apiKey: "AIzaSyAzQ_bR2dD4V1vdWoPViPXll6imyCajNCo",
  authDomain: "menkakusitsu-2d69d.firebaseapp.com",
  projectId: "menkakusitsu-2d69d",
  storageBucket: "menkakusitsu-2d69d.appspot.com",
  messagingSenderId: "382894730110",
  appId: "1:382894730110:web:ebf27b97399bec80c2612f",
  measurementId: "G-TE638S9GQ9",
};

export const firebaseEnabled = isFirebaseEnabled(
  window.location.hostname,
  import.meta.env.DEV,
  import.meta.env.VITE_FIREBASE_ENABLED,
);

let registration: ReturnType<typeof createFidRegistration> | undefined;
let analytics: Analytics | undefined;
let messaging: Messaging | undefined;
if (firebaseEnabled) {
  const app = initializeApp(firebaseConfig);
  try {
    analytics = initializeAnalytics(app, { config: {
      send_page_view: false,
      ...pageDetails(window.location.origin, window.location.pathname),
      page_referrer: "",
    } });
  } catch (error) {
    reportFirebaseFailure("analytics_init", error);
  }
  try {
    const instance = getMessaging(app);
    messaging = instance;
    registration = createFidRegistration({
      register: async () => {
        const serviceWorkerRegistration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js?firebase=enabled", { scope: "/firebase-cloud-messaging-push-scope" },
        );
        await register(instance, { serviceWorkerRegistration, vapidKey: "BG_LNhZiWNMNjuR-PTiY8pLm0SJ8itD0lVcEr3cRtkhBEOtzcDbiUVVQ3i5ZERbsmw5Q8kPDqJ1KpvvYF7nKcbk" });
      },
      unregister: () => unregister(instance),
      onRegistered: listener => onRegistered(instance, listener),
      onUnregistered: listener => onUnregistered(instance, listener),
    });
    if (import.meta.hot) import.meta.hot.dispose(() => registration?.dispose());
  } catch (error) {
    reportFirebaseFailure("messaging_init", error);
  }
} else if ("serviceWorker" in navigator) {
  // Remove only this application's previously registered Firebase workers.
  void navigator.serviceWorker.getRegistrations().then(async registrations => {
    await Promise.all(registrations.filter(registration =>
      [registration.active, registration.waiting, registration.installing].some(worker => {
        if (!worker) return false;
        const url = new URL(worker.scriptURL);
        return url.origin === window.location.origin && url.pathname === "/firebase-messaging-sw.js";
      }),
    ).map(registration => registration.unregister()));
  }).catch(error => reportFirebaseFailure("worker_cleanup", error));
}

export const getFirebaseMessaging = () => {
  return messaging;
};

export const subscribePushRegistration = (listener: (change: RegistrationChange) => void) =>
  registration?.subscribe(listener) ?? (() => {});

export const registerPush = async (): Promise<string | null> => {
  if (!firebaseEnabled) return null;
  if (!registration) {
    const error = new DOMException("Push is unsupported", "NotSupportedError");
    reportFirebaseFailure("push_register", error);
    throw error;
  }
  try {
    // Ask during the user gesture, before waiting for the service worker.
    if (await Notification.requestPermission() !== "granted") {
      reportFirebaseFailure("push_register", { name: "NotAllowedError" });
      return null;
    }
    const installationId = await registration.register();
    logPushEvent("registered");
    return installationId;
  } catch (error) {
    reportFirebaseFailure("push_register", error);
    throw error;
  }
};

export const unregisterPush = async (): Promise<void> => {
  if (!registration) return;
  try {
    await registration.unregister();
    logPushEvent("unregistered");
  } catch (error) {
    reportFirebaseFailure("push_unregister", error);
    throw error;
  }
};

const nextPage = createPageTracker();
function emit(name: string, parameters: Record<string, string | number>) {
  if (!analytics) return;
  try { logEvent(analytics, name, parameters); } catch { /* Analytics must not interrupt the UI. */ }
}
export function logActionResult(result: ActionResult) {
  emit("app_action", result);
}
export function logPushEvent(stage: "registered" | "unregistered" | "foreground_received" | "foreground_opened") {
  emit("app_push", { stage });
}
function reportFirebaseFailure(stage: string, error: unknown) {
  const parameters = { stage, failure_kind: failureKind(error) };
  console.warn("Firebase operation failed", parameters);
  emit("app_firebase_error", parameters);
}
export const logPageView = () => {
  if (!analytics) return;
  const page = nextPage(window.location.origin, window.location.pathname);
  if (!page) return;
  try { setDefaultEventParameters(page); } catch { /* Best effort. */ }
  emit("page_view", page);
};
