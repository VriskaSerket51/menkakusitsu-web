import { FormError } from "@/components/form-error";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { notify } from "@/components/snackbar/notify";
import { useLoadError } from "@/hooks/use-load-error";
import { LoadError } from "@/components/load-error";
import { styled } from "@mui/material/styles";
import { Permission } from "@/features/auth/token";
import { Box, Divider, TextField } from "@mui/material";
import { useEffect, useState } from "react";

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
  const { loadError, trackLoad, retry } = useLoadError();

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

  const { onSubmit, submitting, submitError, onKeyDownCapture } = useFormSubmission((event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorText(null);
    const data = new FormData(event.currentTarget);
    const newEmail = data.get("email")?.toString().trim();
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
    return api
      .putMyEmail({ oldEmail: email, newEmail: newEmail }, { silent: true })
      .then((result) => {
        setEmail(result.newEmail);
        notify("이메일이 변경되었습니다.", "success");
      });
  });

  return (
    <>
      <LoadError message={loadError} onRetry={retry} />
      <Box
        component="form"
        onKeyDownCapture={onKeyDownCapture} aria-busy={submitting} onSubmit={onSubmit}
      >
        <FormError message={submitError} />
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
          onChange={() => setErrorText(null)}
              error={Boolean(errorText)}
              helperText={errorText}
              defaultValue={email}
              fullWidth
              required
            />
          )}
          <SubmitButton loading={submitting}
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

  const { onSubmit, submitting, submitError, onKeyDownCapture } = useFormSubmission((event: React.SubmitEvent<HTMLFormElement>) => {
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
    return api
      .putMyPassword({
        oldPassword: utilities.hashSha3(oldPassword),
        newPassword: utilities.hashSha3(newPassword),
      }, { silent: true })
      .then((result) => {
        notify("비밀번호가 변경되었습니다.", "success");
        window.location.reload();
      });
  });

  return (
    <Box
      component="form"
      onKeyDownCapture={onKeyDownCapture} aria-busy={submitting} onSubmit={onSubmit}
    >
        <FormError message={submitError} />
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
          onChange={() => setErrorText(null)}
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
          onChange={() => setErrorText(null)}
          type="password"
          error={Boolean(errorText)}
          helperText={errorText}
          fullWidth
          required
        />
        <SubmitButton loading={submitting}
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
