import axios, { type RawAxiosHeaders, type AxiosRequestConfig } from "axios";

/** Generated-client transport. Session handling is supplied by the request runner. */
export const apiHttp = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const merged = axios.mergeConfig(config, { ...config, ...options });
  if (
    ["/v1/auth/login", "/v1/auth/refresh", "/v1/auth/logout"].includes(
      config.url ?? "",
    )
  ) {
    merged.withCredentials = true;
    merged.headers = axios.AxiosHeaders.from(merged.headers as RawAxiosHeaders);
    merged.headers.set("X-CSRF-Protection", "1");
    merged.headers.delete("Authorization");
  }
  const response = await axios<T>({
    baseURL: import.meta.env?.VITE_API_PREFIX ?? "",
    timeout: 5000,
    ...merged,
  });
  // A missing API URL can send GET requests to the SPA HTML fallback.
  if (
    typeof response.data === "string" &&
    /text\/html/i.test(String(response.headers["content-type"]))
  ) {
    throw new axios.AxiosError(
      "Expected JSON, received HTML",
      "ERR_BAD_RESPONSE",
      response.config,
      response.request,
      response,
    );
  }
  return response.data;
};
