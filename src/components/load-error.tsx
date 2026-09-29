import { Alert, Button } from "@mui/material";

export function LoadError({ message, onRetry }: { message: string | null; onRetry?: () => void }) {
  return message ? <Alert severity="error" action={onRetry && <Button color="inherit" onClick={onRetry}>다시 시도</Button>}
    sx={{ my: 2, mx: "auto", width: "calc(100% - 32px)", maxWidth: 1152 }}>
    {message}
  </Alert> : null;
}
