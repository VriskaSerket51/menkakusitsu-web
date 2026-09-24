import { PageSurface } from "@/components/layout/page-surface";
import { PageContent } from "@/components/layout/page-layout";
import { Permission } from "@/features/auth/token";
import { List, ListItem, ListItemText } from "@mui/material";

import * as utilities from "@/utils/utilities";
import { SubmitButton } from "@/components/basics/styled-button";
import { TitleText } from "@/components/basics";

const info = [
  "출석부 학생 배치는 면학실 자리 배치와 같습니다.",
  "출석부 최하단에 일일 특별실 신청 명단이 있습니다.",
  "학생이 특별실을 신청한 경우 학생 이름 아래에 번호가 적힙니다. 학생 이름 아래에 적힌 번호는 특별실 신청 번호이며, 출석부 최하단의 일일 특별실 신청 명단에서 세부 내용을 확인할 수 있습니다.",
  "학생이 특별실을 신청했으나 선생님이 신청을 거부했거나 승인하지 않은 경우, 학생 이름 아래에 '번호(X)'가 적힙니다.",
  "대부분의 경우 1차 면학 출석부를 다운받으시면 됩니다.",
];

export default function InfoScreen() {
  return (
    <>
      <PageSurface maxWidth="md">
        <PageContent sx={{ gap: "16px" }}>
          <TitleText color="secondary" variant="h2">
            안내 사항
          </TitleText>
          <List sx={{ width: "100%" }}>
            {info.map((info, index) => {
              return (
                <ListItem key={info}>
                  <ListItemText primary={`${index + 1}. ${info}`}></ListItemText>
                </ListItem>
              );
            })}
          </List>
          <SubmitButton
            backgroundColor="primary.main"
            width="192px"
            onClick={() => {
              utilities.openInNewTab("./download?when=1");
            }}
            textProps={{ variant: "body2" }}
          >
            1차 면학 출석부 다운로드
          </SubmitButton>

          <SubmitButton
            backgroundColor="primary.main"
            width="192px"
            onClick={() => {
              utilities.openInNewTab("./download?when=2");
            }}
            textProps={{ variant: "body2" }}
          >
            2차 면학 출석부 다운로드
          </SubmitButton>
        </PageContent>
      </PageSurface>
    </>
  );
}

export const handle = { permission: Permission.Student };
