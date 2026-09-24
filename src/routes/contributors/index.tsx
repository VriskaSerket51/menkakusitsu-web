import { PageSurface } from "@/components/layout/page-surface";
import { PageContent } from "@/components/layout/page-layout";
import { Permission } from "@/features/auth/token";
import { Box, Stack } from "@mui/material";
import { GitHub } from "@mui/icons-material";
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
          <TitleText color="secondary" variant="h2">
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
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={contributor.profile}
                    style={{
                      width: "96px",
                      height: "96px",
                      marginRight: "1em",
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      whiteSpace: "pre-wrap",
                      gap: "4px",
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex" }}>
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
