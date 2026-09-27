/** Lock synchronously, including calls made before React renders the pending state. */
export function createSubmissionGate() {
  let busy = false;
  return async (run: () => void | Promise<void>) => {
    if (busy) return;
    busy = true;
    try { await run(); } finally { busy = false; }
  };
}
