import { Alert } from "@mui/material";

export function LoadError({ message }: { message: string | null }) {
  return message ? (
    <Alert severity="error" sx={{ my: 2 }}>
      {message}
    </Alert>
  ) : null;
}
