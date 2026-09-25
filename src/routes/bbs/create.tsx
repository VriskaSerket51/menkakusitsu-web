import { useLoadError } from "@/hooks/use-load-error";
import { LoadError } from "@/components/load-error";
import { notify } from "@/components/snackbar/notify";
import { PageSurface } from "@/components/layout/page-surface";
import { PageForm } from "@/components/layout/page-layout";
import type { Route } from "./+types/create";
import { href } from "react-router";
import { Permission } from "@/features/auth/token";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Typography,
  IconButton,
} from "@mui/material";
import { DeleteOutlined, UploadFile } from "@mui/icons-material";
import { useEffect, useState } from "react";

import { startLoading, stopLoading } from "@/components/popup/hooks";
import * as api from "@/api/actions";
import { TitleText } from "@/components/basics";
import { SubmitButton } from "@/components/basics/styled-button";
import { useNavigate, useParams } from "react-router";

export default function CreateScreen() {
  const { loadError, trackLoad } = useLoadError();

  const navigate = useNavigate();
  const { board } = useParams() as Route.ComponentProps["params"];
  const [headers, setHeaders] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    setFiles(Array.from(e.target.files));
  };

  const removeFile = (file: File) => {
    setFiles(files.filter((_file) => _file != file));
  };

  useEffect(() => {
    trackLoad(api.getBbsPostHeaders({ board: board }, { silent: true }))
      .then((result) => {
        setHeaders(result.headers);
      })
      .catch(() => {
        /* Api already displayed the error. */
      });
  }, [board, trackLoad]);

  const onPostBbsPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get("title")?.toString();
    const content = data.get("content")?.toString();
    const header = data.get("header")?.toString();
    const isPublic = data.get("isPrivate")?.toString() != "on";
    if (!title || !content || !header) {
      return;
    }
    startLoading("제출 중입니다...");
    api
      .postBbsPost(
        {
          title: title,
          content: content,
          header: header,
          board: board,
          isPublic: isPublic,
        },
        files,
      )
      .then((response) => {
        stopLoading();
        notify("피드백 제출이 완료되었습니다.", "success");
        navigate(
          href("/bbs/:board/:postId/view", {
            board: board,
            postId: String(response.postId),
          }),
        );
      })
      .catch(() => {
        /* Api already displayed the error. */
      });
  };

  return (
    <>
      <LoadError message={loadError} />
      <PageSurface maxWidth="md">
        <PageForm onSubmit={onPostBbsPost} sx={{ gap: "16px" }}>
          <TitleText color="secondary" variant="h2">
            피드백 작성
          </TitleText>
          <Grid container spacing={2}>
            <Grid size={10}>
              <TextField
                size="small"
                label="제목"
                name="title"
                fullWidth
                required
                slotProps={{
                  htmlInput: { maxLength: 30 },
                }}
              />
            </Grid>
            <Grid size={2}>
              <FormControl size="small" fullWidth>
                <InputLabel id="title-header-label">말머리</InputLabel>
                <Select
                  labelId="title-header-label"
                  id="title-header"
                  label="말머리"
                  name="header"
                  required
                  defaultValue=""
                >
                  <MenuItem
                    disabled
                    value=""
                    sx={{
                      display: "none",
                    }}
                  >
                    <em>-</em>
                  </MenuItem>
                  {headers.map((header) => {
                    return (
                      <MenuItem key={header} value={header}>
                        {header}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <TextField
            label="본문"
            name="content"
            fullWidth
            multiline
            rows={20}
            required
            slotProps={{
              htmlInput: { maxLength: 500 },
            }}
          />
          <Box
            sx={{
              width: "100%",
              textAlign: "center",
              borderStyle: "dotted",
              borderRadius: 1,
              borderColor: "lightgray",
              padding: "1em",
            }}
          >
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFile />}
              sx={{ padding: "1em" }}
            >
              파일 업로드
              <input
                name="data"
                type="file"
                multiple
                hidden
                onChange={onFileUpload}
              />
            </Button>
            {files.map((file) => {
              return (
                <Typography key={file.lastModified}>
                  {file.name}
                  <IconButton
                    onClick={() => {
                      removeFile(file);
                    }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </Typography>
              );
            })}
          </Box>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox />}
              label="비공개 피드백 작성"
              name="isPrivate"
            />
          </FormGroup>
          <SubmitButton backgroundColor="primary.main" width="192px">
            작성하기
          </SubmitButton>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "right",
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                navigate(href("/bbs/:board/list", { board: board }));
              }}
            >
              목록
            </Button>
          </Box>
        </PageForm>
      </PageSurface>
    </>
  );
}

export const handle = { permission: Permission.Student };
