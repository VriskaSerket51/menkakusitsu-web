import { Paper, type ContainerProps } from "@mui/material";
import type { ReactNode } from "react";
import { PageContainer } from "./page-layout";

export function PageSurface({
  children,
  maxWidth = "md",
}: {
  children: ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
}) {
  return (
    <PageContainer maxWidth={maxWidth}>
      <Paper sx={{ borderRadius: 3, minWidth: 0 }}>{children}</Paper>
    </PageContainer>
  );
}
