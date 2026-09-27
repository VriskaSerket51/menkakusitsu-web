import { useEffect } from "react";
import { useLocation, useMatches } from "react-router";

import { logPageView } from "@/utils/firebase.client";

export function TrackerComponent() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const routeId = matches[matches.length - 1]?.id;

  useEffect(() => {
    if (routeId) logPageView(pathname, routeId);
  }, [pathname, routeId]);

  return <></>;
}
