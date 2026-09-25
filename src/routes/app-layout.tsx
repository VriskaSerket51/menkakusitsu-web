import { NavigationProgress } from "@/components/layout/navigation-progress";
import { SessionBoundary } from "@/features/auth/session-boundary";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useAuth } from "@/features/auth/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { canAccessRoute } from "@/features/auth/token";
import { Navigate, useMatches, Outlet } from "react-router";
import { SnackbarProvider } from "notistack";

import { DialogContainer } from "@/components/popup/container";
import { LoadingComponent } from "@/components/popup/loading";
import { FirebaseComponent } from "@/components/firebase/firebase";
import { TrackerComponent } from "@/components/firebase/tracker";
import { ParticleComponent } from "@/components/particle/particle";
import { getTheme, getThemeType } from "@/components/theme/theme";
import { AddonComponent } from "@/components/theme/addon";
import { HeaderComponent } from "@/components/navbar/header";
import { FooterComponent } from "@/components/navbar/footer";
import { useNavbar } from "@/hooks/use-navbar";

export default function RootLayout() {
  const { noHeader, noFooter } = useNavbar();

  const { scheme } = useColorScheme();
  const permission = useAuth((state) => state.payload.permission);
  const matches = useMatches();
  const requiresSession = matches.some(
    ({ handle }) =>
      !!handle &&
      typeof handle === "object" &&
      "permission" in handle &&
      typeof handle.permission === "number",
  );
  const allowed = matches.every((match) =>
    canAccessRoute({ permission }, match.handle),
  );

  return (
    <ThemeProvider theme={getTheme(getThemeType(), scheme)}>
      <CssBaseline />
      <NavigationProgress />
      <ParticleComponent />
      <DialogContainer />
      <LoadingComponent />
      <SnackbarProvider
        maxSnack={3}
        preventDuplicate
        autoHideDuration={5000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <FirebaseComponent />
        <TrackerComponent />
        <AddonComponent type={getThemeType()} />
        {!noHeader && <HeaderComponent />}
        <SessionBoundary required={requiresSession}>
          {allowed ? <Outlet /> : <Navigate to="/" replace />}
        </SessionBoundary>
        {!noFooter && <FooterComponent />}
      </SnackbarProvider>
    </ThemeProvider>
  );
}
