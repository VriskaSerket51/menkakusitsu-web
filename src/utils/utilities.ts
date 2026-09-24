import { SHA3 } from "sha3";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.locale("ko");
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const getSpanInfo = (date: string) => {
  const point = dayjs(date);
  const diff = Math.abs(point.diff(undefined, "day"));
  if (diff < 1) {
    return point.fromNow();
  }
  return point.format("LLL");
};

export const getDayInfo = () => {
  const day = dayjs();
  return {
    year: day.year(),
    month: day.month() + 1,
    date: day.date(),
  };
};

export const arrayRemove = <T>(array: Array<T>, item: T): Array<T> => {
  const index = array.indexOf(item);
  return arrayRemoveAt<T>(array, index);
};

export const arrayRemoveAt = <T>(array: Array<T>, index: number): Array<T> => {
  if (index > -1) {
    return array.splice(index, 1);
  }
  return [];
};

export const validateEmail = (email: string): boolean => {
  const input = document.createElement("input");
  input.type = "email";
  input.required = true;
  input.value = email;
  return input.checkValidity();
};

export const getParameter = (
  key: string,
  defaultValue: string = ""
): string => {
  const result = new URLSearchParams(window.location.search).get(key);
  if (result) {
    return result;
  } else {
    return defaultValue;
  }
};

export const openInNewTab = (url: string) => {
  window.open(url, "_blank", "noopener noreferrer");
};

export const redirectToHome = () => {
  window.location.href = "/";
};

export const hashSha3 = (input: string, bits: 224 | 256 | 384 | 512 = 512) => {
  const hash = new SHA3(bits);
  hash.update(input);
  return hash.digest("hex");
};
