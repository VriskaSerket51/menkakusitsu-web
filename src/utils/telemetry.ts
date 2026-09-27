export type ActionName = "login" | "register" | "specialroom_apply" | "specialroom_cancel" | "specialroom_manage" | "post_create" | "comment_create" | "push_save" | "push_remove";
export type FailureKind = "permission_denied" | "unsupported" | "network" | "authentication" | "conflict" | "validation" | "server" | "cancelled" | "unknown";
export function failureKind(error: unknown): FailureKind {
  if (!error || typeof error !== "object") return "unknown";
  const value = error as { code?: string; name?: string; response?: { status?: number } };
  if (value.code === "ERR_CANCELED" || value.name === "AbortError") return "cancelled";
  if (value.code === "messaging/permission-blocked" || value.code === "messaging/permission-default" || value.name === "NotAllowedError") return "permission_denied";
  if (value.code === "messaging/unsupported-browser" || value.name === "NotSupportedError") return "unsupported";
  if (["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT", "installations/app-offline"].includes(value.code ?? "")) return "network";
  const status = value.response?.status;
  if (status === 401 || status === 403) return "authentication";
  if (status === 409) return "conflict";
  if (status && status >= 500) return "server";
  if (status && status >= 400) return "validation";
  return "unknown";
}
export type ActionResult = { action: ActionName; outcome: "success" | "failure"; failure_kind?: FailureKind; duration_ms: number };
export async function measureAction<T>(action: ActionName, run: () => Promise<T>, report: (result: ActionResult) => void): Promise<T> {
  const start = performance.now();
  const emit = (result: Omit<ActionResult, "action" | "duration_ms">) => {
    try { report({ action, ...result, duration_ms: Math.round(performance.now() - start) }); } catch { /* Telemetry must never alter an operation. */ }
  };
  try {
    const value = await run();
    emit({ outcome: "success" });
    return value;
  } catch (error) {
    const kind = failureKind(error);
    if (kind !== "cancelled") emit({ outcome: "failure", failure_kind: kind });
    throw error;
  }
}

/** Route IDs come from React Router, never from URLs or user-authored headings. */
export function pageDetails(origin: string, routeId?: string) {
  const name = routeId?.replace(/^routes\//, "") || "unknown";
  return { page_location: origin + "/" + name, page_title: name, page_path: "/" + name };
}
export function createPageTracker() {
  let lastPath: string | undefined;
  let lastRoute: string | undefined;
  let previousLocation = "";
  return (origin: string, pathname: string, routeId: string) => {
    if (lastPath === pathname && lastRoute === routeId) return null;
    const page = pageDetails(origin, routeId);
    const event = { ...page, page_referrer: previousLocation };
    lastPath = pathname;
    lastRoute = routeId;
    previousLocation = page.page_location;
    return event;
  };
}
