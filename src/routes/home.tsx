import { PageContainer } from "@/components/layout/page-layout";
import { Permission } from "@/features/auth/token";
import { Box, Button, Grid } from "@mui/material";
import { useEffect } from "react";

import { openCancelableDialog } from "@/components/popup/hooks";
import { SpecialroomInfoPanel } from "@/features/specialroom/info-panel";
import MealInfo from "@/features/meal/meal-info";
import LoginPanel from "@/features/auth/login-panel";
import Logo from "@/components/basics/logo";
import { useAuth } from "@/features/auth/use-auth";
import { setHeaderActive } from "@/hooks/use-navbar";

export default function MainScreen() {
  const permission = useAuth((state) => state.payload.permission);

  switch (permission) {
    case Permission.Dev:
      return <Student />;
    case Permission.Teacher:
      return <Teacher />;
    case Permission.Student:
      return <Student />;
    case Permission.Guest:
      return <Guest />;
    default:
      return <Guest />;
  }
}

function Guest() {
  useEffect(() => {
    setHeaderActive(false);
    return () => {
      setHeaderActive(true);
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: "50px",
        }}
      >
        <Logo variant="h2" />
      </Box>
      <PageContainer maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <SpecialroomInfoPanel />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: -1, md: 0 } }}>
            <Button
              color="primary"
              sx={{
                width: "100%",
                height: 48,
              }}
              variant="contained"
              onClick={() => {
                openCancelableDialog("로그인", <LoginPanel />);
              }}
            >
              {import.meta.env.VITE_WEB_TITLE || "이디저디"} LOGIN
            </Button>
          </Grid>
          <Grid size={12}>
            <MealInfo />
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
}

function Student() {
  return (
    <>
      <PageContainer maxWidth="xl">
        <MealInfo />
      </PageContainer>
    </>
  );
}

function Teacher() {
  return (
    <>
      <PageContainer maxWidth="xl">
        <MealInfo />
      </PageContainer>
    </>
  );
}
