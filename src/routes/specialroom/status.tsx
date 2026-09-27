import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { GroupAdd } from "@mui/icons-material";
import { PageSurface } from "@/components/layout/page-surface";
import { PageContent } from "@/components/layout/page-layout";
import { TitleText } from "@/components/basics";
import { SpecialroomInfoPanel } from "@/features/specialroom/info-panel";
import { Permission } from "@/features/auth/token";
import { openYesNoDialog, startLoading, stopLoading } from "@/components/popup/hooks";
import * as api from "@/api/actions";
import * as constants from "@/utils/constants";
import type { SpecialroomInfo } from "@/api/types";

export default function StatusScreen() {
  const [listRevision, setListRevision] = useState(0);
  const onCancelled = useCallback(() => setListRevision(value => value + 1), []);
  return <PageSurface maxWidth="md">
    <PageContent>
      <TitleText variant="h2">특별실 신청 현황</TitleText>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2, alignItems: "start" }}>
        <PeriodStatus when={1} onCancelled={onCancelled} />
        <PeriodStatus when={2} onCancelled={onCancelled} />
      </Box>
      <SpecialroomInfoPanel key={listRevision} />
    </PageContent>
  </PageSurface>;
}

function PeriodStatus({ when, onCancelled }: { when: 1 | 2; onCancelled: () => void }) {
  const [application, setApplication] = useState<SpecialroomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const refresh = useCallback(() => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setFailed(false);
    void api.getSpecialroomApply({ when }, { signal: controller.signal, silent: true })
      .then(result => { if (!controller.signal.aborted) setApplication(result?.specialroomInfo ?? null); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  }, [when]);
  useEffect(() => {
    refresh();
    return () => activeRequest.current?.abort();
  }, [refresh]);

  const cancel = () => openYesNoDialog(constants.DialogTitle.Info,
    when + "차 면학 특별실 신청을 취소하시겠습니까?", () => {
      setCancelling(true);
      startLoading("특별실 신청을 취소 중입니다...");
      void api.deleteSpecialroomApply({ when })
        .then(() => { refresh(); onCancelled(); })
        .catch(() => { /* API client displays the error. */ })
        .finally(() => { setCancelling(false); stopLoading(); });
    });

  return <Stack component="section" aria-labelledby={"period-title-" + when} spacing={2}
    sx={{ minWidth: 0, p: { xs: 2, sm: 3 }, border: 1, borderColor: "divider", borderRadius: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
      <Typography component="h3" variant="h6" id={"period-title-" + when} sx={{ fontWeight: 700 }}>{when}차 면학</Typography>
      {!loading && !failed && application && <Chip size="small" variant="outlined"
        color={application.state === 1 ? "success" : application.state === -1 ? "error" : "default"}
        label={application.state === 1 ? "승인 완료" : application.state === -1 ? "거부됨" : "승인 대기 중"} />}
    </Box>
    {loading ? <Box sx={{ py: 2, textAlign: "center" }}><CircularProgress size={28} aria-label={when + "차 면학 신청 정보를 불러오는 중입니다"} /></Box>
      : failed ? <Alert severity="error" action={<Button color="inherit" onClick={refresh}>다시 시도</Button>}>신청 정보를 불러오지 못했습니다.</Alert>
      : application ? <>
        <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", columnGap: 2, rowGap: 1.5 }}>
          {[
            ["선생님", application.teacher.name],
            ["신청자", application.master.name],
            ["장소", application.location],
            ["목적", application.purpose],
            ["명단", application.applicants + " - 총" + application.applicants.split(",").length + "인"],
          ].map(([label, value]) => <Box key={label} sx={{ display: "contents" }}>
            <Typography component="dt" variant="body2" color="text.secondary">{label}</Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: "anywhere" }}>{value}</Typography>
          </Box>)}
        </Box>
        <Button variant="outlined" color="error" onClick={cancel} disabled={cancelling} loading={cancelling}
          aria-label={when + "차 면학 신청 취소"} sx={{ alignSelf: "flex-end" }}>신청 취소</Button>
      </> : <>
        <Typography role="status" color="text.secondary">신청 안 함</Typography>
        <Button component={Link} to={"/specialroom/apply?when=" + when} variant="contained" startIcon={<GroupAdd />}
          aria-label={when + "차 면학 특별실 신청하기"}>특별실 신청하기</Button>
      </>}
  </Stack>;
}

export const handle = { permission: Permission.Student };
