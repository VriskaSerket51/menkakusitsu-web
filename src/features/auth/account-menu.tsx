import {
  DarkMode,
  LightMode,
  Logout,
  NotificationsActive,
  NotificationsOff,
  Settings,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { useState } from "react";

import { openYesNoDialog, startLoading, stopLoading } from "@/components/popup/hooks";
import * as api from "@/api/actions";
import * as constants from "@/utils/constants";
import * as firebase from "@/utils/firebase.client";
import * as storage from "@/utils/storage";
import { changeColorScheme, useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/features/auth/use-auth";
import { useNavigate } from "react-router";

export function AccountPanel() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const loginId = useAuth(state => state.payload.id);

  const open = Boolean(anchorEl);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box>
        <Tooltip title="계정 설정">
          <IconButton aria-label="계정 메뉴" aria-haspopup="menu" aria-expanded={open} onClick={openMenu} size="small" sx={{ width: 44, height: 44, p: 0 }}>
            <Avatar alt={loginId} />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={closeMenu}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem>
          <Avatar /> {loginId}
        </MenuItem>
        <Divider />
        <DarkModeButton />
        <NotificationButton />
        <MenuItem
          onClick={() => {
            navigate("/setting");
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          설정
        </MenuItem>
        <LogoutButton />
      </Menu>
    </>
  );
}

function DarkModeButton() {
  const { scheme } = useColorScheme();

  return (
    <MenuItem
      onClick={() => {
        changeColorScheme(scheme == "light" ? "dark" : "light");
      }}
    >
      {scheme == "light" ? (
        <>
          <ListItemIcon>
            <LightMode fontSize="small" />
          </ListItemIcon>
          라이트모드
        </>
      ) : (
        <>
          <ListItemIcon>
            <DarkMode fontSize="small" />
          </ListItemIcon>
          다크모드
        </>
      )}
    </MenuItem>
  );
}

function LogoutButton() {
  return (
    <MenuItem
      onClick={() => {
        openYesNoDialog(
          constants.DialogTitle.Info,
          "정말 로그아웃 하시겠습니까?",
          () => {
            startLoading("로그아웃 중입니다...");
            api.deleteLogout({}).then((result) => {
              stopLoading();
            }).catch(() => { /* Api already displayed the error. */ });
          }
        );
      }}
    >
      <ListItemIcon>
        <Logout fontSize="small" />
      </ListItemIcon>
      로그아웃
    </MenuItem>
  );
}

function NotificationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationOn, setIsNotificationOn] = useState(
    api.getPushApproved()
  );

  return (
    <MenuItem
      onClick={() => {
        if (isLoading) {
          return;
        }
        setIsLoading(true);
        if (isNotificationOn) {
          firebase.deletePushToken().then((succeeded) => {
            if (succeeded) {
              api.setPushApproved(false);
              setIsNotificationOn(false);
            }
            setIsLoading(false);
          });
        } else {
          firebase.createPushToken().then((token) => {
            if (token) {
              api.putUserPush({
                pushToken: token,
                deviceId: storage.getDeviceId(),
              }).then(() => {
                api.setPushApproved(true);
                setIsNotificationOn(true);
              }).catch(() => { /* Api already displayed the error. */ });
            }
            setIsLoading(false);
          });
        }
      }}
    >
      {isNotificationOn ? (
        <>
          <ListItemIcon>
            {isLoading ? (
              <CircularProgress
                size={24}
                sx={{
                  color: "primary.dark",
                  zIndex: 1,
                }}
              />
            ) : (
              <NotificationsActive fontSize="small" />
            )}
          </ListItemIcon>
          알림 켜짐
        </>
      ) : (
        <>
          <ListItemIcon>
            {isLoading ? (
              <CircularProgress
                size={24}
                sx={{
                  color: "primary.dark",
                  zIndex: 1,
                }}
              />
            ) : (
              <NotificationsOff fontSize="small" />
            )}
          </ListItemIcon>
          알림 꺼짐
        </>
      )}
    </MenuItem>
  );
}
