import { Permission } from "@/auth";
import { Box, Container, Paper, Stack } from "@mui/material";
import { GitHub } from "@mui/icons-material";
import { useEffect } from "react";

import { contributors } from "@/pages/contributors/members";
import { IconLink, Text, TitleText } from "@/components/basics";
import { setHeaderActive } from "@/hooks/use-navbar";
import { useAuth } from "@/hooks/use-auth";
import Logo from "@/components/basics/logo";

export default function ContributorsScreen() {
  const { payload } = useAuth();

  useEffect(() => {
    if (payload.permission <= Permission.Guest) {
      setHeaderActive(false);
      return () => {
        setHeaderActive(true);
      };
    }
  }, [payload]);

  return (
    <>
      {payload.permission == Permission.Guest && (
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

      <Container
        maxWidth="md"
        sx={{
          margin: "30px auto 50px",
        }}
      >
        <Paper>
          <Box
            sx={{
              padding: "50px 30px 30px 30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <TitleText color="secondary" variant="h2">
              만든 사람들
            </TitleText>
            <Stack
              spacing={2}
              sx={{
                alignItems: "flex-start",
                width: "100%"
              }}>
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
          </Box>
        </Paper>
      </Container>
    </>
  );
}
