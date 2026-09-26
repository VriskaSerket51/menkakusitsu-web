import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import { PageSurface } from "@/components/layout/page-surface";
import { PageContent } from "@/components/layout/page-layout";
import { LoadError } from "@/components/load-error";
import { TitleText, Text } from "@/components/basics";
import { openYesNoDialog } from "@/components/popup/hooks";
import { notify } from "@/components/snackbar/notify";
import { useLoadError } from "@/hooks/use-load-error";
import { Permission } from "@/features/auth/token";
import type { UserInfo } from "@/api/types";
import * as api from "@/api/actions";

export default function UserManagementScreen() {
  const { loadError, trackLoad } = useLoadError();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const refresh = useCallback(() => {
    setLoading(true);
    void trackLoad(api.getSpecialroomStudentInfo({ silent: true }))
      .then(result => setUsers(result.studentInfo))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [trackLoad]);
  useEffect(refresh, [refresh]);
  const visibleUsers = users.filter(user => (user.value ?? user.name).includes(query.trim()));
  const remove = async (user: UserInfo) => {
    setDeleting(user.uid);
    try {
      await api.deleteAccount({ uid: user.uid });
      setUsers(current => current.filter(item => item.uid !== user.uid));
      notify("계정이 삭제되었습니다.", "success");
    } catch { /* Request errors are shown by the API client. */ }
    finally { setDeleting(null); }
  };
  return <PageSurface maxWidth="md">
    <PageContent>
      <TitleText variant="h2" color="text.primary">유저 관리</TitleText>
      <TextField label="이름" name="name" value={query} onChange={event => setQuery(event.target.value)} fullWidth />
      <LoadError message={loadError} />
      {loadError && <Button color="inherit" onClick={refresh} disabled={loading}>다시 시도</Button>}
      {loading ? <CircularProgress aria-label="유저 목록을 불러오는 중입니다" /> : !loadError && (
        <Stack spacing={1} sx={{ width: "100%" }}>
          {visibleUsers.length === 0 && <Alert severity="info">{query.trim() ? "검색 결과가 없습니다." : "등록된 학생이 없습니다."}</Alert>}
          {visibleUsers.map(user => <Box key={user.uid} sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Text sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{user.value ?? user.name}</Text>
            <Button color="error" startIcon={<DeleteOutlined />} disabled={deleting !== null} loading={deleting === user.uid}
              aria-label={user.name + " 계정 삭제"}
              onClick={() => openYesNoDialog("계정 삭제", user.name + " 계정을 삭제하시겠습니까?", () => { void remove(user); })}>삭제</Button>
          </Box>)}
        </Stack>
      )}
    </PageContent>
  </PageSurface>;
}
export const handle = { permission: Permission.Dev };
