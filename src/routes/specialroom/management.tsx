import { PageSurface } from "@/components/layout/page-surface";
import { PageContent } from "@/components/layout/page-layout";
import { Permission } from "@/features/auth/token";
import type * as apiTypes from "@/api/types";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Tooltip,
} from "@mui/material";
import { useState, useEffect } from "react";

import { startLoading, stopLoading } from "@/components/popup/hooks";
import * as api from "@/api/actions";
import * as utilities from "@/utils/utilities";
import { Text, TitleText } from "@/components/basics";
import { SpecialroomInfoPanel } from "@/features/specialroom/info-panel";
import { useAuth } from "@/features/auth/use-auth";

export default function ManagementScreen() {
  const [information, setInformation] = useState<apiTypes.SpecialroomInfo[]>([]);
  const uid = useAuth((state) => state.payload.uid);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getSpecialroomInfo()
      .then((result) => {
        setInformation(result.information.filter((info) => info.teacher.uid == uid));
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [uid]);

  return (
    <>
      <PageSurface maxWidth="lg">
        <PageContent>
          <TitleText color="secondary" variant="h2">
            특별실 신청 관리
          </TitleText>
          <SpecialroomInfoPanel filter={(info) => info.teacher.uid == uid} />
          <Stack
            spacing={2}
            direction="row"
            useFlexGap
            sx={{
              flexWrap: "wrap",
              mt: "32px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                border: "1px dashed grey",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text variant="h4">특별실 신청 내역</Text>
              <br />
              {isLoading ? (
                <CircularProgress />
              ) : (
                <InfoCell state={0} information={information} setInformation={setInformation} />
              )}
            </Box>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                border: "1px dashed grey",
                flex: 1,
              }}
            >
              <Text variant="h5">승인된 신청</Text>
              <br />
              {isLoading ? (
                <CircularProgress />
              ) : (
                <InfoCell state={1} information={information} setInformation={setInformation} />
              )}
            </Box>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                border: "1px dashed grey",
                flex: 1,
              }}
            >
              <Text variant="h5">거부된 신청</Text>
              <br />
              {isLoading ? (
                <CircularProgress />
              ) : (
                <InfoCell state={-1} information={information} setInformation={setInformation} />
              )}
            </Box>
          </Stack>
        </PageContent>
      </PageSurface>
    </>
  );
}

type InfoCellProps = {
  state: number;
  information: apiTypes.SpecialroomInfo[];
  setInformation: React.Dispatch<React.SetStateAction<apiTypes.SpecialroomInfo[]>>;
};

function InfoCell(props: InfoCellProps) {
  const { state, information, setInformation } = props;

  const uid = useAuth((state) => state.payload.uid);

  let count = 0;
  const final: apiTypes.SpecialroomInfo[] = [];
  const result = (
    <>
      <Stack
        direction="column"
        sx={{
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {information.map((information) => {
          if (information.state === state) {
            count++;
            return (
              <Tooltip
                placement="top-start"
                key={information.applyId}
                title={
                  <Box sx={{ textAlign: "left" }}>
                    <Text>{`신청자: ${information.master.name}`}</Text>
                    <Text>
                      {`신청 명단: ${information.applicants} - 총 ${
                        information.applicants.split(",").length
                      }인`}
                    </Text>
                    <Text>{`신청 장소: ${information.location}`}</Text>
                    <Text>{`신청 시간: ${information.when}차 면학`}</Text>
                  </Box>
                }
                arrow
              >
                <FormControlLabel
                  label={information.purpose}
                  control={
                    <Checkbox
                      color="secondary"
                      onChange={(event) => {
                        if (event.target.checked) {
                          final.push(information);
                        } else {
                          utilities.arrayRemove(final, information);
                        }
                      }}
                    />
                  }
                />
              </Tooltip>
            );
          }
        })}
      </Stack>
      <Box sx={{ textAlign: "center" }}>
        <ButtonGroup variant="contained">
          {state !== 1 && (
            <Button
              color="success"
              onClick={() => {
                startLoading("처리 중입니다...");
                api
                  .putSpecialroomInfo({
                    information: final.map((information) => ({
                      ...information,
                      state: 1,
                      master: {
                        ...information.master,
                        value: information.master.value ?? information.master.name,
                      },
                      teacher: {
                        ...information.teacher,
                        value: information.teacher.value ?? information.teacher.name,
                      },
                    })),
                  })
                  .then((result) => {
                    stopLoading();
                    setInformation(result.information.filter((info) => info.teacher.uid == uid));
                  })
                  .catch(() => {
                    /* Api already displayed the error. */
                  });
              }}
            >
              승인
            </Button>
          )}
          {state !== -1 && (
            <Button
              color="error"
              onClick={() => {
                startLoading("처리 중입니다...");
                api
                  .putSpecialroomInfo({
                    information: final.map((information) => ({
                      ...information,
                      state: -1,
                      master: {
                        ...information.master,
                        value: information.master.value ?? information.master.name,
                      },
                      teacher: {
                        ...information.teacher,
                        value: information.teacher.value ?? information.teacher.name,
                      },
                    })),
                  })
                  .then((result) => {
                    stopLoading();
                    setInformation(result.information.filter((info) => info.teacher.uid == uid));
                  })
                  .catch(() => {
                    /* Api already displayed the error. */
                  });
              }}
            >
              거부
            </Button>
          )}
        </ButtonGroup>
      </Box>
    </>
  );
  if (count === 0) {
    return <Alert severity="info">남은 항목이 없습니다!</Alert>;
  }
  return result;
}

export const handle = { permission: Permission.Teacher };
