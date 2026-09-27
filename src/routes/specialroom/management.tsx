import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Checkbox, Chip, CircularProgress, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { PageSurface } from "@/components/layout/page-surface";
import { PageContent } from "@/components/layout/page-layout";
import { TitleText } from "@/components/basics";
import { Permission } from "@/features/auth/token";
import { useAuth } from "@/features/auth/use-auth";
import { notify } from "@/components/snackbar/notify";
import * as api from "@/api/actions";
import type { SpecialroomInfo } from "@/api/types";

const statuses = [
  { value: 0, label: "특별실 신청 내역" },
  { value: 1, label: "승인된 신청" },
  { value: -1, label: "거부된 신청" },
] as const;

export default function ManagementScreen() {
  const uid = useAuth(state => state.payload.uid);
  const [information, setInformation] = useState<SpecialroomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState<1 | -1 | null>(null);
  const [status, setStatus] = useState(0);
  const [period, setPeriod] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const request = useRef<AbortController | null>(null);
  const savingRef = useRef(false);
  const refresh = useCallback(() => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true); setFailed(false); setSelectedIds([]);
    void api.getSpecialroomInfo({ signal: controller.signal, silent: true })
      .then(result => { if (!controller.signal.aborted) setInformation(result.information.filter(info => info.teacher.uid === uid)); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  }, [uid]);
  useEffect(() => { refresh(); return () => request.current?.abort(); }, [refresh]);

  const filtered = information.filter(info => (!period || info.when === period)
    && [info.purpose, info.location, info.master.name, info.applicants].some(value => value.includes(search.trim())));
  const visible = filtered.filter(info => info.state === status);
  const selected = visible.filter(info => selectedIds.includes(info.applyId));
  const busy = saving !== null;
  const update = async (state: 1 | -1) => {
    if (!selected.length || savingRef.current) return;
    savingRef.current = true;
    setSaving(state);
    try {
      const result = await api.putSpecialroomInfo({ information: selected.map(info => ({
        ...info, state,
        master: { ...info.master, value: info.master.value ?? info.master.name },
        teacher: { ...info.teacher, value: info.teacher.value ?? info.teacher.name },
      })) });
      setInformation(result.information.filter(info => info.teacher.uid === uid));
      setSelectedIds([]);
      notify(selected.length + "건 " + (state === 1 ? "승인" : "거부") + " 처리했습니다.", "success");
    } catch { /* API client displays the error; retain selection for retry. */ }
    finally { savingRef.current = false; setSaving(null); }
  };

  return <PageSurface maxWidth="lg">
    <PageContent>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <TitleText variant="h2">특별실 신청 관리</TitleText>
        <Button color="inherit" onClick={refresh} disabled={loading || busy}>새로고침</Button>
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: { sm: 160 } }} disabled={busy}>
          <InputLabel id="management-period">사용 시간</InputLabel>
          <Select labelId="management-period" label="사용 시간" value={period} onChange={event => { setPeriod(Number(event.target.value)); setSelectedIds([]); }}>
            <MenuItem value={0}>전체</MenuItem><MenuItem value={1}>1차 면학</MenuItem><MenuItem value={2}>2차 면학</MenuItem>
          </Select>
        </FormControl>
        <TextField size="small" fullWidth label="신청자·장소·목적·명단 검색" value={search} disabled={busy}
          onChange={event => { setSearch(event.target.value); setSelectedIds([]); }} />
      </Stack>
      <Tabs value={status} onChange={(_, value: number) => { setStatus(value); setSelectedIds([]); }}
        variant="fullWidth" aria-label="신청 상태" sx={{ minWidth: 0, borderBottom: 1, borderColor: "divider" }}>
        {statuses.map(item => <Tab key={item.value} value={item.value} disabled={busy}
          id={"management-tab-" + item.value} aria-controls="management-panel" sx={{ minWidth: 0, px: 0.5, minHeight: 80 }}
          label={<Box component="span" sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}>
            <Typography component="span" sx={{ fontSize: 13, fontWeight: 600, wordBreak: "keep-all" }}>{item.label}</Typography>
            {!loading && !failed && <Typography component="span" variant="caption">{filtered.filter(info => info.state === item.value).length}건</Typography>}
          </Box>} />)}
      </Tabs>
      <Box role="tabpanel" id="management-panel" aria-labelledby={"management-tab-" + status} aria-busy={loading || busy} sx={{ minWidth: 0 }}>
        {loading ? <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress aria-label="신청 내역을 불러오는 중입니다" /></Box>
          : failed ? <Alert severity="error" action={<Button color="inherit" onClick={refresh}>다시 시도</Button>}>신청 정보를 불러오지 못했습니다.</Alert>
          : visible.length === 0 ? <Alert severity="info">{search.trim() ? "검색 결과가 없습니다." : "남은 항목이 없습니다!"}</Alert>
          : <Stack spacing={2}>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
              <FormControlLabel sx={{ m: 0 }} label={"전체 선택 · " + selected.length + "건 선택"}
                control={<Checkbox disabled={busy} checked={selected.length === visible.length} indeterminate={selected.length > 0 && selected.length < visible.length}
                  onChange={event => setSelectedIds(event.target.checked ? visible.map(info => info.applyId) : [])} />} />
              <Stack direction="row" spacing={1}>
                {status !== 1 && <Button variant="contained" disabled={!selected.length || busy} loading={saving === 1} onClick={() => void update(1)}>승인</Button>}
                {status !== -1 && <Button variant="outlined" color="error" disabled={!selected.length || busy} loading={saving === -1} onClick={() => void update(-1)}>거부</Button>}
              </Stack>
            </Box>
            {visible.map(info => <Box key={info.applyId} sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: { xs: 1.5, sm: 2 }, minWidth: 0,
              border: 1, borderColor: selectedIds.includes(info.applyId) ? "primary.main" : "divider", borderRadius: 2 }}>
              <Checkbox disabled={busy} checked={selectedIds.includes(info.applyId)} sx={{ flexShrink: 0 }}
                slotProps={{ input: { "aria-label": info.when + "차 면학 " + info.master.name + " 신청 " + info.displayNo + "번 선택" } }}
                onChange={event => setSelectedIds(ids => event.target.checked ? [...ids, info.applyId] : ids.filter(id => id !== info.applyId))} />
              <Box sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere", py: 0.5 }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mb: 1 }}>
                  <Chip size="small" label={info.when + "차 면학"} variant="outlined" />
                  <Typography variant="body2" color="text.secondary">#{info.displayNo} · {info.master.name}</Typography>
                </Stack>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>{info.purpose}</Typography>
                <Box component="dl" sx={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 1, m: 0 }}>
                  <Typography component="dt" variant="body2" color="text.secondary">장소</Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0 }}>{info.location}</Typography>
                  <Typography component="dt" variant="body2" color="text.secondary">명단</Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0 }}>{info.applicants} · 총 {info.applicants.split(",").length}인</Typography>
                </Box>
              </Box>
            </Box>)}
          </Stack>}
      </Box>
    </PageContent>
  </PageSurface>;
}

export const handle = { permission: Permission.Teacher };
