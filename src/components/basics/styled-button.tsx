import { Box, Button, ButtonProps, Typography, TypographyProps } from "@mui/material";
import { ReactNode } from "react";


type SubmitButtonProps = ButtonProps & {
  width?: string;
  height?: string;
  children?: ReactNode;
  textProps?: TypographyProps;
};

export function SubmitButton(props: SubmitButtonProps) {
  const {
    width = "100%",
    height = "48px",
    children,
    sx,
    textProps,
    type = "submit",
    color = "primary",
    variant = "contained",
    ...rest
  } = props;

  return (
    <Box sx={{ textAlign: "right", width: "100%", height: "100%" }}>
      <Button
        {...rest}
        type={type}
        color={color}
        variant={variant}
        fullWidth
        sx={[
          ...(Array.isArray(sx) ? sx : [sx]),
          {
            height: height,
            width: width,
            maxWidth: "100%",
          },
        ]}
      >
        <Typography component="span" variant="inherit" {...textProps} sx={[...(Array.isArray(textProps?.sx) ? textProps.sx : [textProps?.sx]), { fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit" }]}>{children}</Typography>
      </Button>
    </Box>
  );
}
