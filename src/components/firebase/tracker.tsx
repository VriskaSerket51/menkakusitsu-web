import { useEffect } from "react";
import { useLocation } from "react-router";

import { logPageView } from "@/utils/firebase.client";

export function TrackerComponent() {
  const location = useLocation();

  useEffect(() => {
    const host = window.location.href;
    if (
      !host.startsWith("localhost") &&
      !host.startsWith("127.") &&
      !host.startsWith("192.")
    ) {
      logPageView();
    }
  }, [location]);

  return <></>;
}
