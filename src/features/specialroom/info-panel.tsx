import type * as apiTypes from "@/api/types";
import { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import * as api from "@/api/actions";
import * as constants from "@/utils/constants";

type FilterFunction = (specialroomInfo: apiTypes.SpecialroomInfo) => boolean;

type InfoTableProps = {
  information: apiTypes.SpecialroomInfo[] | null;
  isLoading: boolean;
  error?: string | null;
  filter?: FilterFunction;
};

export function InfoTable(props: InfoTableProps) {
  const { information, isLoading, filter, error } = props;
  const visibleRows = information?.filter(row => !filter || filter(row));

  return (
    <TableContainer component={Paper}>
      <Table aria-label="특별실 신청 명단">
        <TableHead>
          <TableRow>
            <TableCell>번호</TableCell>
            <TableCell>신청자</TableCell>
            <TableCell>장소</TableCell>
            <TableCell>목적</TableCell>
            <TableCell>명단</TableCell>
            <TableCell>승인</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(isLoading || error || visibleRows?.length === 0) && (
            <TableRow><TableCell colSpan={6} role={error ? "alert" : undefined}>
              {isLoading ? "불러오는 중입니다…" : error ?? "신청 내역이 없습니다."}
            </TableCell></TableRow>
          )}
          {!isLoading &&
            visibleRows &&
            visibleRows.map((row) => {
              if (!filter || filter(row)) {
                return (
                  <TableRow
                    key={row.applyId}
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                    hover={true}
                  >
                    <TableCell component="th" scope="row">
                      {row.displayNo}
                    </TableCell>
                    <TableCell>{row.master.name}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>
                      {row.state === -1
                        ? row.purpose + " - 거부됨"
                        : row.purpose}
                    </TableCell>
                    <TableCell>{row.applicants}</TableCell>
                    <TableCell>{row.state === 1 ? "O" : "X"}</TableCell>
                  </TableRow>
                );
              }
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type SpecialroomInfoPanelProps = {
  filter?: FilterFunction;
};

export function SpecialroomInfoPanel(props: SpecialroomInfoPanelProps) {
  const { filter } = props;

  const [information, setInformation] = useState<apiTypes.SpecialroomInfo[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = async () => {
      try {
        const result = await api.getSpecialroomInfo({ signal: controller.signal, silent: true });
        if (!controller.signal.aborted) { setInformation(result.information); setError(null); }
      } catch {
        if (!controller.signal.aborted) setError("신청 명단을 불러오지 못했습니다. 잠시 후 다시 확인합니다.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          timer = setTimeout(update, constants.SPECIALROOM_INFO_INTERVAL);
        }
      }
    };
    void update();
    return () => { controller.abort(); clearTimeout(timer); };
  }, []);

  return (
    <InfoTable
      information={information}
      isLoading={isLoading}
      error={error}
      filter={filter}
    />
  );
}
