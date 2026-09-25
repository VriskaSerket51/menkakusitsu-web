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
  darken,
  lighten,
  Grid,
} from "@mui/material";
import { Article as ArticleIcon, Campaign, Lock } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import * as api from "@/api/actions";
import * as constants from "@/utils/constants";
import * as utilities from "@/utils/utilities";
import { Text, TitleText } from "@/components/basics";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
        <PageContent sx={{ gap: "16px" }}>
          <TitleText color="secondary" variant="h2">
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
              <Text variant="body1">피드백하기</Text>
            </Button>
          </Box>
          <Pagination
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
                navigate(href(`/bbs/:board/create`, { board: board }));
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
  const { scheme } = useColorScheme();

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
        padding: "4px",
        backgroundColor: isHighlighted
          ? scheme == "light"
            ? darken(theme.palette.background.paper, 0.2)
            : lighten(theme.palette.background.paper, 0.2)
          : undefined,
      }}
      onClick={() => {
        window.scrollTo(0, 0);
      }}
    >
      <Grid container spacing={3}>
        <Grid size={8.5}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              color: isNotice ? "#FF4E59" : "primary.dark",
            }}
          >
            {isNotice ? (
              <Campaign />
            ) : post.isPublic ? (
              <ArticleIcon />
            ) : (
              <Lock />
            )}
            <Text noWrap>
              {post.header} {post.title} [{post.commentCount}]
            </Text>
          </Box>
        </Grid>
        <Grid size={3.5}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              color: "gray",
            }}
          >
            <Text noWrap>{post.owner.name}</Text>
          </Box>
        </Grid>
      </Grid>
    </Link>
  );
}
