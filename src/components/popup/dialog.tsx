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
import { ReactElement, ReactNode, forwardRef } from "react";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type DialogComponentProps = {
  isOpened: boolean;
  title: ReactNode;
  content: ReactNode;
  onYes?: VoidFunction;
  onNo?: VoidFunction;
  onCancel?: VoidFunction;
  close: VoidFunction;
};

export function DialogComponent(props: DialogComponentProps) {
  const { isOpened, title, content, onYes, onNo, onCancel, close } = props;

  return (
    <Dialog
      open={isOpened}
      maxWidth="sm"
      fullWidth
      onClose={() => {
        if (onCancel) {
          close();
          onCancel();
        }
      }}
      slots={{
        transition: Transition
      }}
    >
      <DialogTitle>
        {title}
        {onCancel && (
          <IconButton
            onClick={() => {
              close();
              onCancel();
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
              close();
              onYes();
            }}
          >
            확인
          </Button>
        )}
        {onNo && (
          <Button
            onClick={() => {
              close();
              onNo();
            }}
          >
            아니오
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
