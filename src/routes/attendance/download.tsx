import { Permission } from "@/features/auth/token";
import type * as apiTypes from "@/api/types";
import {
  Box,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import * as api from "@/api/actions";
import * as utilities from "@/utils/utilities";
import { setParticleActive } from "@/components/particle/hooks";
import { InfoTable } from "@/features/specialroom/info-panel";
import { setFooterActive, setHeaderActive } from "@/hooks/use-navbar";

export default function DownloadScreen() {
  const [attendanceInfo, setAttendanceInfo] =
    useState<apiTypes.AttendanceList | null>(null);
  const [information, setInformation] = useState<apiTypes.SpecialroomInfo[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const when = parseInt(utilities.getParameter("when", "1"));

  useEffect(() => {
    api.getAttendanceList({ when: when }).then((result) => {
      setAttendanceInfo(result.list);
      api.getSpecialroomInfo().then((result) => {
        setInformation(result.information);
        setIsLoading(false);
      }).catch(() => { setIsLoading(false); });
    }).catch(() => { setIsLoading(false); });

    setHeaderActive(false);
    setFooterActive(false);
    setParticleActive(false);
    return () => {
      setHeaderActive(true);
      setFooterActive(true);
      setParticleActive(true);
    };
  }, [when]);

  useEffect(() => {
    if (!isLoading) {
      window.print();
    }
  }, [isLoading]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            paddingTop: "30px",
            fontSize: "32px",
            fontWeight: 200,
          }}
        >
          {`${dayjs().format("LL")} ${when}차 면학 출석부`}
        </Typography>
        <Box sx={{ paddingBottom: "192px" }}>
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 50,
            }}
          >
            1~2학년 면학실(3학년은 2페이지에)
          </Typography>
          {attendanceInfo && parseAttendanceList(attendanceInfo.big)}
        </Box>
        <br />
        <Box sx={{ paddingBottom: "64px" }}>
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 50,
            }}
          >
            3학년 면학실
          </Typography>
          {attendanceInfo && parseAttendanceList(attendanceInfo.small)}
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 50,
            }}
          >
            특별실 신청 현황
          </Typography>
          <InfoTable
            information={information}
            isLoading={isLoading}
            filter={(specialroomInfo) => specialroomInfo.when === when}
          />
        </Box>
      </Box>
    </>
  );
}

export const handle = { permission: Permission.Student };

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const parseAttendanceList = (list: apiTypes.AttendanceList["big"]) => {
  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableBody>
            {list.map((row, i) => {
              return (
                <StyledTableRow key={i}>
                  {row.map((col, j) => {
                    if (col === "|") {
                      return <TableCell key={`${i}_${j}`}></TableCell>;
                    } else {
                      return (
                        <TableCell key={`${i}_${j}`} align="center">
                          {col}
                        </TableCell>
                      );
                    }
                  })}
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
