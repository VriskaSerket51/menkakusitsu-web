import { PageContainer } from "@/components/layout/page-layout";
import { Permission } from "@/features/auth/token";
import { useEffect } from "react";
import { Paper } from "@mui/material";

import LoginPanel from "@/features/auth/login-panel";
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
    <PageContainer
      maxWidth="md"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Paper sx={{ padding: "32px" }}>
        <LoginPanel />
      </Paper>
    </PageContainer>
  );
}

export const handle = { permission: Permission.Guest, exact: true };
