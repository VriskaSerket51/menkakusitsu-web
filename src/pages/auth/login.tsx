import { Permission } from "@/auth";
import { useEffect } from "react";
import { Container, Paper } from "@mui/material";

import LoginPanel from "@/components/panels/login-panel";
import { setFooterActive, setHeaderActive } from "@/hooks/use-navbar";

export default function LoginScreen() {
  useEffect(() => {
    setHeaderActive(false);
    setFooterActive(false);
    return () => {
      setHeaderActive(true);
      setFooterActive(true);
    };
  }, []);

  return (
    <Container
      maxWidth="md"
      sx={{
        margin: "30px auto 50px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper sx={{ padding: "32px" }}>
        <LoginPanel />
      </Paper>
    </Container>
  );
}

LoginScreen.permission = Permission.Guest;
LoginScreen.exact = true;
