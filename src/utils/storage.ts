import { v4 as uuid } from "uuid";

export const getDeviceId = () => {
  let deviceId = localStorage.getItem("device-id");
  if (!deviceId) {
    deviceId = uuid();
    localStorage.setItem("device-id", deviceId);
  }
  return deviceId;
};

export const getPushList = () => {
  let pushListJson = localStorage.getItem("has-push");
  if (!pushListJson) {
    pushListJson = JSON.stringify({});
    localStorage.setItem("has-push", pushListJson);
  }
  return JSON.parse(pushListJson);
};

export const savePushList = (pushList: NonNullable<unknown>) => {
  localStorage.setItem("has-push", JSON.stringify(pushList));
};

export const getAccessToken = () => {
  return localStorage.getItem("access-token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refresh-token");
};

export const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("access-token", accessToken);
  localStorage.setItem("refresh-token", refreshToken);
};

export const clearTokens = () => {
  localStorage.setItem("access-token", "");
  localStorage.setItem("refresh-token", "");
};

export const getPostListSize = () => {
  let postListSize = Number(localStorage.getItem("POST_LIST_SIZE"));
  if (!postListSize) {
    postListSize = 20;
    localStorage.setItem("POST_LIST_SIZE", String(postListSize));
  }
  return postListSize;
};

export const getCommentListSize = () => {
  let commentListSize = Number(localStorage.getItem("COMMENT_LIST_SIZE"));
  if (!commentListSize) {
    commentListSize = 70;
    localStorage.setItem("COMMENT_LIST_SIZE", String(commentListSize));
  }
  return commentListSize;
};

export type ColorScheme = "light" | "dark";

export const getColorScheme = () => {
  if (localStorage.getItem("color-scheme") == "dark") {
    return "dark";
  }
  return "light";
};

export const setColorScheme = (scheme: ColorScheme) => {
  localStorage.setItem("color-scheme", scheme);
};
