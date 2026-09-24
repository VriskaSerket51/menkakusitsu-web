import { useEffect, useState, type ReactNode } from "react";
import { CircularProgress } from "@mui/material";
import { restoreSession } from "./session";
import { openConfirmDialog } from "@/components/popup/hooks";
import { DialogTitle } from "@/utils/constants";

export function SessionBoundary({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const restore = () => {
      if (!active) return;
      void restoreSession().then(() => { if (active) setReady(true); }).catch(() => {
        if (active) openConfirmDialog(DialogTitle.Alert,
          "서버와 통신에 실패하였습니다. 인터넷 연결 상태를 확인해주세요.", restore);
      });
    };
    restore();
    return () => { active = false; };
  }, []);
  return ready ? children : <CircularProgress aria-label="Loading" sx={{ display: "block", mx: "auto", mt: 8 }} />;
}
