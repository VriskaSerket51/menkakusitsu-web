import { useRef, useState, type SubmitEvent } from "react";
import { onApiError } from "@/api/actions";
import { createSubmissionGate } from "@/utils/submission";

export function useFormSubmission(handle: (event: SubmitEvent<HTMLFormElement>) => void | Promise<void>) {
  const gate = useRef(createSubmissionGate());
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void gate.current(async () => {
      setSubmitting(true);
      try { await handle(event); }
      catch (error) { onApiError(error); }
      finally { setSubmitting(false); }
    });
  };
  return { onSubmit, submitting };
}
