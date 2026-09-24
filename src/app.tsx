import "@/index.css";
import "@/styles/fonts.css";
import "@/styles/n-progress.css";

import { CssBaseline, ThemeProvider } from "@mui/material";
import Theme from "@/components/theme";
import { Routes } from "@/routes";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function App() {
  const { scheme } = useColorScheme();

  return (
    <ThemeProvider theme={Theme.getTheme(Theme.getThemeType(), scheme)}>
      <CssBaseline />
      <Routes />
    </ThemeProvider>
  );
}
