import { PageSurface } from "@/components/layout/page-surface";
import { PageContent } from "@/components/layout/page-layout";
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
  StepLabel,
} from "@mui/material";
import { Link, useSearchParams } from "react-router";
import { EventNote, GroupAdd } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  openYesNoDialog,
  startLoading,
  stopLoading,
} from "@/components/popup/hooks";
import * as api from "@/api/actions";
import * as constants from "@/utils/constants";
import { TitleText } from "@/components/basics";
import { SpecialroomInfoPanel } from "@/features/specialroom/info-panel";

const steps = ["신청 완료", "승인 대기 중", "승인 완료"];

export default function StatusScreen() {
  const [applyStatus, setApplyStatus] =
    useState<apiTypes.SpecialroomInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const when = searchParams.get("when") === "2" ? 2 : 1;

  const refresh = useCallback(() => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setIsLoading(true);
    setLoadFailed(false);
    api
      .getSpecialroomApply(
        { when },
        { signal: controller.signal, silent: true },
      )
      .then((result) => {
        if (!controller.signal.aborted)
          setApplyStatus(result?.specialroomInfo ?? null);
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
    openYesNoDialog(
      constants.DialogTitle.Info,
      "정말 특별실 신청을 취소하시겠습니까?",
      () => {
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
      },
    );
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
        <PageContent>
          <TitleText color="text.primary" variant="h2">
            특별실 신청 현황
          </TitleText>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>몇 차 면학으로 신청하셨나요?</Typography>
            <FormControl
              sx={{
                width: "100%",
                maxWidth: 240,
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
                  setSearchParams(previous => {
                    previous.set("when", String(event.target.value));
                    return previous;
                  }, { replace: true });
                }}
              >
                <MenuItem value={1}>1차 면학</MenuItem>
                <MenuItem value={2}>2차 면학</MenuItem>
              </Select>
            </FormControl>
            <Box>
              {loadFailed ? (
                <Box role="alert">
                  <Typography color="error">
                    신청 정보를 불러오지 못했습니다.
                  </Typography>
                  <Button color="inherit" onClick={refresh}>다시 시도</Button>
                </Box>
              ) : !isLoading ? (
                applyStatus ? (
                  <Box component="dl" sx={{ m: 0, p: 2, border: 1, borderColor: "divider", borderRadius: 1, display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", columnGap: 3, rowGap: 2 }}>
                    {[
                      ["선생님", applyStatus.teacher.name],
                      ["신청자", applyStatus.master.name],
                      ["장소", applyStatus.location],
                      ["목적", applyStatus.purpose + (applyStatus.state === -1 ? " - 거부됨" : "")],
                      ["명단", applyStatus.applicants + " - 총" + applyStatus.applicants.split(",").length + "인"],
                      ["활동 시간", applyStatus.when + "차 면학"],
                    ].map(([label, value]) => <Box key={label} sx={{ display: "contents" }}>
                      <Typography component="dt" variant="body2" color="text.secondary">{label}</Typography>
                      <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: "anywhere" }}>{value}</Typography>
                    </Box>)}
                  </Box>
                ) : (
                  <Stack
                    role="status"
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "48px minmax(0, 1fr)", sm: "48px minmax(0, 1fr) auto" },
                      alignItems: "center",
                      textAlign: "left",
                      gap: 2,
                      "& > *": { margin: "0 !important" },
                      "& > .MuiButton-root": { gridColumn: { xs: "1 / -1", sm: "auto" } },
                      py: 2,
                      px: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: "50%", bgcolor: theme => alpha(theme.palette.secondary.main, 0.1), color: "secondary.main" }}>
                      <EventNote sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{when}차 면학</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>신청 안 함</Typography>
                    </Box>
                    <Button component={Link} to={`/specialroom/apply?when=${when}`} variant="contained" disableElevation startIcon={<GroupAdd />}>
                      특별실 신청하기
                    </Button>
                  </Stack>
                )
              ) : (
                <Box sx={{ textAlign: "center" }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          </Box>
          {!isLoading && !loadFailed && applyStatus && (
            <Stack spacing={3}>
              <Stepper alternativeLabel activeStep={activeStep}>
                {steps.map((label, index) => (
                  <Step key={label} completed={applyStatus.state === 1 || index < activeStep}>
                    <StepLabel error={applyStatus.state === -1 && index === 2}>
                      {applyStatus.state === -1 && index === 2 ? "거부됨" : label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="button" variant="outlined" color="error" onClick={onCancelApply}>신청 취소</Button>
              </Box>
            </Stack>
          )}
          <SpecialroomInfoPanel />
        </PageContent>
      </PageSurface>
    </>
  );
}

export const handle = { permission: Permission.Student };
