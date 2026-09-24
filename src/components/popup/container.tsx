import { useEffect } from "react";
import { useLocation } from "react-router";

import { closeAll, closeDialog, removeClosedDialog, useDialogContainerStore } from "@/components/popup/hooks";
import { DialogComponent } from "@/components/popup/dialog";
import { useAuth } from "@/features/auth/use-auth";

export function DialogContainer() {
  const dialogs = useDialogContainerStore(state => state.dialogs);

  const location = useLocation();
  const uid = useAuth(state => state.payload.uid);
  const sid = useAuth(state => state.payload.sid);

  useEffect(() => {
    closeAll();
  }, [location, uid, sid]);

  return (
    <>
      {dialogs.map((dialog) => {
        const { id, isOpened, title, content, onYes, onNo, onCancel } =
          dialog;

        return (
          <DialogComponent
            key={id}
            isOpened={isOpened}
            title={title}
            content={content}
            onYes={onYes}
            onNo={onNo}
            onCancel={onCancel}
            close={() => closeDialog(id)}
            onExited={() => removeClosedDialog(id)}
          />
        );
      })}
    </>
  );
}
