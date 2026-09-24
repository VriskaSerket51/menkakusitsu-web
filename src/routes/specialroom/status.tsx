import { PageSurface } from "@/components/layout/page-surface";
import { PageForm } from "@/components/layout/page-layout";
import { Permission } from "@/features/auth/token";
import type * as apiTypes from "@/api/types";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  Stepper,
  Typography,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  StepIconProps,
} from "@mui/material";
import { CheckCircle, GroupAdd, HourglassTop } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";

import { openYesNoDialog, startLoading, stopLoading } from "@/components/popup/hooks";
import * as api from "@/api/actions";
import * as constants from "@/utils/constants";
import { TitleText } from "@/components/basics";
import { SubmitButton } from "@/components/basics/styled-button";
import { SpecialroomInfoPanel } from "@/features/specialroom/info-panel";

const steps = ["신청 완료", "승인 대기 중", "승인 완료"];

export default function StatusScreen() {
  const [applyStatus, setApplyStatus] = useState<apiTypes.SpecialroomInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  const [when, setWhen] = useState(1);

  const refresh = useCallback(() => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setIsLoading(true);
    setLoadFailed(false);
    api
      .getSpecialroomApply({ when }, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setApplyStatus(result?.specialroomInfo ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
  }, [when]);

  const onCancelApply = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    openYesNoDialog(constants.DialogTitle.Info, "정말 특별실 신청을 취소하시겠습니까?", () => {
      startLoading("특별실 신청을 취소 중입니다...");
      api
        .deleteSpecialroomApply({ when: when })
        .then((result) => {
          stopLoading();
          refresh();
        })
        .catch(() => {
          /* Api already displayed the error. */
        });
    });
  };

  useEffect(() => {
    refresh();
    return () => activeRequest.current?.abort();
  }, [refresh]);

  let activeStep = -1;

  if (applyStatus) {
    if (applyStatus.state === 0) {
      activeStep = 1;
    } else if (applyStatus.state === 1) {
      activeStep = 2;
    } else if (applyStatus.state === -1) {
      activeStep = 2;
    }
  }

  return (
    <>
      <PageSurface maxWidth="md">
        <PageForm>
          <TitleText color="secondary" variant="h2">
            특별실 신청 현황
          </TitleText>
          <Box
            sx={{
              width: "100%",
              padding: "64px",
            }}
          >
            <Typography variant="h5">몇 차 면학으로 신청하셨나요?</Typography>
            <FormControl
              sx={{
                m: 1,
                minWidth: 120,
              }}
              size="small"
            >
              <InputLabel id="select-when">사용 시간</InputLabel>
              <Select
                labelId="select-when"
                id="select-when"
                value={when}
                label="사용 시간"
                onChange={(event) => {
                  setWhen(Number(event.target.value));
                }}
              >
                <MenuItem value={1}>1차 면학</MenuItem>
                <MenuItem value={2}>2차 면학</MenuItem>
              </Select>
            </FormControl>
            <Box>
              {loadFailed ? (
                <Box role="alert">
                  <Typography color="error">신청 정보를 불러오지 못했습니다.</Typography>
                  <Button onClick={refresh}>다시 시도</Button>
                </Box>
              ) : !isLoading ? (
                applyStatus ? (
                  <Typography
                    noWrap
                    variant="h6"
                    sx={{
                      mr: 2,
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    선생님: {applyStatus.teacher.name}
                    <br />
                    신청자: {applyStatus.master.name}
                    <br />
                    장소: {applyStatus.location}
                    <br />
                    목적: {applyStatus.purpose}
                    {applyStatus.state === -1 && " - 거부됨"}
                    <br />
                    명단: {applyStatus.applicants} - 총{applyStatus.applicants.split(",").length}
                    인
                    <br />
                    활동 시간: {applyStatus.when}차 면학
                  </Typography>
                ) : (
                  <Typography
                    noWrap
                    sx={{
                      mr: 2,
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    신청 안 함
                  </Typography>
                )
              ) : (
                <Box sx={{ textAlign: "center" }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          </Box>
          <Stack sx={{ width: "100%", paddingBottom: "32px" }} spacing={4}>
            <Stepper
              alternativeLabel
              activeStep={isLoading || loadFailed ? -1 : activeStep}
              connector={<ColorlibConnector isapproved={applyStatus ? applyStatus.state : 0} />}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    slots={{
                      stepIcon: ColorlibStepIcon,
                    }}
                    slotProps={{
                      stepIcon: {
                        icon: index + 1,
                        isApproved: applyStatus ? applyStatus.state : 0,
                      } as ColorlibStepIconProps,
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {!isLoading && !loadFailed && applyStatus && (
              <SubmitButton width="192px" backgroundColor="error.main" onClick={onCancelApply}>
                신청 취소
              </SubmitButton>
            )}
          </Stack>
          <SpecialroomInfoPanel />
        </PageForm>
      </PageSurface>
    </>
  );
}

const ColorlibConnector = styled(StepConnector)<{ isapproved: number }>(
  ({ theme, isapproved }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 27,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundColor: `${
          isapproved >= 0 ? theme.palette.success.light : theme.palette.error.light
        }`,
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundColor: `${
          isapproved >= 0 ? theme.palette.success.light : theme.palette.error.light
        }`,
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: 10,
      border: 0,
      backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
      borderRadius: 1,
    },
  }),
);

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
  isApproved: number;
}>(({ theme, ownerState, isApproved }) => {
  return {
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 64,
    height: 64,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    ...(ownerState.active && {
      backgroundColor: `${
        isApproved >= 0 ? theme.palette.success.light : theme.palette.error.light
      }`,
      boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
    }),
    ...(ownerState.completed && {
      backgroundColor: `${
        isApproved >= 0 ? theme.palette.success.light : theme.palette.error.light
      }`,
      boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
    }),
  };
});

type ColorlibStepIconProps = StepIconProps & {
  isApproved?: number;
};

function ColorlibStepIcon(props: ColorlibStepIconProps) {
  const { active, completed, className, isApproved = 0 } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <GroupAdd />,
    2: <HourglassTop />,
    3: <CheckCircle />,
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
      isApproved={isApproved}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

export const handle = { permission: Permission.Student };
