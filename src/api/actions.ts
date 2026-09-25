import {
  sessionLock,
  refreshSession,
  onLogout,
  notifySessionChange,
} from "@/features/auth/session";
import { getApiError, isSessionError } from "@/api/errors";
import type * as apiTypes from "@/api/types";
import axios from "axios";
import * as client from "@/api/generated/client";
import { createRequestRunner, type RequestOptions } from "@/api/request";

import { stopLoading } from "@/components/popup/hooks";
import { notify } from "@/components/snackbar/notify";
import { getDeviceId, getPushList, savePushList } from "@/utils/storage";
import { deletePushToken } from "@/utils/firebase.client";
import {
  getAccessToken,
  getTokenPayload,
  setAccessToken,
} from "@/features/auth/session-state";

export const onApiError = (error: unknown, silent = false) => {
  if (isSessionError(error)) onLogout();
  if (silent || axios.isCancel(error)) return;
  stopLoading();
  const problem = getApiError(error);
  const message =
    problem?.message ||
    (axios.isAxiosError(error) && !error.response
      ? "서버와 통신에 실패하였습니다. 인터넷 연결 상태를 확인해주세요."
      : "요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
  notify(message, "error");
};

const request = createRequestRunner({
  getAccessToken,
  refresh: refreshSession,
  onError: onApiError,
});

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

// Generated functions own URLs, query encoding, request bodies and response types.
export const postLogin = (props: apiTypes.LoginRequest) =>
  sessionLock(async () => {
    const result = await client.postLogin(props);
    setAccessToken(result.accessToken);
    notifySessionChange();
    return result;
  });
export const postRegister = (props: apiTypes.PostRegisterRequest) =>
  request((config) => client.postRegister(props, config), { public: true });
export const deleteLogout = async (props: apiTypes.DeleteLogoutRequest) => {
  if (getPushApproved()) {
    // Push cleanup is best effort; its failure must not prevent server-side logout.
    try {
      await request(
        (config) => client.deletePush({ deviceId: getDeviceId() }, config),
        { silent: true },
      );
      if (await deletePushToken()) setPushApproved(false);
    } catch {
      /* The session still needs to be revoked. */
    }
  }
  try {
    return await sessionLock(async () => {
      const result = await client.deleteLogout(props);
      onLogout();
      notifySessionChange();
      return result;
    });
  } catch (error) {
    onApiError(error);
    throw error;
  }
};

export const postBbsPost = (
  props: apiTypes.PostBbsPostRequest,
  files: File[],
) =>
  request((config) =>
    client.postBbsPost({ props: JSON.stringify(props), data: files }, config),
  );

export const getSpecialroomApply = async (
  props: apiTypes.GetApplyRequest,
  options: RequestOptions = {},
) => {
  try {
    return await request((config) => client.getApply(props, config), {
      ...options,
      silent: true,
    });
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 404 &&
      getApiError(error)?.code === "SPECIALROOM_NOT_FOUND"
    )
      return null;
    if (!options.silent && !axios.isCancel(error)) onApiError(error);
    throw error;
  }
};

