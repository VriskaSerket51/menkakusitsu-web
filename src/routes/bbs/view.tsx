import { NoticeBadge } from "@/features/bbs/notice-badge";
import { noticeSurface } from "@/features/bbs/notice-styles";
import { useLoadError } from "@/hooks/use-load-error";
import { LoadError } from "@/components/load-error";
import { notify } from "@/components/snackbar/notify";
import { PageSurface } from "@/components/layout/page-surface";

import type { Route } from "./+types/view";
import { href } from "react-router";
import { Permission, hasPermission } from "@/features/auth/token";
import type * as apiTypes from "@/api/types";
import {
  Box,
  Button,
  Divider,
  Pagination,
  TextField,
  Stack,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useCallback, useEffect, useRef, useState } from "react";

import * as api from "@/api/actions";
import * as utilities from "@/utils/utilities";
import * as constants from "@/utils/constants";
import {
  openYesNoDialog,
  startLoading,
  stopLoading,
} from "@/components/popup/hooks";
import PostList from "@/features/bbs/post-list";
import { IconLink, Text } from "@/components/basics";
import { useAuth } from "@/features/auth/use-auth";
import { useNavigate, useParams } from "react-router";
import Spinner from "@/components/basics/spinner";
import { getSpanInfo } from "@/utils/utilities";

export default function ViewScreen() {
  const { loadError, trackLoad } = useLoadError();

  const { board, postId } = useParams() as Route.ComponentProps["params"];

  const navigate = useNavigate();
  const uid = useAuth((state) => state.payload.uid);
  const permission = useAuth((state) => state.payload.permission);

  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<apiTypes.BbsPost | null>(null);
  const [attachments, setAttachments] = useState<
    apiTypes.FileInfo[] | undefined
  >();

  const refresh = useCallback(() => {
    setIsLoading(true);
    trackLoad(
      api.getBbsPost(
        { board: board, postId: Number(postId) },
        { silent: true },
      ),
    )
      .then((result) => {
        setIsLoading(false);
        setPost(result.post);
        setAttachments(result.attachments);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [board, postId, trackLoad]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <LoadError message={loadError} />
      <PageSurface maxWidth="md">
        <Box
          sx={{
            p: { xs: 2, sm: 4 },
            overflowWrap: "anywhere",
          }}
        >
          {isLoading && <Spinner text="피드백을 불러오는 중입니다..." />}
          {!isLoading && post && (
            <>
              <Box sx={theme => ({ mb: 2, ...(post.postType === 0 ? {
                ...noticeSurface(theme), borderWidth: 1, borderStyle: "solid", borderRadius: 2, p: 2,
              } : {}) })}>
                {post.postType === 0 && <NoticeBadge />}
                <Text variant="h5" color="text.primary" sx={{ mt: post.postType === 0 ? 1 : 0 }}>
                  {post.postType !== 0 && post.header} {post.title}
                </Text>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Text>{post.owner.name}</Text>
                <Text color="gray">{getSpanInfo(post.createdDate)}</Text>
              </Box>
              <Divider />
              <Text sx={{ whiteSpace: "pre-wrap" }}>{post.content}</Text>
              {attachments &&
                attachments.map((attachment) => {
                  if (attachment.mimeType.startsWith("image")) {
                    return (
                      <img
                        key={attachment.downloadLink}
                        src={attachment.downloadLink}
                        style={{ width: "100%" }}
                        crossOrigin="anonymous"
                      />
                    );
                  } else {
                    return (
                      <IconLink
                        href={attachment.downloadLink}
                        label={attachment.fileName}
                      />
                    );
                  }
                })}
              <Box sx={{ display: "flex", justifyContent: "right" }}>
                <Stack spacing={2} direction="row">
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={() => {
                      navigate(href("/bbs/:board/list", { board: board }));
                    }}
                  >
                    목록
                  </Button>
                  {(uid === post.owner.uid ||
                    hasPermission({ permission }, Permission.Dev)) && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        navigate(
                          href("/bbs/:board/:postId/edit", {
                            board: board,
                            postId: String(post.id),
                          }),
                        );
                      }}
                    >
                      수정
                    </Button>
                  )}
                  {post &&
                    (uid === post.owner.uid ||
                      hasPermission({ permission }, Permission.Dev)) && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          openYesNoDialog(
                            constants.DialogTitle.Alert,
                            "정말 피드백을 삭제하실 건가요?",
                            () => {
                              api
                                .deleteBbsPost({
                                  board: board,
                                  postId: post.id,
                                })
                                .then((result) => {
                                  notify("피드백이 삭제되었습니다.", "success");
                                  navigate(
                                    href("/bbs/:board/list", { board: board }),
                                  );
                                })
                                .catch(() => {
                                  setIsLoading(false);
                                });
                            },
                          );
                        }}
                      >
                        삭제
                      </Button>
                    )}
                </Stack>
              </Box>
            </>
          )}
          <CommentSection />
        </Box>
      </PageSurface>
      <PostList board={board} postId={postId} />
    </>
  );
}

