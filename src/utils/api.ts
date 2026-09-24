import { getApiError, isSessionError } from "@/api/errors";
import { createSessionRefresher } from "@/api/refresh-session";
import type { DefaultResponse } from "@/api/types";
import type * as apiTypes from "@/api/types";
import axios from "axios";
import { postLogin as generatedPostLogin } from "@/api/generated/client";

import popup from "@/components/popup";
import { DialogTitle } from "@/utils/constants";
import {
  clearTokens,
  getAccessToken,
  getDeviceId,
  getPushList,
  getRefreshToken,
  savePushList,
  saveTokens,
} from "@/utils/storage";
import { getTokenPayload, parseJwt } from "@/utils/utilities";
import { deletePushToken } from "@/utils/firebase";
import { logout } from "@/hooks/use-auth";

export const onApiError = (error: unknown) => {
  popup.stopLoading();
  if (isSessionError(error)) onLogout();
  const problem = getApiError(error);
  const message = problem?.message || (axios.isAxiosError(error) && !error.response
    ? "서버와 통신에 실패하였습니다. 인터넷 연결 상태를 확인해주세요."
    : "요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
  popup.openConfirmDialog(DialogTitle.Alert, message);
};

export const isSuccess = (result: DefaultResponse) => {
  return result.status === 0;
};

export const apiRequest = async (
  method: string,
  path: string,
  data?: any,
  headers?: any
) => {
  const url = import.meta.env.VITE_API_PREFIX + path;
  let accessToken = getAccessToken();
  if (!accessToken) {
    return axios({
      method: method,
      url: url,
      data: data,
      headers: headers,
      timeout: 5000,
    });
  }
  if (await checkTokenExpiration(accessToken)) {
    onLogout();
    throw new axios.AxiosError("Session expired", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 401, statusText: "Unauthorized", headers: {}, config: { headers: new axios.AxiosHeaders() },
      data: { error: { code: "SESSION_INVALID", message: "로그인이 만료되었습니다. 다시 로그인해주세요." } },
    });
  }
  accessToken = getAccessToken();
  accessToken = `Bearer ${accessToken}`;
  return axios({
    method: method,
    url: url,
    data: data,
    headers: {
      ...headers,
      Authorization: accessToken,
    },
    timeout: 5000,
  });
};

const refreshSession = createSessionRefresher({
  read: () => {
    const accessToken = getAccessToken(), refreshToken = getRefreshToken();
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  },
  save: tokens => saveTokens(tokens.accessToken, tokens.refreshToken),
  needsRefresh: token => {
    const claims = parseJwt(token);
    return !claims || !claims.sid || claims.exp - Date.now() / 1000 < 60;
  },
  lock: run => typeof navigator !== "undefined" && navigator.locks
    ? navigator.locks.request("menkakusitsu-session-refresh", run) : run(),
  refresh: async refreshToken => {
    const claims = parseJwt(refreshToken);
    if (!claims?.sid || claims.exp <= Date.now() / 1000) return null;
    const response = await axios.post(import.meta.env.VITE_API_PREFIX + "/v1/auth/refresh", {}, {
      headers: { Authorization: "Bearer " + refreshToken }, timeout: 15000,
    }).catch(error => {
      if (isSessionError(error)) return null;
      throw error;
    });
    if (!response) return null;
    const result = response.data as apiTypes.PostRefreshResponse;
    return result.status === 0 ? { accessToken: result.accessToken, refreshToken: result.refreshToken } : null;
  },
});
export const checkTokenExpiration = (_accessToken: string) => refreshSession();

export const onLogout = () => {
  clearTokens();
  logout();
};

export const getPushApproved = () => {
  const pushList = getPushList();
  const payload = getTokenPayload();
  if (!payload) {
    return false;
  }
  return pushList[payload.uid] === true;
};

export const setPushApproved = (value: boolean) => {
  const payload = getTokenPayload();
  if (!payload) {
    return;
  }
  const pushList = getPushList();
  pushList[payload.uid] = value;
  savePushList(pushList);
};

export const apiGet = (path: string, headers?: any) => {
  return apiRequest("get", path, null, headers).catch(error => { onApiError(error); throw error; });
};

export const apiPost = (path: string, body?: any, headers?: any) => {
  return apiRequest("post", path, body, headers).catch(error => { onApiError(error); throw error; });
};

export const apiPut = (path: string, body: any = null, headers?: any) => {
  return apiRequest("put", path, body, headers).catch(error => { onApiError(error); throw error; });
};

export const apiDelete = (path: string, body: any = null, headers?: any) => {
  return apiRequest("delete", path, body, headers).catch(error => { onApiError(error); throw error; });
};

