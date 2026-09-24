import { Box, Button, ButtonProps, TypographyProps } from "@mui/material";
import { ReactNode } from "react";

import { TitleText } from "@/components/basics/styled-text";

type SubmitButtonProps = ButtonProps & {
  backgroundColor: string;
  width?: string;
  height?: string;
  children?: ReactNode;
  textProps?: TypographyProps;
};

export function SubmitButton(props: SubmitButtonProps) {
  const {
    backgroundColor,
    width = "100%",
    height = "58px",
    children,
    sx,
    textProps,
    ...rest
  } = props;

  return (
    <Box sx={{ textAlign: "center", width: "100%", height: "100%" }}>
      <Button
        {...rest}
        type="submit"
        variant="contained"
        fullWidth
        sx={[
          ...(Array.isArray(sx) ? sx : [sx]),
          {
            backgroundColor: backgroundColor,
            "&:hover": {
              backgroundColor: "#fff",
              color: backgroundColor,
            },
            height: height,
            width: width,
          },
        ]}
      >
        <TitleText {...textProps}>{children}</TitleText>
      </Button>
    </Box>
  );
}
