import axios, { type AxiosRequestConfig } from "axios";

type Session = {
  getAccessToken: () => string | null;
  refresh: () => Promise<boolean>;
  onError: (error: unknown, silent?: boolean) => void;
};
export type RequestOptions = { public?: boolean; silent?: boolean; signal?: AbortSignal };

export function createRequestRunner(session: Session) {
  return async function request<T>(run: (config: AxiosRequestConfig) => Promise<T>, options: RequestOptions = {}): Promise<T> {
    try {
      const config: AxiosRequestConfig = { signal: options.signal };
      const checkCancellation = () => { if (options.signal?.aborted) throw new axios.CanceledError(); };
      checkCancellation();
      if (!options.public && session.getAccessToken()) {
        const expired = await session.refresh();
        checkCancellation();
        const token = session.getAccessToken();
        if (expired || !token) {
          throw new axios.AxiosError("Session expired", "ERR_BAD_REQUEST", undefined, undefined, {
            status: 401, statusText: "Unauthorized", headers: {}, config: { headers: new axios.AxiosHeaders() },
            data: { error: { code: "SESSION_INVALID", message: "로그인이 만료되었습니다. 다시 로그인해주세요." } },
          });
        }
        config.headers = { Authorization: "Bearer " + token };
      }
      return await run(config);
    } catch (error) {
      if (!axios.isCancel(error)) session.onError(error, options.silent);
      throw error;
    }
  };
}
