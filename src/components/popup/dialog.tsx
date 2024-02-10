import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { ReactElement, forwardRef } from "react";

import { useDialogStore } from "@/components/popup/hooks";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function DialogComponent() {
  const { isOpened, title, content, onYes, onNo, onCancel, close } =
    useDialogStore();

  return (
    <Dialog
      open={isOpened}
      maxWidth="sm"
      TransitionComponent={Transition}
      fullWidth
      onClose={() => {
        if (onCancel) {
          onCancel();
          close();
        }
      }}
    >
      <DialogTitle>
        {title}
        {onCancel && (
          <IconButton
            onClick={() => {
              onCancel();
              close();
            }}
          >
            <Close />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        {onYes && (
          <Button
            onClick={() => {
              onYes();
              close();
            }}
          >
            확인
          </Button>
        )}
        {onNo && (
          <Button
            onClick={() => {
              onNo();
              close();
            }}
          >
            아니오
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
