import { Permission } from "@/auth";
import { useEffect } from "react";
import { Container, Paper } from "@mui/material";

import RegisterPanel from "@/components/panels/register-panel";
import { setHeaderActive } from "@/hooks/use-navbar";

export default function RegisterScreen() {
  useEffect(() => {
    setHeaderActive(false);
    return () => {
      setHeaderActive(true);
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
        <RegisterPanel />
      </Paper>
    </Container>
  );
}

RegisterScreen.permission = Permission.Guest;
RegisterScreen.exact = true;