//Auth
export const postRegister = async (props: apiTypes.PostRegisterRequest) => {
  const resp = await apiPost("/v1/auth/account", props);
  const result: apiTypes.PostRegisterResponse = resp.data;
  return result;
};

export const deleteAccount = async (props: apiTypes.DeleteAccountRequest) => {
  const resp = await apiDelete("/v1/auth/account", props);
  const result: apiTypes.DeleteAccountResponse = resp.data;
  return result;
};

export const postLogin = generatedPostLogin;

export const deleteLogout = async (props: apiTypes.DeleteLogoutRequest) => {
  if (getPushApproved()) {
    const result = await deletePushToken();
    if (result) {
      await deleteUserPush({
        deviceId: getDeviceId(),
      });
    }
  }
  const resp = await apiDelete("/v1/auth/logout", props);
  const result: apiTypes.DeleteLogoutResponse = resp.data;
  return result;
};

//BBS
export const getBbsPostList = async (props: apiTypes.GetBbsPostListRequest) => {
  const resp = await apiGet(
    `/v1/bbs/post/list?board=${props.board}&postPage=${props.postPage}&postListSize=${props.postListSize}`
  );
  const result: apiTypes.GetBbsPostListResponse = resp.data;
  return result;
};

export const getBbsPost = async (props: apiTypes.GetBbsPostRequest) => {
  const resp = await apiGet(
    `/v1/bbs/post?board=${props.board}&postId=${props.postId}`
  );
  const result: apiTypes.GetBbsPostResponse = resp.data;
  return result;
};

export const postBbsPost = async (
  props: apiTypes.PostBbsPostRequest,
  data: File[]
) => {
  const formData = new FormData();
  formData.append("props", JSON.stringify(props));
  for (const file of data) {
    formData.append("data", file);
  }
  const resp = await apiPost("/v1/bbs/post", formData, {
    "Content-Type": "multipart/form-data; charset: UTF-8;",
  });
  const result: apiTypes.PostBbsPostResponse = resp.data;
  return result;
};

export const putBbsPost = async (props: apiTypes.PutBbsPostRequest) => {
  const resp = await apiPut("/v1/bbs/post", props);
  const result: apiTypes.PutBbsPostResponse = resp.data;
  return result;
};

export const deleteBbsPost = async (props: apiTypes.DeleteBbsPostRequest) => {
  const resp = await apiDelete("/v1/bbs/post", props);
  const result: apiTypes.DeleteBbsPostResponse = resp.data;
  return result;
};

export const getBbsPostHeaders = async (props: apiTypes.GetBbsPostHeaderRequest) => {
  const resp = await apiGet(`/v1/bbs/post/headers?board=${props.board}`);
  const result: apiTypes.GetBbsPostHeaderResponse = resp.data;
  return result;
};

export const getBbsCommentList = async (props: apiTypes.GetBbsCommentListRequest) => {
  const resp = await apiGet(
    `/v1/bbs/comment/list?board=${props.board}&postId=${props.postId}&commentPage=${props.commentPage}&commentListSize=${props.commentListSize}`
  );
  const result: apiTypes.GetBbsCommentListResponse = resp.data;
  return result;
};

export const postBbsComment = async (props: apiTypes.PostBbsCommentRequest) => {
  const resp = await apiPost("/v1/bbs/comment", props);
  const result: apiTypes.PostBbsCommentResponse = resp.data;
  return result;
};

export const deleteBbsComment = async (props: apiTypes.DeleteBbsCommentRequest) => {
  const resp = await apiDelete("/v1/bbs/comment", props);
  const result: apiTypes.PostBbsCommentResponse = resp.data;
  return result;
};

//Chat
export const getIdbotChat = async (props: apiTypes.GetIdbotChatRequest) => {
  const resp = await apiGet(
    `/v1/chat/idbot/message?chatInput=${props.chatInput}`
  );
  const result: apiTypes.GetIdbotChatResponse = resp.data;
  return result;
};

//Timetable
export const getMeal = async (props: apiTypes.GetMealRequest) => {
  const resp = await apiGet(`/v1/meal/now`);
  const result: apiTypes.GetMealResponse = resp.data;
  return result;
};

