import { Outlet } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import popup from "@/components/popup";
import firebase from "@/components/firebase";
import Particle from "@/components/particle";
import Theme from "@/components/theme";
import Navbar from "@/components/navbar";
import { useNavbar } from "@/hooks/use-navbar";

export default function RootLayout() {
  const { noHeader, noFooter } = useNavbar();

  return (
    <>
      <popup.DialogContainer />
      <popup.LoadingComponent />
      <SnackbarProvider
        maxSnack={5}
        autoHideDuration={6000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <firebase.FirebaseComponent />
        <firebase.TrackerComponent />
        <Particle.ParticleComponent />
        <Theme.AddonComponent type={Theme.getThemeType()} />
        {!noHeader && <Navbar.HeaderComponent />}
        <Outlet />
        {!noFooter && <Navbar.FooterComponent />}
      </SnackbarProvider>
    </>
  );
}