export const handle = { permission: Permission.Student };

function CommentSection() {
  const { loadError, trackLoad } = useLoadError();

  const { board, postId } = useParams() as Route.ComponentProps["params"];
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const navigate = useNavigate();
  const uid = useAuth((state) => state.payload.uid);
  const permission = useAuth((state) => state.payload.permission);

  const page = Number(utilities.getParameter("page", "1"));
  const commentPage = Number(utilities.getParameter("commentPage", "1"));

  const [isLoading, setIsLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);
  const [commentList, setCommentList] = useState<apiTypes.BbsComment[]>([]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    trackLoad(
      api.getBbsCommentList(
        {
          board: board,
          postId: Number(postId),
          commentPage: commentPage,
          commentListSize: constants.COMMENT_LIST_SIZE,
        },
        { silent: true },
      ),
    )
      .then((result) => {
        setIsLoading(false);
        setCommentCount(result.commentCount);
        setCommentList(result.list);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [commentPage, board, postId, trackLoad]);

  const onPostComment = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const comment = data.get("comment")?.toString();
    if (!comment) {
      return;
    }
    startLoading("작성 중입니다...");
    api
      .postBbsComment({
        board: board,
        postId: Number(postId),
        content: comment,
      })
      .then((result) => {
        stopLoading();
        refresh();
        if (commentRef?.current) {
          commentRef.current.value = "";
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <LoadError message={loadError} />
      <Box
        component="form"
        onSubmit={onPostComment}
        sx={{
          mt: "16px",
        }}
      >
        <Text variant="h6">의견 {isLoading ? 0 : commentCount}개</Text>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            display: "flex",
          }}
        >
          <TextField
            name="comment"
            inputRef={commentRef}
            fullWidth
            multiline
            placeholder="댓글"
            slotProps={{
              htmlInput: { maxLength: 300 },
            }}
          />
          <Button type="submit" color="primary" variant="contained">
            작성
          </Button>
        </Stack>
        <Stack
          spacing={2}
          sx={{
            mt: "16px",
          }}
        >
          {isLoading && <Spinner text="댓글을 불러오는 중입니다..." />}
          {!isLoading &&
            commentList.map((comment) => (
              <Box key={comment.id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                    minHeight: 44,
                  }}
                >
                  <Text noWrap sx={{ flex: 1, minWidth: 0 }}>
                    {comment.owner.name}
                  </Text>
                  <Box
                    sx={{
                      flexShrink: 0,
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      color: "gray",
                    }}
                  >
                    <Text noWrap color="gray">
                      {getSpanInfo(comment.createdDate)}
                    </Text>
                    {(uid === comment.owner.uid ||
                      hasPermission({ permission }, Permission.Dev)) && (
                      <IconButton
                        aria-label="댓글 삭제"
                        size="small"
                        color="error"
                        onClick={() => {
                          openYesNoDialog(
                            constants.DialogTitle.Alert,
                            "정말 의견을 삭제하실 건가요?",
                            () => {
                              api
                                .deleteBbsComment({
                                  board: board,
                                  postId: Number(postId),
                                  commentId: comment.id,
                                })
                                .then((result) => {
                                  notify(
                                    "의견이 삭제되었습니다.",
                                    "success",
                                  );
                                  refresh();
                                })
                                .catch(() => {
                                  setIsLoading(false);
                                });
                            },
                          );
                        }}
                      >
                        <Close fontSize="inherit" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Divider />
                <Text sx={{ whiteSpace: "pre-wrap" }}>{comment.content}</Text>
              </Box>
            ))}
        </Stack>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            count={Math.ceil(commentCount / constants.COMMENT_LIST_SIZE)}
            page={commentPage}
            onChange={(event: React.ChangeEvent<unknown>, value: number) => {
              navigate({
                pathname: href("/bbs/:board/:postId/view", {
                  board: board,
                  postId: postId,
                }),
                search: `page=${page}&commentPage=${value}`,
              });
            }}
            variant="outlined"
            color="primary"
          />
        </Box>
      </Box>
    </>
  );
}
