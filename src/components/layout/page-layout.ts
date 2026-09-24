import { Box, Container } from "@mui/material";
import { styled } from "@mui/material/styles";

export const PageContainer = styled(Container)({ margin: "30px auto 50px" });

const pageContentStyles = {
  padding: "50px 30px 30px 30px",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
};

export const PageContent = styled(Box)(pageContentStyles);
export const PageForm = styled("form")(pageContentStyles);
