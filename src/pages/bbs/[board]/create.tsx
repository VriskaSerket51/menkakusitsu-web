import { Permission } from "@/auth";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
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

import popup from "@/components/popup";
import { api, constants } from "@/utils";
import { TitleText } from "@/components/basics";
import { SubmitButton } from "@/components/basics/styled-button";
import { useNavigate, useParams } from "@/router";

export default function CreateScreen() {
  const navigate = useNavigate();
  const { board } = useParams("/bbs/:board/create");
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
    api.getBbsPostHeaders({ board: board }).then((result) => {
      setHeaders(result.headers);
    }).catch(() => { /* Api already displayed the error. */ });
  }, [board]);

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
    popup.startLoading("제출 중입니다...");
    api.postBbsPost(
      {
        title: title,
        content: content,
        header: header,
        board: board,
        isPublic: isPublic,
      },
      files
    ).then((response) => {
      if (api.isSuccess(response)) {
        popup.stopLoading();
        popup.openConfirmDialog(
          constants.DialogTitle.Info,
          "피드백 제출이 완료되었습니다.",
          () => {
            navigate("/bbs/:board/:postId/view", {
              params: { board: board, postId: String(response.postId) },
            });
          }
        );
      } else {
        popup.stopLoading();
        popup.openConfirmDialog(constants.DialogTitle.Info, response.message);
      }
    }).catch(() => { /* Api already displayed the error. */ });
  };

  return (
    <>
      <Container
        maxWidth="md"
        sx={{
          margin: "30px auto 50px",
        }}
      >
        <Paper>
          <Box
            component="form"
            onSubmit={onPostBbsPost}
            sx={{
              padding: "50px 30px 30px 30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
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
                    htmlInput: { maxLength: 30 }
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
                htmlInput: { maxLength: 500 }
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
                  navigate("/bbs/:board/list", { params: { board: board } });
                }}
              >
                목록
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

CreateScreen.permission = Permission.Student;
