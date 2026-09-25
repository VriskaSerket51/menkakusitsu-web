import { keyframes } from "@emotion/react";
import { LinearProgress, styled } from "@mui/material";
import { useNavigation } from "react-router";

const reveal = keyframes({ to: { opacity: 1 } });

const Progress = styled(LinearProgress)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 3,
  zIndex: theme.zIndex.tooltip + 1,
  pointerEvents: "none",
  opacity: 0,
  // Unmounting cancels the delay, so fast navigations never flash a bar.
  animation: `${reveal} 0s linear 150ms forwards`,
  "@media (prefers-reduced-motion: reduce)": {
    "& .MuiLinearProgress-bar": { animation: "none", transform: "none", width: "35%" },
    "& .MuiLinearProgress-bar2": { display: "none" },
  },
  "@media print": { display: "none" },
}));

export function NavigationProgress() {
  const navigation = useNavigation();
  if (navigation.state === "idle") return null;
  return <Progress aria-label="페이지 이동 중" />;
}
