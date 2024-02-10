import { Box } from "@mui/material";

import { Popup, SubmitButton, LoginPanel } from "@/components";

export function LoginButton() {
  return (
    <Box
      sx={{
        width: "auto",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SubmitButton
        color="primary.main"
        onClick={() => {
          Popup.openCancelableDialog("", <LoginPanel />);
        }}
      >
        {import.meta.env.VITE_WEB_TITLE} LOGIN
      </SubmitButton>
    </Box>
  );
}
