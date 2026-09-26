import { Typography, TypographyProps } from "@mui/material";

export function Text(props: TypographyProps) {
  return (
    <Typography
      {...props}
      sx={[
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        { fontFamily: "NotoSansKR" },
      ]}
    >
      {props.children}
    </Typography>
  );
}

export function TitleText(props: TypographyProps) {
  return (
    <Typography
      {...props}
      sx={[
        theme => (/^h[1-6]$/.test(props.variant ?? "") ? {
          fontWeight: 700,
          lineHeight: 1.35,
          ...(props.variant === "h2" ? { fontSize: "1.75rem", [theme.breakpoints.up("sm")]: { fontSize: "2rem" } } : {}),
          color: theme.palette.mode === "dark" ? "#D4E3DA" : "#293D35",
        } : {}),
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        { fontFamily: "NotoSansKR" },
      ]}
    >
      {props.children}
    </Typography>
  );
}

export function LogoText(props: TypographyProps) {
  return (
    <Typography
      {...props}
      sx={[
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        { fontFamily: "DesignHouseB" },
      ]}
    >
      {props.children}
    </Typography>
  );
}
