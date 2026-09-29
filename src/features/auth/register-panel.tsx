import { getApiError } from "@/api/errors";
import { FormError } from "@/components/form-error";
import { useState } from "react";
import { useFormSubmission } from "@/hooks/use-form-submission";
import { notify } from "@/components/snackbar/notify";
import { Box, TextField } from "@mui/material";

import { TitleText } from "@/components/basics";
import { SubmitButton } from "@/components/basics/styled-button";
import * as api from "@/api/actions";
import * as utilities from "@/utils/utilities";
import { useNavigate } from "react-router";

export default function RegisterPanel() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { onSubmit: onPostRegister, submitting, submitError, onKeyDownCapture } = useFormSubmission(async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    const data = new FormData(event.currentTarget);
    const name = data.get("name")?.toString().trim();
    const sid = Number(data.get("sid")?.toString().trim());
    const email = data.get("email")?.toString().trim();
    const id = data.get("id")?.toString().trim();
    const password = data.get("password")?.toString();
    const passwordCheck = data.get("passwordCheck")?.toString();
    if (Number.isNaN(sid) || !Number.isInteger(sid) || sid <= 0) {
      setErrors({ sid: "학번의 형식이 잘못되었습니다." });
      return;
    }
    if (!name || !sid || !email || !id || !password || !passwordCheck) {
      setErrors({ name: !name ? "이름을 입력해주세요." : "", id: !id ? "아이디를 입력해주세요." : "" });
      return;
    }
    if (password != passwordCheck) {
      setErrors({ passwordCheck: "비밀번호 확인을 잘못 입력하셨습니다." });
      return;
    }
    try {
      const result = await api.postRegister({
        name: name,
        sid: sid,
        email: email,
        id: id,
        password: utilities.hashSha3(password),
      }, { silent: true });
      notify("회원가입 성공!", "success");
      navigate("/");
    } catch (error) {
      const problem = getApiError(error);
      const field = ({ LOGIN_ID_TAKEN: "id", STUDENT_NUMBER_TAKEN: "sid", NAME_TAKEN: "name" } as Record<string, string>)[problem?.code ?? ""];
      if (field && problem) setErrors({ [field]: problem.message });
      else throw error;
    }
  });

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
        회원가입
      </TitleText>
      <Box
        component="form"
        onKeyDownCapture={onKeyDownCapture} aria-busy={submitting} onSubmit={onPostRegister}
        sx={{ mt: 1, width: "100%", maxWidth: 480 }}
      >
        <FormError message={submitError} />
        <TextField
          margin="normal"
          required
          fullWidth
          size="small"
          name="name"
          onChange={() => setErrors(current => ({ ...current, name: "" }))}
          error={Boolean(errors.name)}
          helperText={errors.name}
          label="이름"
          autoComplete="name"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          size="small"
          name="sid"
          onChange={() => setErrors(current => ({ ...current, sid: "" }))}
          label="학번"
          type="number"
          sx={{ appearance: "none" }}
          error={Boolean(errors.sid)}
          helperText={errors.sid || "1학년 1반 1번이면 1101"}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          size="small"
          name="email"
          label="이메일"
          type="email"
          autoComplete="email"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          size="small"
          name="id"
          onChange={() => setErrors(current => ({ ...current, id: "" }))}
          error={Boolean(errors.id)}
          helperText={errors.id}
          label="아이디"
          autoComplete="username"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          size="small"
          name="password"
          onChange={() => setErrors(current => ({ ...current, passwordCheck: "" }))}
          label="비밀번호"
          type="password"
          autoComplete="new-password"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          size="small"
          name="passwordCheck"
          error={Boolean(errors.passwordCheck)}
          helperText={errors.passwordCheck}
          onChange={() => setErrors(current => ({ ...current, passwordCheck: "" }))}
          autoComplete="new-password"
          label="비밀번호 확인"
          type="password"
        />
        <Box sx={{ marginTop: 3 }}>
          <SubmitButton loading={submitting} width="192px" color="primary">
            가입하기
          </SubmitButton>
        </Box>
      </Box>
    </Box>
  );
}
