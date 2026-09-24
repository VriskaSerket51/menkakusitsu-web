import { PageContainer } from "@/components/layout/page-layout";
import { Permission } from "@/features/auth/token";
import { useEffect } from "react";
import { Paper } from "@mui/material";

import RegisterPanel from "@/features/auth/register-panel";
import { setHeaderActive } from "@/hooks/use-navbar";

export default function RegisterScreen() {
  useEffect(() => {
    setHeaderActive(false);
    return () => {
      setHeaderActive(true);
    };
  }, []);

  return (
    <PageContainer
      maxWidth="md"
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Paper sx={{ padding: "32px" }}>
        <RegisterPanel />
      </Paper>
    </PageContainer>
  );
}

export const handle = { permission: Permission.Guest, exact: true };
