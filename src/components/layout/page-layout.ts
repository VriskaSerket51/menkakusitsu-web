import { Box, Container } from "@mui/material";
import { styled, type Theme } from "@mui/material/styles";

export const PageContainer = styled(Container)(({ theme }) => ({
  margin: "24px auto 40px",
  minWidth: 0,
  [theme.breakpoints.up("sm")]: { margin: "32px auto 48px" },
}));

const pageContentStyles = ({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(3, 2),
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "stretch",
  minWidth: 0,
  gap: theme.spacing(3),
  "& > *": { maxWidth: "100%", minWidth: 0 },
  [theme.breakpoints.up("sm")]: { padding: theme.spacing(4) },
});

export const PageContent = styled(Box)(pageContentStyles);
export const PageForm = styled("form")(pageContentStyles);
