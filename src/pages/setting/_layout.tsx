import { Permission } from "@/auth";
import {
  Box,
  Container,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import { ManageAccounts } from "@mui/icons-material";
import { ReactNode } from "react";

import { Outlet, useLocation } from "react-router-dom";
import { Navigate, Path, useNavigate } from "@/router";

type SidebarItem = {
  title: string;
  path: Path;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  icon: ReactNode;
};

const sidebarItems: SidebarItem[] = [
  {
    title: "계정",
    path: "/setting/account",
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
      <Container
        maxWidth="lg"
        sx={{
          margin: "30px auto 50px",
        }}
      >
        <Paper>
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
        </Paper>
      </Container>
    </>
  );
}

SettingLayout.permission = Permission.Student;
