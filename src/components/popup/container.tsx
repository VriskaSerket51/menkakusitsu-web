import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { closeAll, useDialogContainerStore } from "@/components/popup/hooks";
import { DialogComponent } from "@/components/popup/dialog";
import { useAuth } from "@/hooks/use-auth";

export function DialogContainer() {
  const { dialogs } = useDialogContainerStore();

  const location = useLocation();
  const { payload } = useAuth();

  useEffect(() => {
    closeAll();
  }, [location, payload]);

  return (
    <>
      {dialogs.map((dialog) => {
        const { id, isOpened, title, content, onYes, onNo, onCancel, close } =
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
            close={close}
          />
        );
      })}
    </>
  );
}
