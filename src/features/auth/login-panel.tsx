import { notify } from "@/components/snackbar/notify";
import { Box, Button, Link, Stack, TextField } from "@mui/material";
import { AccountBox } from "@mui/icons-material";
import type { LoginSuccess } from "@/api/generated/models";

import {
  closeAll,
  startLoading,
  stopLoading,
} from "@/components/popup/hooks";
import { SubmitButton, Text, TitleText } from "@/components/basics";
import * as api from "@/api/actions";
import * as utilities from "@/utils/utilities";
import { useNavigate } from "react-router";

export default function LoginPanel() {
  const navigate = useNavigate();

  const onPostLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = data.get("id")?.toString();
    const password = data.get("password")?.toString();
    if (!id || !password) {
      return;
    }

    startLoading("로그인 중입니다...");
    try {
      const result = await api.postLogin({
        id,
        password: utilities.hashSha3(password),
      });
      await onLoginSuccess(result);
    } catch (error) {
      api.onApiError(error);
    } finally {
      stopLoading();
    }
  };

  const onLoginSuccess = async (result: LoginSuccess) => {
    if (result.callbacks) {
      if (result.callbacks.includes("needChangePw")) {
        notify(
          "기존 4자리 학번을 비밀번호로 사용하시는 경우, 비밀번호를 바꾸셔야합니다.",
          "warning",
        );
        navigate("/setting");
        return;
      }
      if (result.callbacks.includes("needChangeEmail")) {
        notify(
          "비밀번호 복구 등의 서비스를 이용하시려면 이메일을 추가하셔야합니다.",
          "warning",
        );
        navigate("/setting");
        return;
      }
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <TitleText
        variant="h4"
        sx={{
          mr: 2,
          textDecoration: "none",
        }}
      >
        로그인하세요.
      </TitleText>
      <Box component="form" onSubmit={onPostLogin} sx={{ width: "100%", maxWidth: 480 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="id"
          label="ID"
          name="id"
          autoComplete="username"
        />
        <TextField
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <SubmitButton
          fullWidth
          color="primary"
          height="48px"
          sx={{ mt: 3, mb: 2 }}
        >
          LOGIN
        </SubmitButton>
        <Stack
          spacing={1}
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            color="text.secondary"
            component="button"
            type="button"
            onClick={() => {
              notify("현재 제공되지 않는 기능입니다.", "info");
            }}
            variant="body1"
            underline="none"
          >
            비밀번호를 잊어버리셨나요?
          </Link>
          <Button
            color="inherit"
            onClick={() => {
              closeAll();
              navigate("/auth/register");
            }}
            startIcon={<AccountBox />}
          >
            <Text>아직 계정이 없으신가요?</Text>
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
