import { useFormSubmission } from "@/hooks/use-form-submission";
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

import * as api from "@/api/actions";
import { TitleText } from "@/components/basics";
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

  const { onSubmit: onPostBbsPost, submitting } = useFormSubmission((e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get("title")?.toString();
    const content = data.get("content")?.toString();
    const header = data.get("header")?.toString();
    const isPublic = data.get("isPrivate")?.toString() != "on";
    if (!title || !content || !header) {
      return;
    }
    return api
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
  });

  return (
    <>
      <LoadError message={loadError} />
      <PageSurface maxWidth="md">
        <PageForm onSubmit={onPostBbsPost} sx={{ gap: 3 }}>
          <TitleText color="text.primary" variant="h2">
            피드백 작성
          </TitleText>
          <Grid container spacing={2} sx={{ width: "100%" }}>
            <Grid size={{ xs: 12, sm: 9 }}>
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
            <Grid size={{ xs: 12, sm: 3 }}>
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
            minRows={8}
                maxRows={20}
            required
            slotProps={{
              htmlInput: { maxLength: 500 },
            }}
          />
          <Box
            sx={{
              width: "100%",
              textAlign: "left",
              border: "1px dashed",
              borderRadius: 1,
              borderColor: "divider",
              p: 2,
            }}
          >
            <Button
              component="label"
              color="inherit"
              variant="outlined"
              startIcon={<UploadFile />}
              sx={{ minHeight: 44 }}
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
                    aria-label={file.name + " 첨부 삭제"}
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Button type="button" color="inherit" onClick={() => navigate(href("/bbs/:board/list", { board }))}>목록</Button>
            <Button type="submit" loading={submitting} aria-busy={submitting} variant="contained">작성하기</Button>
          </Box>
        </PageForm>
      </PageSurface>
    </>
  );
}

export const handle = { permission: Permission.Student };
