type Tokens = { accessToken: string; refreshToken: string };
type Options = {
  read: () => Tokens | null;
  save: (tokens: Tokens) => void;
  needsRefresh: (accessToken: string) => boolean;
  refresh: (refreshToken: string) => Promise<Tokens | null>;
  lock: (run: () => Promise<boolean>) => Promise<boolean>;
};

/** Share refresh work within a tab and re-read storage after the cross-tab lock. */
export function createSessionRefresher(options: Options) {
  let pending: Promise<boolean> | undefined;
  return () => {
    if (pending) return pending;
    pending = options.lock(async () => {
      const before = options.read();
      if (!before) return true;
      if (!options.needsRefresh(before.accessToken)) return false;
      const updated = await options.refresh(before.refreshToken);
      const current = options.read();
      // A logout or account switch during the request must not be undone.
      if (!current) return true;
      if (current.refreshToken !== before.refreshToken) return options.needsRefresh(current.accessToken);
      if (!updated) return true;
      options.save(updated);
      return false;
    }).finally(() => { pending = undefined; });
    return pending;
  };
}
