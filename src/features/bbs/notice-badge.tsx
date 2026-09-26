import { Chip } from "@mui/material";
import { Campaign } from "@mui/icons-material";
import { noticeColor, noticeSurface } from "./notice-styles";

export function NoticeBadge() {
  return <Chip icon={<Campaign />} label="공지" size="small" variant="outlined"
    sx={theme => ({ ...noticeSurface(theme), color: noticeColor(theme), fontWeight: 600,
      flexShrink: 0, "& .MuiChip-icon": { color: "inherit" } })} />;
}
