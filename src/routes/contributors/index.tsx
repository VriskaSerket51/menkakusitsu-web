import { Link } from "react-router";
import { PageSurface } from "@/components/layout/page-surface";
import { PageContent } from "@/components/layout/page-layout";
import { Permission } from "@/features/auth/token";
import { Box, Button, Stack } from "@mui/material";
import { ArrowBack, GitHub } from "@mui/icons-material";
import { useEffect } from "react";

import { contributors } from "@/features/contributors/members";
import { IconLink, Text, TitleText } from "@/components/basics";
import { setHeaderActive } from "@/hooks/use-navbar";
import { useAuth } from "@/features/auth/use-auth";
import Logo from "@/components/basics/logo";

export default function ContributorsScreen() {
  const permission = useAuth((state) => state.payload.permission);

  useEffect(() => {
    if (permission <= Permission.Guest) {
      setHeaderActive(false);
      return () => {
        setHeaderActive(true);
      };
    }
  }, [permission]);

  return (
    <>
      {permission == Permission.Guest && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: "50px",
          }}
        >
          <Logo variant="h2" />
        </Box>
      )}

      <PageSurface maxWidth="md">
        <PageContent sx={{ gap: "16px" }}>
          <Button color="inherit" component={Link} to="/" startIcon={<ArrowBack />} sx={{ alignSelf: "flex-start" }}>
            홈으로 돌아가기
          </Button>
          <TitleText color="text.primary" variant="h2">
            만든 사람들
          </TitleText>
          <Stack
            spacing={2}
            sx={{
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            {contributors.map((contributor) => {
              return (
                <Box
                  key={contributor.name}
                  sx={{
                    display: "flex",
                    gap: 2,
                    width: "100%",
                    p: { xs: 2, sm: 3 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <img
                    src={contributor.profile}
                    alt={`${contributor.name} 프로필`}
                    loading="lazy"
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "16px",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      whiteSpace: "pre-wrap",
                      minWidth: 0,
                      overflowWrap: "anywhere",
                      gap: "4px",
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 1 }}>
                        <Text variant="h5">{contributor.name}</Text>
                        <Text variant="h6">{`(${contributor.period})`}</Text>
                      </Box>
                      {contributor.description}
                    </Box>
                    <IconLink
                      href={contributor.homepage}
                      label={contributor.homepage}
                      icon={<GitHub />}
                      newTab
                    />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </PageContent>
      </PageSurface>
    </>
  );
}
