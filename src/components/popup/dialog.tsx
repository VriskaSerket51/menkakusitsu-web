import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { ReactElement, ReactNode, forwardRef, useEffect, useRef, useId } from "react";

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
  onExited: VoidFunction;
};

export function DialogComponent(props: DialogComponentProps) {
  const { isOpened, title, content, onYes, onNo, onCancel, close, onExited } = props;

  const titleId = useId();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const dismiss = onCancel ?? onNo;
  const entered = useRef(false);
  useEffect(() => {
    // A dialog closed before its first render has no exit transition to finish.
    if (!isOpened && !entered.current) onExited();
  }, [isOpened, onExited]);

  return (
    <Dialog
      open={isOpened}
      maxWidth="sm"
      fullWidth
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "확인"}
      transitionDuration={reducedMotion ? 0 : undefined}
      sx={{ "& .MuiDialog-paper": { m: { xs: 2, sm: 4 }, width: { xs: "calc(100% - 32px)", sm: "calc(100% - 64px)" }, borderRadius: 3 } }}
      onClose={(event, reason) => {
        const keyboard = (event as { nativeEvent?: KeyboardEvent }).nativeEvent;
        if (reason === "escapeKeyDown" && (keyboard?.isComposing || keyboard?.keyCode === 229)) return;
        if (dismiss) {
          close();
          dismiss?.();
        }
      }}
      slotProps={{ transition: { onEnter: () => { entered.current = true; }, onExited } }}
      slots={{
        transition: Transition
      }}
    >
      <DialogTitle sx={{ position: "relative", pr: 7, minHeight: 56 }}>
        <span id={titleId}>{title}</span>
        {dismiss && (
          <IconButton
            aria-label="닫기"
            sx={{ position: "absolute", right: 8, top: 8 }}
            onClick={() => {
              close();
              dismiss?.();
            }}
          >
            <Close />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>{content}</DialogContent>
      <DialogActions>
        {onYes && (
          <Button
            variant="contained"
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
            color="inherit"
            autoFocus
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
