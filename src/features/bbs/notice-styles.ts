import { alpha, type Theme } from "@mui/material/styles";

// Editorial emphasis is separate from destructive actions and request errors.
export const noticeColor = (theme: Theme) => theme.palette.mode === "dark" ? "#EAA2A6" : "#A34247";
export const noticeSurface = (theme: Theme) => ({
  backgroundColor: alpha(noticeColor(theme), theme.palette.mode === "dark" ? 0.1 : 0.05),
  borderColor: alpha(noticeColor(theme), 0.25),
});
