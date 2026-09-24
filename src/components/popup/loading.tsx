import { Backdrop } from "@mui/material";
import { useLoadingStore } from "@/components/popup/hooks";
import Spinner from "@/components/basics/spinner";

export function LoadingComponent() {
  const { isLoading, text } = useLoadingStore();

  return (
    <Backdrop
      open={isLoading}
      sx={{
        display: "flex",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        zIndex: 10000,
      }}
    >
      <Spinner text={text} />
    </Backdrop>
  );
}
