import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

startTransition(() => { hydrateRoot(document, <HydratedRouter />); });

if ("serviceWorker" in navigator) {
  const register = () => { void navigator.serviceWorker.register("/service-worker.js").catch(console.error); };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