export const deleteAccount = (
  props: apiTypes.DeleteAccountRequest,
  options: RequestOptions = {},
) => request((config) => client.deleteAccount(props, config), options);
export const getBbsPostList = (
  props: apiTypes.GetBbsPostListRequest,
  options: RequestOptions = {},
) => request((config) => client.getBbsPostList(props, config), options);
export const getBbsPost = (
  props: apiTypes.GetBbsPostRequest,
  options: RequestOptions = {},
) => request((config) => client.getBbsPost(props, config), options);
export const putBbsPost = (
  props: apiTypes.PutBbsPostRequest,
  options: RequestOptions = {},
) => request((config) => client.putBbsPost(props, config), options);
export const deleteBbsPost = (
  props: apiTypes.DeleteBbsPostRequest,
  options: RequestOptions = {},
) => request((config) => client.deleteBbsPost(props, config), options);
export const getBbsPostHeaders = (
  props: apiTypes.GetBbsPostHeaderRequest,
  options: RequestOptions = {},
) => request((config) => client.getBbsPostHeaders(props, config), options);
export const getBbsCommentList = (
  props: apiTypes.GetBbsCommentListRequest,
  options: RequestOptions = {},
) => request((config) => client.getBbsCommentList(props, config), options);
export const postBbsComment = (
  props: apiTypes.PostBbsCommentRequest,
  options: RequestOptions = {},
) => request((config) => client.postBbsComment(props, config), options);
export const deleteBbsComment = (
  props: apiTypes.DeleteBbsCommentRequest,
  options: RequestOptions = {},
) => request((config) => client.deleteBbsComment(props, config), options);
export const getIdbotChat = (
  props: apiTypes.GetIdbotChatRequest,
  options: RequestOptions = {},
) => request((config) => client.getIdbotMessage(props, config), options);
export const getMeal = (options: RequestOptions = {}) =>
  request((config) => client.getMeal(config), { ...options, public: true });
export const postSpecialroomApply = (
  props: apiTypes.PostApplyRequest,
  options: RequestOptions = {},
) => request((config) => client.postApply(props, config), options);
export const deleteSpecialroomApply = (
  props: apiTypes.DeleteApplyRequest,
  options: RequestOptions = {},
) => request((config) => client.deleteApply(props, config), options);
export const getAttendanceInfo = (options: RequestOptions = {}) =>
  request((config) => client.getAttendanceInfo(config), options);
export const getAttendanceList = (
  props: apiTypes.GetAttendanceListRequest,
  options: RequestOptions = {},
) => request((config) => client.getAttendanceList(props, config), options);
export const getSpecialroomInfo = (options: RequestOptions = {}) =>
  request((config) => client.getSpecialroomInfo(config), options);
export const putSpecialroomInfo = (
  props: apiTypes.PutInfoRequest,
  options: RequestOptions = {},
) => request((config) => client.putSpecialroomInfo(props, config), options);
export const getSpecialroomManagerInfo = (
  props: apiTypes.GetManagerRequest,
  options: RequestOptions = {},
) => request((config) => client.getManagerInfo(props.when, config), options);
export const getSpecialroomLocationInfo = (options: RequestOptions = {}) =>
  request((config) => client.getLocationInfo(config), options);
export const getSpecialroomPurposeInfo = (options: RequestOptions = {}) =>
  request((config) => client.getPurposeInfo(config), options);
export const getSpecialroomStudentInfo = (options: RequestOptions = {}) =>
  request((config) => client.getStudentInfo(config), options);
export const getSpecialroomTeacherInfo = (options: RequestOptions = {}) =>
  request((config) => client.getTeacherInfo(config), options);
export const getTimetable = (
  props: apiTypes.GetTimetableRequest,
  options: RequestOptions = {},
) => request((config) => client.getTimetable(props.when, config), options);
export const putTimetable = (
  props: apiTypes.PutTimetableRequest,
  options: RequestOptions = {},
) =>
  request((config) => client.putTimetable(props.when, props, config), options);
export const putUserPush = (
  props: apiTypes.PutPushRequest,
  options: RequestOptions = {},
) => request((config) => client.putPush(props, config), options);
export const deleteUserPush = (
  props: apiTypes.DeletePushRequest,
  options: RequestOptions = {},
) => request((config) => client.deletePush(props, config), options);
export const getMyPrivateInfo = (options: RequestOptions = {}) =>
  request((config) => client.getMyPrivateInfo(config), options);
export const putMyEmail = (
  props: apiTypes.PutEmailRequest,
  options: RequestOptions = {},
) => request((config) => client.putEmail(props, config), options);
export const putMyPassword = (
  props: apiTypes.PutPasswordRequest,
  options: RequestOptions = {},
) => request((config) => client.putPassword(props, config), options);
