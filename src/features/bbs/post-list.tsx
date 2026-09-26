import { NoticeBadge } from "./notice-badge";
import { noticeSurface } from "./notice-styles";
import { useLoadError } from "@/hooks/use-load-error";
import { LoadError } from "@/components/load-error";
import { PageSurface } from "@/components/layout/page-surface";
import { PageContent } from "@/components/layout/page-layout";
import { href } from "react-router";
import type * as apiTypes from "@/api/types";
import {
  Box,
  Button,
  Pagination,
  Stack,
  Typography,
  useTheme,
  alpha,
  Grid,
} from "@mui/material";
import { Article as ArticleIcon, Lock } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import * as api from "@/api/actions";
import * as constants from "@/utils/constants";
import * as utilities from "@/utils/utilities";
import { Text, TitleText } from "@/components/basics";
import Spinner from "@/components/basics/spinner";

export default function PostList({
  board,
  postId,
}: {
  board: string;
  postId?: string;
}) {
  const { loadError, trackLoad } = useLoadError();

  const [isLoading, setIsLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);
  const [postList, setPostList] = useState<apiTypes.BbsPost[]>([]);

  const navigate = useNavigate();

  const page = Number(utilities.getParameter("page", "1"));

  const refresh = useCallback(() => {
    setIsLoading(true);
    trackLoad(
      api.getBbsPostList(
        {
          board: board,
          postPage: page,
          postListSize: constants.POST_LIST_SIZE,
        },
        { silent: true },
      ),
    )
      .then((result) => {
        setIsLoading(false);
        setPostCount(result.postCount);
        setPostList(result.list);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [page, board, trackLoad]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <LoadError message={loadError} />
      <PageSurface maxWidth="md">
        <PageContent sx={{ gap: 3 }}>
          <TitleText color="text.primary" variant="h2">
            피드백
          </TitleText>
          <Stack
            spacing={2}
            sx={{
              width: "100%",
            }}
          >
            {isLoading && <Spinner text="피드백을 불러오는 중입니다..." />}
            {!isLoading &&
              !loadError &&
              ((postList.length > 0 &&
                postList.map((post) => {
                  return (
                    <Article
                      key={post.id}
                      post={post}
                      page={page}
                      isNotice={post.postType === 0}
                      isHighlighted={
                        Boolean(postId) && post.id == Number(postId)
                      }
                    />
                  );
                })) || <Typography>게시글이 없습니다.</Typography>)}
          </Stack>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                navigate(href("/bbs/:board/create", { board: board }));
              }}
            >
              피드백하기
            </Button>
          </Box>
          <Pagination
            sx={{ alignSelf: "center" }}
            siblingCount={0}
            count={Math.ceil(postCount / constants.POST_LIST_SIZE)}
            page={page}
            onChange={(event: React.ChangeEvent<unknown>, value: number) => {
              if (postId) {
                navigate({
                  pathname: href("/bbs/:board/:postId/view", {
                    board: board,
                    postId: postId,
                  }),
                  search: `page=${value}`,
                });
              } else {
                navigate({
                  pathname: href("/bbs/:board/list", { board: board }),
                  search: `page=${value}`,
                });
              }
            }}
            variant="outlined"
            color="primary"
          />
        </PageContent>
      </PageSurface>
    </>
  );
}

type ArticleProps = {
  post: apiTypes.BbsPost;
  isNotice?: boolean;
  isHighlighted?: boolean;
  page: number;
};

function Article(props: ArticleProps) {
  const { post, isNotice, isHighlighted, page } = props;

  const theme = useTheme();

  return (
    <Link
      to={{
        pathname: href(`/bbs/:board/:postId/view`, {
          board: post.board,
          postId: String(post.id),
        }),
        search: `page=${page}`,
      }}

      style={{
        justifyContent: "space-between",
        alignItems: "center",
        textDecoration: "none",
        padding: "12px",
        borderRadius: 8,
        border: `1px solid ${theme.palette.divider}`,
        ...(isNotice ? noticeSurface(theme) : {}),
        ...(isHighlighted ? {
          outline: "2px solid " + theme.palette.primary.main,
          outlineOffset: 2,
          ...(!isNotice ? { backgroundColor: alpha(theme.palette.primary.main, 0.06) } : {}),
        } : {}),
      }}
      onClick={() => {
        window.scrollTo(0, 0);
      }}
    >
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 8 }} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              color: "text.primary",
              gap: 1,
              "& > svg": { flexShrink: 0 },
            }}
          >
            {isNotice ? (
              <NoticeBadge />
            ) : post.isPublic ? (
              <ArticleIcon color="secondary" />
            ) : (
              <Lock color="secondary" />
            )}
            <Text noWrap>
              {!isNotice && post.header} {post.title} [{post.commentCount}]
            </Text>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              color: "text.secondary",
            }}
          >
            <Text noWrap>{post.owner.name}</Text>
          </Box>
        </Grid>
      </Grid>
    </Link>
  );
}
