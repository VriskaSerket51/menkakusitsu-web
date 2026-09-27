import { notify } from "@/components/snackbar/notify";
import { useLoadError } from "@/hooks/use-load-error";
import { LoadError } from "@/components/load-error";
import { getServiceDate } from "@/utils/service-date";
import type * as apiTypes from "@/api/types";
import {
  Box,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  TableBody,
  Input,
  SxProps,
  Theme,
} from "@mui/material";

import { useEffect, useState } from "react";

import * as api from "@/api/actions";
import { SubmitButton } from "@/components/basics/styled-button";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

type TimetableProps = {
  edit?: boolean;
};

export function TimetablePanel(props: TimetableProps) {
  const { loadError, trackLoad } = useLoadError();

  const [timetable, setTimetable] = useState<apiTypes.Timetable | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tableCellSx: SxProps<Theme> = { fontSize: "16px" };

  useEffect(() => {
    trackLoad(
      api.getTimetable(
        {
          when: getServiceDate(),
        },
        { silent: true },
      ),
    )
      .then((result) => {
        setTimetable(result.timetable);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [trackLoad]);

  const onPutTimetable = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const timetableCells: apiTypes.TimetableCell[] = [];
    for (const key of data.keys()) {
      const value = data.get(key);
      if (!key || !value) {
        continue;
      }
      timetableCells.push({ key: key, value: value.toString() });
    }
    api
      .putTimetable({
        timetableInfo: timetableCells,
        when: getServiceDate(),
      })
      .then((result) => {
        notify("시간표가 저장되었습니다.", "success");
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <LoadError message={loadError} />
      <Box component="form" onSubmit={onPutTimetable}>
        <TableContainer component={Paper} tabIndex={0} role="region" aria-label="시간표">
          <Table aria-label="시간표" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={tableCellSx}></TableCell>
                <TableCell align="center" sx={tableCellSx}>
                  1학년 1반
                </TableCell>
                <TableCell align="center" sx={tableCellSx}>
                  1학년 2반
                </TableCell>
                <TableCell align="center" sx={tableCellSx}>
                  2학년 1반
                </TableCell>
                <TableCell align="center" sx={tableCellSx}>
                  2학년 2반
                </TableCell>
                <TableCell align="center" sx={tableCellSx}>
                  3학년 1반
                </TableCell>
                <TableCell align="center" sx={tableCellSx}>
                  3학년 2반
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isLoading &&
                timetable &&
                timetable.timetableInfo.map((timetableCells, i) => {
                  if (i) {
                    return (
                      <StyledTableRow key={i}>
                        {timetableCells.map((timetableCell, j) => {
                          return (
                            <TableCell
                              key={
                                timetableCell.key
                                  ? timetableCell.key
                                  : `nokey_${i}_${j}`
                              }
                              sx={tableCellSx}
                              align="center"
                            >
                              {props.edit ? (
                                <Input
                                  defaultValue={timetableCell.value}
                                  name={timetableCell.key}
                                  size="small"
                                />
                              ) : (
                                timetableCell.value
                              )}
                            </TableCell>
                          );
                        })}
                      </StyledTableRow>
                    );
                  }
                  return <></>;
                })}
            </TableBody>
          </Table>
        </TableContainer>
        {props.edit && (
          <Box sx={{ textAlign: "center", marginTop: "16px" }}>
            <SubmitButton color="primary" width="25%">
              수정하기
            </SubmitButton>
          </Box>
        )}
      </Box>
    </>
  );
}

export default TimetablePanel;
