import axios, { type AxiosRequestConfig } from "axios";

/** Public login transport. Authentication/refresh is intentionally not required. */
export const apiHttp = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const response = await axios<T>({
    baseURL: import.meta.env?.VITE_API_PREFIX ?? "",
    timeout: 5000,
    ...config,
    ...options,
  });
  return response.data;
};
