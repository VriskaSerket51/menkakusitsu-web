import { getCommentListSize, getPostListSize } from "@/utils/storage";

export enum DialogTitle {
  Info = "알림",
  Warning = "경고!",
  Alert = "잠시만요!",
  Notice = "공지사항",
}

export const SPECIALROOM_INFO_INTERVAL = 15000;
export const POST_LIST_SIZE = getPostListSize();
export const COMMENT_LIST_SIZE = getCommentListSize();