//Specialroom
export const getSpecialroomApply = async (props: apiTypes.GetApplyRequest): Promise<apiTypes.GetApplyResponse | null> => {
  try {
    const response = await apiRequest("get", `/v1/specialroom/apply?when=${props.when}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404 && getApiError(error)?.code === "SPECIALROOM_NOT_FOUND") return null;
    onApiError(error);
    throw error;
  }
};

export const postSpecialroomApply = async (props: apiTypes.PostApplyRequest) => {
  const resp = await apiPost("/v1/specialroom/apply", props);
  const result: apiTypes.PostApplyResponse = resp.data;
  return result;
};

export const deleteSpecialroomApply = async (props: apiTypes.DeleteApplyRequest) => {
  const resp = await apiDelete("/v1/specialroom/apply", props);
  const result: apiTypes.DeleteApplyResponse = resp.data;
  return result;
};

export const getAttendanceInfo = async (props: apiTypes.GetAttendanceInfoRequest) => {
  const resp = await apiGet("/v1/specialroom/attendance/info");
  const result: apiTypes.GetAttendanceInfoResponse = resp.data;
  return result;
};

export const getAttendanceList = async (props: apiTypes.GetAttendanceListRequest) => {
  const resp = await apiGet(
    `/v1/specialroom/attendance/list?when=${props.when}`
  );
  const result: apiTypes.GetAttendanceListResponse = resp.data;
  return result;
};

export const getSpecialroomInfo = async (props: apiTypes.GetInfoRequest) => {
  const resp = await apiGet("/v1/specialroom/info");
  const result: apiTypes.GetInfoResponse = resp.data;
  return result;
};

export const putSpecialroomInfo = async (props: apiTypes.PutInfoRequest) => {
  const resp = await apiPut("/v1/specialroom/info", props);
  const result: apiTypes.PutInfoResponse = resp.data;
  return result;
};

export const getSpecialroomManagerInfo = async (
  props: apiTypes.GetManagerRequest
) => {
  const resp = await apiGet(`/v1/specialroom/info/manager/${props.when}`);
  const result: apiTypes.GetManagerResponse = resp.data;
  return result;
};

export const getSpecialroomLocationInfo = async (
  props: apiTypes.GetLocationInfoRequest
) => {
  const resp = await apiGet("/v1/specialroom/info/location");
  const result: apiTypes.GetLocationInfoResponse = resp.data;
  return result;
};

export const getSpecialroomPurposeInfo = async (
  props: apiTypes.GetPurposeInfoRequest
) => {
  const resp = await apiGet("/v1/specialroom/info/purpose");
  const result: apiTypes.GetPurposeInfoResponse = resp.data;
  return result;
};

export const getSpecialroomStudentInfo = async (
  props: apiTypes.GetStudentInfoRequest
) => {
  const resp = await apiGet("/v1/specialroom/info/student");
  const result: apiTypes.GetStudentInfoResponse = resp.data;
  return result;
};

export const getSpecialroomTeacherInfo = async (
  props: apiTypes.GetTeacherInfoRequest
) => {
  const resp = await apiGet("/v1/specialroom/info/teacher");
  const result: apiTypes.GetTeacherInfoResponse = resp.data;
  return result;
};

//Timetable
export const getTimetable = async (props: apiTypes.GetTimetableRequest) => {
  const resp = await apiGet(`/v1/timetable/${props.when}`);
  const result: apiTypes.GetTimetableResponse = resp.data;
  return result;
};

export const putTimetable = async (props: apiTypes.PutTimetableRequest) => {
  const resp = await apiPut(`/v1/timetable/${props.when}`, props);
  const result: apiTypes.PutTimetableResponse = resp.data;
  return result;
};

//User
export const postUserPush = async (props: apiTypes.PostPushRequest) => {
  const resp = await apiPost("/v1/user/push", props);
  const result: apiTypes.PostPushResponse = resp.data;
  return result;
};

export const putUserPush = async (props: apiTypes.PutPushRequest) => {
  const resp = await apiPut("/v1/user/push", props);
  const result: apiTypes.PutPushResponse = resp.data;
  return result;
};

export const deleteUserPush = async (props: apiTypes.DeletePushRequest) => {
  const resp = await apiDelete("/v1/user/push", props);
  const result: apiTypes.DeletePushResponse = resp.data;
  return result;
};

export const getMyPrivateInfo = async (props: apiTypes.GetMyPrivateInfoRequest) => {
  const resp = await apiGet("/v1/user/me");
  const result: apiTypes.GetMyPrivateInfoResponse = resp.data;
  return result;
};

export const putMyEmail = async (props: apiTypes.PutEmailRequest) => {
  const resp = await apiPut("/v1/user/me/email", props);
  const result: apiTypes.PutEmailResponse = resp.data;
  return result;
};

export const putMyPassword = async (props: apiTypes.PutPasswordRequest) => {
  const resp = await apiPut("/v1/user/me/password", props);
  const result: apiTypes.PutPasswordResponse = resp.data;
  return result;
};
