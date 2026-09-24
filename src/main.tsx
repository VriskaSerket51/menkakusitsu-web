import { createRoot } from "react-dom/client";
import App from "@/app";

const container = document.getElementById("root")!;
createRoot(container).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .catch((e) => console.log(e));
  });
}
