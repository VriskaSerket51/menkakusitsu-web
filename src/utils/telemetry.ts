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

const titles: Record<string, string> = {
  "/": "홈", "/attendance": "출석부", "/attendance/download": "출석부 다운로드", "/attendance/info": "출석부 설정",
  "/auth": "계정", "/auth/login": "로그인", "/auth/register": "회원가입", "/bbs": "게시판",
  "/chat": "채팅", "/chat/idbot": "이디봇", "/construct": "준비 중", "/contributors": "만든 사람들",
  "/dev": "개발자", "/dev/user": "사용자 관리", "/specialroom": "특별실", "/specialroom/apply": "특별실 신청",
  "/specialroom/management": "신청 관리", "/specialroom/status": "신청 현황", "/setting": "설정", "/setting/account": "계정 설정",
};
export function pageDetails(origin: string, pathname: string) {
  let path = pathname.replace(/\/$/, "") || "/";
  let title = titles[path];
  if (!title) {
    const board = /^\/bbs\/[^/]+\/(?:(list|create)|[^/]+\/(view|edit))$/.exec(path);
    if (board) {
      const mode = board[1] || board[2];
      path = mode === "list" || mode === "create" ? "/bbs/board/" + mode : "/bbs/board/post/" + mode;
      title = ({ list: "게시판", create: "글 작성", view: "게시글", edit: "글 수정" } as Record<string, string>)[mode];
    } else { path = "/not-found"; title = "페이지 없음"; }
  }
  return { page_location: origin + path, page_title: title, page_path: path };
}
export function createPageTracker() {
  let lastPath: string | undefined;
  let previousLocation = "";
  return (origin: string, pathname: string) => {
    if (lastPath === pathname) return null;
    const page = pageDetails(origin, pathname);
    const event = { ...page, page_referrer: previousLocation };
    lastPath = pathname;
    previousLocation = page.page_location;
    return event;
  };
}
