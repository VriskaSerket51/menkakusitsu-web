import { useEffect, useState, type ReactNode } from "react";
import { Alert, Button, CircularProgress } from "@mui/material";
import { restoreSession } from "./session";

type SessionBoundaryProps = { children: ReactNode; required?: boolean };

export function SessionBoundary({
  children,
  required = false,
}: SessionBoundaryProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void restoreSession()
      .then(() => {
        if (active) setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = (
    <Alert
      severity="error"
      sx={{ m: 2 }}
      action={
        <Button
          color="inherit"
          onClick={() => {
            setStatus("loading");
            setAttempt((value) => value + 1);
          }}
        >
          다시 시도
        </Button>
      }
    >
      서버와 통신에 실패하였습니다. 인터넷 연결 상태를 확인해주세요.
    </Alert>
  );

  // Keep public content mounted while restoring or retrying the session.
  if (!required)
    return (
      <>
        {status === "error" && retry}
        {children}
      </>
    );
  if (status === "ready") return children;
  if (status === "error") return retry;
  return (
    <CircularProgress
      aria-label="Loading"
      sx={{ display: "block", mx: "auto", mt: 8 }}
    />
  );
}
