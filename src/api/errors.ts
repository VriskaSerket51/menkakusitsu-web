import axios from "axios";
import type { HttpError } from "./generated/models/httpError.ts";

export function getApiError(error: unknown): HttpError["error"] | undefined {
  if (!axios.isAxiosError(error)) return;
  const body = error.response?.data;
  if (typeof body?.error?.code === "string" && typeof body.error.message === "string") return body.error;
}

export function isSessionError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
    && ["SESSION_INVALID", "TOKEN_INVALID", "TOKEN_EXPIRED", "HTTP_401"].includes(getApiError(error)?.code ?? "");
}
