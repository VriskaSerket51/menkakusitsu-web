import { hasPermission } from "@/features/auth/token";
import {
  Box,
  Button,
  Typography,
  Menu,
  MenuItem,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
} from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Close, Menu as MenuIcon } from "@mui/icons-material";

import { AccountPanel } from "@/features/auth/account-menu";
import { headerItems } from "@/components/navbar/items";
import * as utilities from "@/utils/utilities";
import Logo from "@/components/basics/logo";
import { useAuth } from "@/features/auth/use-auth";

const navigationStyle = (active: boolean) => (theme: Theme) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : "transparent",
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
});

export function HeaderComponent() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <>
      <Box
        sx={{
          bgcolor: "primary.dark",
          height: "16px"
        }} />
      <Paper component="header" elevation={2}>
        <Box
          sx={{
            bgcolor: "background.paper",
            height: { xs: 64, sm: 80 },
            display: "flex",
            alignItems: "center",
            px: { xs: 2, sm: 4 }
          }}>
          {matches ? <HeaderList /> : <HeaderDrawer />}
        </Box>
      </Paper>
    </>
  );
}

function HeaderList() {
  return (
    <Stack
      direction="row"
      spacing={3}
      sx={{
        flex: 1,
        alignItems: "center"
      }}>
      <Logo />
      {headerItems.map((navbarItem) => {
        if (navbarItem.menu) {
          return (
            <HeaderMenu
              key={navbarItem.title}
              menu={navbarItem.menu}
              title={navbarItem.title}
            />
          );
        } else {
          return (
            <HeaderItem
              key={navbarItem.title}
              permission={navbarItem.permission}
              href={navbarItem.href}
              title={navbarItem.title}
            />
          );
        }
      })}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <AccountPanel />
      </Box>
    </Stack>
  );
}

function HeaderDrawer() {
  const { pathname } = useLocation();
  const permission = useAuth(state => state.payload.permission);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setIsOpen(open);
    };

  return (
    <>
      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)} slotProps={{ paper: { sx: { width: 280, maxWidth: "85vw" } } }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton aria-label="메뉴 닫기" onClick={toggleDrawer(false)}><Close /></IconButton>
        </Box>
        <List component="nav" aria-label="주 메뉴" sx={{ px: 1 }}>
          {headerItems.map(group => {
            const items: HeaderItemProps[] = group.menu ?? [group];
            const visible = items.filter(item => hasPermission({ permission }, item.permission));
            if (!visible.length) return null;
            return <Box key={group.title}>
              {group.menu && <ListSubheader component="div" disableSticky>{group.title}</ListSubheader>}
              {visible.map(item => <ListItemButton
                key={item.href}
                component={Link}
                to={item.href}
                target={item.newTab ? "_blank" : undefined}
                rel={item.newTab ? "noopener noreferrer" : undefined}
                selected={pathname === item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setIsOpen(false)}
                sx={{ borderRadius: 1, minHeight: 48 }}
              ><ListItemText primary={item.title} /></ListItemButton>)}
            </Box>;
          })}
        </List>
      </Drawer>

      <Box
        sx={{
          display: "grid",
          flex: 1,
          gridTemplateColumns: "44px minmax(0, 1fr) 44px",
          alignItems: "center",
        }}
      >
        <IconButton aria-label="메뉴 열기" aria-expanded={isOpen} color="inherit" sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }} onClick={toggleDrawer(true)}>
          <MenuIcon />
        </IconButton>
        <Logo variant="h3" sx={{ justifySelf: "center" }} />
        <AccountPanel />
      </Box>
    </>
  );
}

type HeaderItemProps = {
  permission: number;
  href: string;
  title: string;
  newTab?: boolean;
  onClick?: VoidFunction;
};

function HeaderItem(props: HeaderItemProps) {
  const { permission, href, title, newTab, onClick } = props;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = pathname === href || (href.endsWith("/list") && pathname.startsWith(href.slice(0, -4)));
  const userPermission = useAuth(state => state.payload.permission);

  if (hasPermission({ permission: userPermission }, permission)) {
    return (
      <Box
        style={{
          display: "inline-block",
        }}
      >
        <Button
          color="inherit"
          aria-current={active ? "page" : undefined}
          sx={navigationStyle(active)}
          onClick={() => {
            if (newTab) {
              utilities.openInNewTab(href);
            } else {
              navigate(href);
            }
            if (onClick) {
              onClick();
            }
          }}
        >
          <Typography component="span" color="inherit" sx={{ fontSize: "1rem", fontWeight: 600 }}>
            {title}
          </Typography>
        </Button>
      </Box>
    );
  } else {
    return <></>;
  }
}

type HeaderMenuProps = {
  title: string;
  menu: HeaderItemProps[];
  onClick?: VoidFunction;
};

function HeaderMenu(props: HeaderMenuProps) {
  const { title, menu, onClick } = props;

  const { pathname } = useLocation();
  const active = menu.some(item => item.href === pathname);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const userPermission = useAuth(state => state.payload.permission);

  function openMenu(event: React.MouseEvent<HTMLButtonElement>) {
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  }

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <Box
      style={{
        display: "inline-block",
      }}
    >
      <Button color="inherit" sx={navigationStyle(active || Boolean(anchorEl))} onClick={openMenu} aria-haspopup="menu" aria-expanded={Boolean(anchorEl)}>
        <Typography component="span" color="inherit" sx={{ fontSize: "1rem", fontWeight: 600 }}>
          {title}
        </Typography>
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        {menu.map((menu) => {
          if (hasPermission({ permission: userPermission }, menu.permission)) {
            return (
              <MenuItem
                key={menu.title}
                selected={pathname === menu.href}
                aria-current={pathname === menu.href ? "page" : undefined}
                onClick={() => {
                  if (menu.newTab) {
                    utilities.openInNewTab(menu.href);
                  } else {
                    navigate(menu.href);
                  }
                  closeMenu();
                  if (onClick) {
                    onClick();
                  }
                }}
              >
                {menu.title}
              </MenuItem>
            );
          }
        })}
      </Menu>
    </Box>
  );
}
