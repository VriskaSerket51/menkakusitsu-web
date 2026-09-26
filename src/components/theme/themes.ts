import { createTheme, responsiveFontSizes, type ThemeOptions } from "@mui/material";

const shared: ThemeOptions = {
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          minHeight: 44,
          borderRadius: theme.shape.borderRadius,
          fontFamily: "NotoSansKR",
          fontSize: "0.9375rem",
          fontWeight: 600,
          textTransform: "none",
          ...(ownerState.color === "inherit" && {
            ...(ownerState.variant === "outlined" && {
              borderColor: theme.palette.divider,
              "&:hover": { borderColor: theme.palette.text.secondary, backgroundColor: theme.palette.action.hover },
            }),
          }),
        }),
      },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiAlert: { styleOverrides: {
      root: { alignItems: "center" },
      message: { minWidth: 0, overflowWrap: "anywhere" },
      action: { flexShrink: 0, paddingTop: 0, whiteSpace: "nowrap" },
    } },
    MuiTableCell: { styleOverrides: { head: ({ theme }) => ({
      fontWeight: 700,
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.action.hover,
    }) } },
  },
};

export const defaultTheme = responsiveFontSizes(
  createTheme({
    ...shared,
    typography: {
      fontFamily: "NotoSansKR",
    },
    palette: {
      background: {
        default: "#EDEDED",
      },
      primary: {
        main: "#237D20",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#356B62",
        contrastText: "#FFFFFF",
      },
    },
  })
);

export const christmasTheme = responsiveFontSizes(
  createTheme({
    ...shared,
    typography: {
      fontFamily: "NotoSansKR",
    },
    palette: {
      background: {
        default: "#EDEDED",
      },
      primary: {
        main: "#C9040C",
      },
      secondary: {
        main: "#28560C",
      },
    },
  })
);

export const darkTheme = responsiveFontSizes(
  createTheme({
    ...shared,
    typography: {
      fontFamily: "NotoSansKR",
    },
    palette: {
      mode: "dark",
      primary: { main: "#83CB79", contrastText: "#122510" },
      secondary: { main: "#9CCBC1", contrastText: "#122C27" },
    },
  })
);
