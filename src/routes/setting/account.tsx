import { notify } from "@/components/snackbar/notify";
import { useLoadError } from "@/hooks/use-load-error";
import { LoadError } from "@/components/load-error";
import { styled } from "@mui/material/styles";
import { Permission } from "@/features/auth/token";
import { Box, Divider, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import { startLoading, stopLoading } from "@/components/popup/hooks";
import * as api from "@/api/actions";
import * as utilities from "@/utils/utilities";
import * as constants from "@/utils/constants";
import { SubmitButton } from "@/components/basics/styled-button";
import { Text } from "@/components/basics";

const AccountFields = styled(Box)({
  width: "100%",
  maxWidth: 520,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "stretch",
  gap: "16px",
  padding: "0",
});

export default function AccountTab() {
  return (
    <>
      <ChangeEmail />
      <Divider sx={{ my: 4 }} />
      <ChangePassword />
    </>
  );
}

function ChangeEmail() {
  const { loadError, trackLoad } = useLoadError();

  const [email, setEmail] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    trackLoad(api.getMyPrivateInfo({ silent: true }))
      .then((result) => {
        setEmail(result.private.email!);
      })
      .catch(() => {
        /* Api already displayed the error. */
      });
  }, [trackLoad]);

  return (
    <>
      <LoadError message={loadError} />
      <Box
        component="form"
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          setErrorText(null);
          const data = new FormData(event.currentTarget);
          const newEmail = data.get("email")?.toString();
          if (email === null || !newEmail) {
            return;
          }
          if (email == newEmail) {
            setErrorText("이건 당신이 이미 쓰고 계시는 이메일입니다.");
            return;
          }
          if (!utilities.validateEmail(newEmail)) {
            setErrorText("유효하지 않은 이메일입니다!");
            return;
          }
          startLoading("잠시만 기다려주세요...");
          api
            .putMyEmail({ oldEmail: email, newEmail: newEmail })
            .then((result) => {
              stopLoading();
              setEmail(result.newEmail);
              notify("이메일이 변경되었습니다.", "success");
            })
            .catch(() => {
              /* Api already displayed the error. */
            });
        }}
      >
        <AccountFields>
          <Box sx={{ width: "100%", justifyContent: "left" }}>
            <Text variant="h6" sx={{ fontWeight: 700 }}>이메일 변경</Text>
          </Box>
          {email !== null && (
            <TextField
              size="small"
              label="이메일"
              type="email"
              autoComplete="email"
              name="email"
              error={Boolean(errorText)}
              helperText={errorText}
              defaultValue={email}
              fullWidth
              required
            />
          )}
          <SubmitButton
            color="primary"
            width="192px"
            height="48px"
          >
            변경
          </SubmitButton>
        </AccountFields>
      </Box>
    </>
  );
}

function ChangePassword() {
  const [errorText, setErrorText] = useState<string | null>(null);

  return (
    <Box
      component="form"
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorText(null);
        const data = new FormData(event.currentTarget);
        const oldPassword = data.get("oldPassword")?.toString();
        const newPassword = data.get("newPassword")?.toString();
        const newPasswordCheck = data.get("newPasswordCheck")?.toString();
        if (!oldPassword || !newPassword || !newPasswordCheck) {
          return;
        }
        if (newPassword != newPasswordCheck) {
          setErrorText("비밀번호와 비밀번호 확인이 다릅니다.");
          return;
        }
        startLoading("잠시만 기다려주세요...");
        api
          .putMyPassword({
            oldPassword: utilities.hashSha3(oldPassword),
            newPassword: utilities.hashSha3(newPassword),
          })
          .then((result) => {
            stopLoading();
            notify("비밀번호가 변경되었습니다.", "success");
            window.location.reload();
          })
          .catch(() => {
            /* Api already displayed the error. */
          });
      }}
    >
      <AccountFields>
        <Box sx={{ width: "100%", justifyContent: "left" }}>
          <Text variant="h6" sx={{ fontWeight: 700 }}>비밀번호 변경</Text>
        </Box>
        <TextField
          size="small"
          label="이전 비밀번호"
          autoComplete="current-password"
          name="oldPassword"
          type="password"
          fullWidth
          required
        />
        <TextField
          size="small"
          label="새 비밀번호"
          autoComplete="new-password"
          name="newPassword"
          type="password"
          error={Boolean(errorText)}
          helperText={errorText}
          fullWidth
          required
        />
        <TextField
          size="small"
          label="새 비밀번호 확인"
          autoComplete="new-password"
          name="newPasswordCheck"
          type="password"
          error={Boolean(errorText)}
          helperText={errorText}
          fullWidth
          required
        />
        <SubmitButton
          color="primary"
          width="192px"
          height="48px"
        >
          변경
        </SubmitButton>
      </AccountFields>
    </Box>
  );
}

export const handle = { permission: Permission.Student };
