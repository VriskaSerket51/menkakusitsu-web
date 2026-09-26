import { Link } from "react-router";
import { ArrowBack } from "@mui/icons-material";
import { PageContainer } from "@/components/layout/page-layout";
import { Permission } from "@/features/auth/token";
import { useEffect } from "react";
import { Button, Paper } from "@mui/material";

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
      <Paper sx={{ p: { xs: 1, sm: 4 }, width: "100%", maxWidth: 560, borderRadius: 3 }}>
        <Button color="inherit" component={Link} to="/" startIcon={<ArrowBack />}>홈으로 돌아가기</Button>
        <LoginPanel />
      </Paper>
    </PageContainer>
  );
}

export const handle = { permission: Permission.Guest, exact: true };
