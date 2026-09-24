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
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        { fontFamily: "BMDoHyeon" },
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
