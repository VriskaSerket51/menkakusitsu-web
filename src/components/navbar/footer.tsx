import { Container, Divider, Link, Stack } from "@mui/material";
import { School, Instagram, GitHub } from "@mui/icons-material";
import { Link as RouterLink } from "react-router";

export function FooterComponent() {
  return (
    <Container component="footer" maxWidth="xl" sx={{
      mt: "auto", pt: 2, pb: 3,
      "& a": {
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minHeight: 44, gap: 0.75, color: "text.secondary", fontSize: "0.875rem",
        textAlign: "center", overflowWrap: "anywhere",
        "&:hover": { color: "primary.main" },
        "& svg": { fontSize: 18, flexShrink: 0 },
      },
    }}>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={0.5} sx={{ alignItems: "center" }}>
        <Stack component="nav" aria-label="학교 관련 링크"
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 0, md: 3 }} sx={{ alignItems: "center" }}>
          <Link href="http://jeju-s.jje.hs.kr/jeju-s" target="_blank" rel="noopener noreferrer" underline="hover">
            <School />제주과학고 공식 홈페이지
          </Link>
          <Link href="https://www.instagram.com/jejuscience1999/" target="_blank" rel="noopener noreferrer" underline="hover">
            <Instagram />제주과학고 공식 인스타그램
          </Link>
          <Link href="https://www.instagram.com/jshs_bamboo/" target="_blank" rel="noopener noreferrer" underline="hover">
            <Instagram />제주과학고 대나무숲
          </Link>
        </Stack>
        <Stack component="nav" aria-label="사이트 안내" direction="row" spacing={2} useFlexGap
          sx={{ justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/policy.html" target="_blank" rel="noopener noreferrer" underline="hover">개인정보처리방침</Link>
          <Link component={RouterLink} to="/contributors" underline="hover">만든 사람들</Link>
        </Stack>
        <Link href="https://github.com/COMMON-Jshs" target="_blank" rel="noopener noreferrer" underline="hover"
          sx={{ "&&": { fontSize: "0.75rem" } }}>
          <GitHub />Made by 제주과학고 정보 동아리 COMMON
        </Link>
      </Stack>
    </Container>
  );
}
