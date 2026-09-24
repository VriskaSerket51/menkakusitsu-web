import { Container, Divider, Stack } from "@mui/material";
import { School, Policy, GitHub, PeopleAlt } from "@mui/icons-material";

import { IconLink, IconNavLink } from "@/components/basics";
import { InstagramLogo } from "@/components/images/instagram";

export function FooterComponent() {
  return (
    <Container maxWidth="xl" sx={{ marginBottom: "32px" }}>
      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "center"
        }}>
        <Divider variant="middle" flexItem />
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" variant="middle" flexItem />}
          spacing={2}
        >
          <IconLink
            href="http://jeju-s.jje.hs.kr/jeju-s"
            icon={<School />}
            label="제주과학고 공식 홈페이지"
            newTab
          />
          <IconLink
            href="https://www.instagram.com/jejuscience1999/"
            icon={<InstagramLogo />}
            label="제주과학고 공식 인스타그램"
            newTab
          />
          <IconLink
            href="https://www.instagram.com/jshs_bamboo/"
            icon={<InstagramLogo />}
            label="제주과학고 대나무숲"
            newTab
          />
        </Stack>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" variant="middle" flexItem />}
          spacing={2}
        >
          <IconLink
            href="/policy.html"
            icon={<Policy />}
            label="개인정보처리방침"
            newTab
          />
          <IconLink
            href="https://github.com/COMMON-Jshs"
            icon={<GitHub />}
            label="Made by 제주과학고 정보 동아리 COMMON"
            newTab
          />
          <IconNavLink
            to="/contributors"
            label="만든 사람들"
            icon={<PeopleAlt />}
          />
        </Stack>
      </Stack>
    </Container>
  );
}
