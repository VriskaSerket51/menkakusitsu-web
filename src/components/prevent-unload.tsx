import { useEffect } from "react";

export function PreventUnload() {
  function beforeunload(this: Window, event: BeforeUnloadEvent) {
    event.preventDefault();
    event.returnValue = "";
  }

  useEffect(() => {
    window.addEventListener("beforeunload", beforeunload);
    return () => window.removeEventListener("beforeunload", beforeunload);
  }, []);
  return <></>;
}
