import { getApiError } from "@/api/errors";
import { closeSnackbar } from "notistack";
import { useLoadError } from "@/hooks/use-load-error";
import { LoadError } from "@/components/load-error";
import { notify } from "@/components/snackbar/notify";
import { PageSurface } from "@/components/layout/page-surface";
import { PageForm } from "@/components/layout/page-layout";
import { getServiceDate } from "@/utils/service-date";
import { Permission } from "@/features/auth/token";
import type * as apiTypes from "@/api/types";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";

import { startLoading, stopLoading } from "@/components/popup/hooks";
import * as api from "@/api/actions";
import { Text, TitleText } from "@/components/basics";
import { SpecialroomInfoPanel } from "@/features/specialroom/info-panel";

export default function ApplyScreen() {
  const { loadError, trackLoad } = useLoadError();

  const [managerInfo, setManagerInfo] = useState<apiTypes.UserInfo | null>(
    null,
  );
  const [managerLoading, setManagerLoading] = useState(true);
  const [managerError, setManagerError] = useState<string | null>(null);
  const [locationInfos, setLocationInfos] = useState<apiTypes.LocationInfo[]>(
    [],
  );
  const [purposeInfos, setPurposeInfos] = useState<apiTypes.PurposeInfo[]>([]);
  const [studentInfos, setStudentInfos] = useState<apiTypes.UserInfo[]>([]);
  const [teacherInfos, setTeacherInfos] = useState<apiTypes.UserInfo[]>([]);

  const [searchParams] = useSearchParams();
  const [when, setWhen] = useState(() => searchParams.get("when") === "2" ? 2 : 1);
  const [applicants, setApplicants] = useState<apiTypes.UserInfo[]>([]);
  const [teacher, setTeacher] = useState<apiTypes.UserInfo | null>(null);

  const [locationId, setLocationId] = useState("");
  const [purposeId, setPurposeId] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const selectedLocation = locationInfos.find(item => String(item.id) === locationId);
  const selectedPurpose = purposeInfos.find(item => String(item.id) === purposeId);
  const location = selectedLocation ? (selectedLocation.id < 0 ? customLocation.trim() : selectedLocation.value) : "";
  const purpose = selectedPurpose ? (selectedPurpose.id < 0 ? customPurpose.trim() : selectedPurpose.value) : "";

  const [activeStep, setActiveStep] = useState(0);

  const navigate = useNavigate();

  const steps = [
    {
      title: "사용 시간 선택",
      content: (
        <>
          {managerLoading ? <Text>생활 지도 선생님 정보를 불러오는 중입니다…</Text> : managerInfo ? (
            <Text>{dayjs().format("LL")}일의 생활 지도 선생님은 &lt;{managerInfo.value || managerInfo.name}&gt;이십니다.</Text>
          ) : <Alert severity="info">{managerError} 신청은 계속 진행할 수 있으며, 마지막 단계에서 선생님을 직접 선택해 주세요.</Alert>}
          <FormControl sx={{ width: "100%", maxWidth: 240 }} size="small">
            <InputLabel id="select-when">사용 시간</InputLabel>
            <Select
              labelId="select-when"
              id="select-when"
              value={when}
              onChange={(event) => {
                setWhen(parseInt(event.target.value.toString()));
              }}
              label="사용 시간"
              name="when"
            >
              <MenuItem value={1}>1차 면학</MenuItem>
              <MenuItem value={2}>2차 면학</MenuItem>
            </Select>
          </FormControl>
        </>
      ),
    },
    {
      title: "사용 장소 선택",
      content: (
        <>
          <Text>
            신청 목적은 상관없지만 신청 장소는 바르게 선택해 주시기 바랍니다.
          </Text>
          <FormControl fullWidth>
            <FormLabel id="specialroom-location">사용 장소</FormLabel>
            <RadioGroup
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1, mt: 1, "& .MuiFormControlLabel-root": { m: 0, minHeight: 44, minWidth: 0 }, "& .MuiFormControlLabel-label": { minWidth: 0 }, "& .MuiTextField-root": { width: "100%" } }}
              aria-labelledby="specialroom-location"
              name="location"
              value={locationId}
              onChange={event => setLocationId(event.target.value)}
            >
              {locationInfos.map((location) => {
                if (location.id >= 0) {
                  return (
                    <FormControlLabel
                      key={location.id}
                      id={`location${location.id}`}
                      name="location"
                      value={String(location.id)}
                      control={<Radio />}
                      label={location.value}
                    />
                  );
                } else {
                  return (
                    <FormControlLabel
                      key={location.id}
                      value={String(location.id)}
                      control={<Radio />}
                      label={
                        <TextField
                          size="small"
                          id={`location${location.id}`}
                          value={customLocation}
                          onFocus={() => setLocationId(String(location.id))}
                          onChange={event => setCustomLocation(event.target.value)}
                          label={location.value}
                        />
                      }
                    />
                  );
                }
              })}
            </RadioGroup>
          </FormControl>
        </>
      ),
    },
    {
      title: "사용 목적 선택",
      content: (
        <>
          <FormControl fullWidth>
            <FormLabel id="specialroom-purpose">사용 목적</FormLabel>
            <RadioGroup
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1, mt: 1, "& .MuiFormControlLabel-root": { m: 0, minHeight: 44, minWidth: 0 }, "& .MuiFormControlLabel-label": { minWidth: 0 }, "& .MuiTextField-root": { width: "100%" } }}
              aria-labelledby="specialroom-purpose"
              name="purpose"
              value={purposeId}
              onChange={event => setPurposeId(event.target.value)}
            >
              {purposeInfos.map((purpose) => {
                if (purpose.id >= 0) {
                  return (
                    <FormControlLabel
                      key={purpose.id}
                      id={`purpose${purpose.id}`}
                      name="purpose"
                      value={String(purpose.id)}
                      control={<Radio />}
                      label={purpose.value}
                    />
                  );
                } else {
                  return (
                    <FormControlLabel
                      key={purpose.id}
                      value={String(purpose.id)}
                      control={<Radio />}
                      label={
                        <TextField
                          size="small"
                          id={`purpose${purpose.id}`}
                          value={customPurpose}
                          onFocus={() => setPurposeId(String(purpose.id))}
                          onChange={event => setCustomPurpose(event.target.value)}
                          label={purpose.value}
                        />
                      }
                    />
                  );
                }
              })}
            </RadioGroup>
          </FormControl>
        </>
      ),
    },
    {
      title: "학생 선택",
      content: (
        <>
          <Text>학번 혹은 이름 입력 시 자동완성이 활성화됩니다.</Text>
          {conflictError && <Alert severity="error">{conflictError}</Alert>}
          <Autocomplete
            multiple
            value={applicants}
            isOptionEqualToValue={(option, value) => option.uid === value.uid}
            id="autocomplete-students"
            onChange={(event, newValue) => {
              setApplicants(newValue);
              setConflictError(null);
            }}
            options={studentInfos}
            getOptionLabel={(option) => option.value ?? option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                label="특별실 사용 학생 명단"
                placeholder={applicants.length === 0 ? "예시) 2202 고승한" : undefined}
              />
            )}
          />
        </>
      ),
    },
    {
      title: "선생님 선택",
      content: (
        <>
          <Text>선생님 성함 입력 시 자동완성이 활성화됩니다.</Text>
          <Autocomplete
            id="autocomplete-teachers"
            value={teacher}
            isOptionEqualToValue={(option, value) => option.uid === value.uid}
            onChange={(event, newValue) => {
              setTeacher(newValue);
            }}
            options={teacherInfos}
            getOptionLabel={(option) => option.value ?? option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                label="선생님 선택"
                placeholder="예시) 강지현(지구과학) 선생님"
              />
            )}
          />
        </>
      ),
    },
  ];

  const onClickNext = () => {
    if (activeStep === 1 && !location) { notify("사용 장소 선택을 하지 않으셨습니다.", "warning"); return; }
    if (activeStep === 2 && !purpose) { notify("사용 목적 선택을 하지 않으셨습니다.", "warning"); return; }
    if (activeStep === 3 && applicants.length === 0) { notify("학생 명단 선택을 하지 않으셨습니다.", "warning"); return; }
    setActiveStep(step => Math.min(step + 1, steps.length - 1));
  };

  const onClickBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onClickReset = () => {
    setActiveStep(0);
  };

  useEffect(() => {
    // A missing daily manager must not block the other independent choices.
    void Promise.allSettled([
      api.getSpecialroomManagerInfo({ when: getServiceDate() }, { silent: true })
        .then(result => setManagerInfo(result.manager))
        .catch((error: unknown) => setManagerError(getApiError(error)?.message ?? "생활 지도 선생님 정보를 불러오지 못했습니다."))
        .finally(() => setManagerLoading(false)),
      trackLoad(api.getSpecialroomLocationInfo({ silent: true })).then(
        (result) => setLocationInfos(result.locationInfo),
      ),
      trackLoad(api.getSpecialroomPurposeInfo({ silent: true })).then(
        (result) => setPurposeInfos(result.purposeInfo),
      ),
      trackLoad(api.getSpecialroomStudentInfo({ silent: true })).then(
        (result) => setStudentInfos(result.studentInfo),
      ),
      trackLoad(api.getSpecialroomTeacherInfo({ silent: true })).then(
        (result) => setTeacherInfos(result.teacherInfo),
      ),
    ]);
  }, [trackLoad]);

  const onPostApply = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (!location) {
      notify("사용 장소 선택을 하지 않으셨습니다.", "warning");
      setActiveStep(1);
      return;
    }
    if (!purpose) {
      notify("사용 목적 선택을 하지 않으셨습니다.", "warning");
      setActiveStep(2);
      return;
    }
    if (applicants.length === 0) {
      notify("학생 명단 선택을 하지 않으셨습니다.", "warning");
      setActiveStep(3);
      return;
    }
    if (!teacher) {
      notify("선생님 선택을 하지 않으셨습니다.", "warning");
      setActiveStep(4);
      return;
    }
    setSubmitting(true);
    startLoading("특별실을 신청하는 중입니다...");
    api
      .postSpecialroomApply({
        location: location,
        purpose: purpose,
        applicants: applicants.map((user) => ({
          ...user,
          value: user.value ?? user.name,
        })),
        teacherUid: teacher.uid,
        when: when,
      })
      .then((result) => {
        stopLoading();
        notify(
          "특별실 신청에 성공했습니다. 신청 현황 페이지를 보시겠습니까?",
          "success",
          {
            action: (key) => (
              <Button
                color="inherit"
                onClick={() => {
                  closeSnackbar(key);
                  navigate(`/specialroom/status?when=${when}`);
                }}
              >
                보기
              </Button>
            ),
          },
        );

      })
      .catch((error: unknown) => {
        const problem = getApiError(error);
        if (problem?.code === "SPECIALROOM_CONFLICT") {
          setConflictError(problem.message);
          setActiveStep(3);
        }
      }).finally(() => { setSubmitting(false); stopLoading(); });
  };

  return (
    <>
      <LoadError message={loadError} />
      <PageSurface maxWidth="md">
        <PageForm onSubmit={onPostApply}>
          <TitleText color="text.primary" variant="h2">
            특별실 신청하기
          </TitleText>
          <Box sx={{ width: "100%", maxWidth: 560, minWidth: 0 }}>
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ "& .MuiStepLabel-label": { fontWeight: 600 }, "& .MuiStepContent-root": { pr: 0 } }}>
              {steps.map((step, index) => {
                return (
                  <Step key={step.title}>
                    <StepLabel
                      optional={
                        index === steps.length - 1 ? (
                          <Text variant="caption">Last step</Text>
                        ) : null
                      }
                    >
                      {step.title}
                    </StepLabel>
                    <StepContent
                      slotProps={{
                        transition: {
                          unmountOnExit: false,
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1, pb: 2, "& > .MuiTypography-root": { color: "text.secondary", fontSize: "0.875rem" } }}>{step.content}</Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-start", gap: 1, mb: 2 }}>
                        <Button type="button" color="inherit" onClick={onClickReset}>처음으로</Button>
                        <Button type="button" color="inherit" disabled={index === 0} onClick={onClickBack}>뒤로가기</Button>
                        {index !== steps.length - 1 ? (
                          <Button type="button" variant="contained" onClick={onClickNext}>다음</Button>
                        ) : (
                          <Button type="submit" variant="contained" loading={submitting} disabled={!teacher}>신청하기</Button>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
          <SpecialroomInfoPanel />
        </PageForm>
      </PageSurface>
    </>
  );
}

export const handle = { permission: Permission.Student };
