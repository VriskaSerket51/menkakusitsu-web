import { Alert } from "@mui/material";

export function LoadError({ message }: { message: string | null }) {
  return message ? (
    <Alert severity="error" sx={{ my: 2, mx: "auto", width: "calc(100% - 32px)", maxWidth: 1152 }}>
      {message}
    </Alert>
  ) : null;
}
