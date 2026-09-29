import { useCallback, useState } from "react";
import axios from "axios";
import { getApiError } from "@/api/errors";

/** Automatic queries report locally; explicit mutations keep snackbar feedback. */
export function useLoadError() {
  const [attempt, setAttempt] = useState(0);
  const retry = () => { setLoadError(null); setAttempt(value => value + 1); };
  const [loadError, setLoadError] = useState<string | null>(null);
  const trackLoad = useCallback(<T>(request: Promise<T>): Promise<T> => {
    void attempt; // A retry changes trackLoad identity and reruns its dependent query effects.
    setLoadError(null);
    return request.catch((error: unknown) => {
      if (!axios.isCancel(error))
        setLoadError(
          getApiError(error)?.message ??
            "정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
      throw error;
    });
  }, [attempt]);
  return { loadError, trackLoad, retry };
}
