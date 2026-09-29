import { Alert } from "@mui/material";

export function FormError({ message }: { message: string | null }) {
  return message ? <Alert severity="error" role="alert" tabIndex={-1} data-form-error sx={{ my: 2 }}>
    {message}
  </Alert> : null;
}
