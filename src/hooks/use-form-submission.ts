import { useLayoutEffect, useRef, useState, type SubmitEvent, type KeyboardEvent } from "react";
import axios from "axios";
import { onApiError } from "@/api/actions";
import { getApiError } from "@/api/errors";
import { createSubmissionGate } from "@/utils/submission";
import { isCompositionEnter } from "@/utils/form-keyboard";

export function useFormSubmission(handle: (event: SubmitEvent<HTMLFormElement>) => void | Promise<void>) {
  const gate = useRef(createSubmissionGate());
  const form = useRef<HTMLFormElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  useLayoutEffect(() => {
    if (submitting || !form.current?.isConnected) return;
    const target = Array.from(form.current.querySelectorAll<HTMLElement>(
      '[aria-invalid="true"], [data-form-error]',
    )).find(element => element.getClientRects().length && !element.closest('[aria-hidden="true"]'));
    target?.focus();
  }, [submitting, submitError, completed]);
  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void gate.current(async () => {
      form.current = event.currentTarget;
      setSubmitError(null);
      setSubmitting(true);
      try { await handle(event); }
      catch (error) {
        if (!axios.isCancel(error)) {
          onApiError(error, true);
          setSubmitError(getApiError(error)?.message ??
            "요청 처리에 실패했습니다. 입력 내용을 유지했으니 다시 시도해주세요.");
        }
      }
      finally { setSubmitting(false); setCompleted(value => value + 1); }
    });
  };
  const onKeyDownCapture = (event: KeyboardEvent<HTMLFormElement>) => {
    if (isCompositionEnter(event.nativeEvent)) event.preventDefault();
  };
  return { onSubmit, submitting, submitError, onKeyDownCapture };
}
