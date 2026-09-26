import { PageSurface } from "@/components/layout/page-surface";
import { PageContent } from "@/components/layout/page-layout";
import { TitleText } from "@/components/basics";
import { Permission } from "@/features/auth/token";
import { Navigate, Outlet, useLocation } from "react-router";

export default function SettingLayout() {
  const { pathname } = useLocation();
  if (pathname.endsWith("/setting")) return <Navigate to="/setting/account" replace />;
  return <PageSurface maxWidth="sm">
    <PageContent>
      <TitleText variant="h2">계정</TitleText>
      <Outlet />
    </PageContent>
  </PageSurface>;
}

export const handle = { permission: Permission.Student };
