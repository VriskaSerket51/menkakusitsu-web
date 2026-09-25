import { useLoadError } from "@/hooks/use-load-error";
import { LoadError } from "@/components/load-error";
import { notify } from "@/components/snackbar/notify";
import { PageSurface } from "@/components/layout/page-surface";
import { PageForm } from "@/components/layout/page-layout";
import type { Route } from "./+types/edit";
import { href } from "react-router";
import { Permission } from "@/features/auth/token";
import type * as apiTypes from "@/api/types";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

import { startLoading, stopLoading } from "@/components/popup/hooks";
import * as api from "@/api/actions";
import { TitleText } from "@/components/basics";
import { SubmitButton } from "@/components/basics/styled-button";
import { useNavigate, useParams } from "react-router";

export default function EditScreen() {
  const { loadError, trackLoad } = useLoadError();

  const { board, postId } = useParams() as Route.ComponentProps["params"];
  const navigate = useNavigate();

  const [post, setPost] = useState<apiTypes.BbsPost | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    trackLoad(
      api.getBbsPost(
        { board: board, postId: Number(postId) },
        { silent: true },
      ),
    )
      .then((response) => {
        stopLoading();
        setPost(response.post);
        trackLoad(api.getBbsPostHeaders({ board: board }, { silent: true }))
          .then((result) => {
            setHeaders(result.headers);
          })
          .catch(() => {
            /* Api already displayed the error. */
          });
      })
      .catch(() => {
        /* Api already displayed the error. */
      });
  }, [board, navigate, postId, trackLoad]);

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
    startLoading("수정 중입니다...");
    api
      .putBbsPost({
        postId: Number(postId),
        board: board,
        title: title,
        content: content,
        header: header,
        isPublic: isPublic,
      })
      .then((result) => {
        stopLoading();
        notify("피드백 수정이 완료되었습니다.", "success");
        navigate(
          href("/bbs/:board/:postId/view", { board: board, postId: postId }),
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
                  flexWrap: "wrap",
                }}
              >
                <Grid size={10}>
                  <TextField
                    size="small"
                    label="제목"
                    name="title"
                    fullWidth
                    required
                    defaultValue={post.title}
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
                  htmlInput: { maxLength: 500 },
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
          <Box sx={{ width: "100%", display: "flex", justifyContent: "right" }}>
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
