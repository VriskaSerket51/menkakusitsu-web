import { useEffect } from "react";
import { useLocation } from "react-router";

import { logPageView } from "@/utils/firebase.client";

export function TrackerComponent() {
  const { pathname } = useLocation();

  useEffect(() => {
    logPageView();
  }, [pathname]);

  return <></>;
}
