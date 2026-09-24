import { PageSurface } from "@/components/layout/page-surface";

import { Permission } from "@/features/auth/token";
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { ManageAccounts } from "@mui/icons-material";
import { ReactNode } from "react";

import { Outlet, useLocation } from "react-router";
import { Navigate, href, useNavigate } from "react-router";

type SidebarItem = {
  title: string;
  path: ReturnType<typeof href>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  icon: ReactNode;
};

const sidebarItems: SidebarItem[] = [
  {
    title: "계정",
    path: href("/setting/account"),
    icon: <ManageAccounts />,
  },
];

export default function SettingLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname.endsWith("/setting")) {
    return <Navigate to="/setting/account" />;
  }

  return (
    <>
      <PageSurface maxWidth="lg">
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              width: 200,
            }}
          >
            <List>
              {sidebarItems.map((sidebarItem) => (
                <ListItemButton
                  key={sidebarItem.path}
                  selected={pathname == sidebarItem.path}
                  onClick={(event) => {
                    navigate(sidebarItem.path);
                    if (sidebarItem.onClick) {
                      sidebarItem.onClick(event);
                    }
                  }}
                >
                  <ListItemIcon>{sidebarItem.icon}</ListItemIcon>
                  <ListItemText primary={sidebarItem.title} />
                </ListItemButton>
              ))}
            </List>
          </Box>
          <Box
            sx={{
              padding: "50px 50px 30px 50px",
              width: "100%",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </PageSurface>
    </>
  );
}

export const handle = { permission: Permission.Student };
