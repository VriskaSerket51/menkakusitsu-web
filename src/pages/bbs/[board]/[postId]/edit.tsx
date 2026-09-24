import { Permission } from "@/auth";
import type * as apiTypes from "@/api/types";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

import popup from "@/components/popup";
import { api, constants } from "@/utils";
import { TitleText } from "@/components/basics";
import { SubmitButton } from "@/components/basics/styled-button";
import { useNavigate, useParams } from "@/router";

export default function EditScreen() {
  const { board, postId } = useParams("/bbs/:board/:postId/edit");
  const navigate = useNavigate();

  const [post, setPost] = useState<apiTypes.BbsPost | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    popup.startLoading("피드백을 불러오는 중입니다...");
    api.getBbsPost({ board: board, postId: Number(postId) }).then(
      (response) => {
        popup.stopLoading();
        if (api.isSuccess(response)) {
          setPost(response.post);
          api.getBbsPostHeaders({ board: board }).then((result) => {
            setHeaders(result.headers);
          }).catch(() => { /* Api already displayed the error. */ });
        } else {
          popup.openConfirmDialog(
            constants.DialogTitle.Alert,
            response.message,
            () => {
              navigate("/bbs/:board/list", { params: { board: board } });
            }
          );
        }
      }
    ).catch(() => { /* Api already displayed the error. */ });
  }, [board, navigate, postId]);

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
    popup.startLoading("수정 중입니다...");
    api.putBbsPost({
      postId: Number(postId),
      board: board,
      title: title,
      content: content,
      header: header,
      isPublic: isPublic,
    }).then((result) => {
      if (api.isSuccess(result)) {
        popup.stopLoading();
        popup.openConfirmDialog(
          constants.DialogTitle.Info,
          "피드백 수정이 완료되었습니다.",
          () => {
            navigate("/bbs/:board/:postId/view", {
              params: { board: board, postId: postId },
            });
          }
        );
      } else {
        popup.stopLoading();
        popup.openConfirmDialog(constants.DialogTitle.Info, result.message);
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
              피드백 수정
            </TitleText>
            {post && (
              <>
                <Grid
                  container
                  spacing={2}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap"
                  }}>
                  <Grid size={10}>
                    <TextField
                      size="small"
                      label="제목"
                      name="title"
                      fullWidth
                      required
                      defaultValue={post.title}
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
                        defaultValue={post.header}
                      >
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
                  defaultValue={post.content}
                  slotProps={{
                    htmlInput: { maxLength: 500 }
                  }}
                />
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox defaultChecked={!post.isPublic} />}
                    label="비공개 피드백 작성"
                    name="isPrivate"
                  />
                </FormGroup>
              </>
            )}
            {post && (
              <SubmitButton backgroundColor="primary.main" width="192px">
                수정하기
              </SubmitButton>
            )}
            <Box
              sx={{ width: "100%", display: "flex", justifyContent: "right" }}
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

EditScreen.permission = Permission.Student;
