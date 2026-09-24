type Options = {
  read: () => string | null;
  revision: () => number;
  save: (token: string | null) => void;
  needsRefresh: (token: string) => boolean;
  refresh: () => Promise<{ accessToken: string } | null>;
  lock: (run: () => Promise<boolean>) => Promise<boolean>;
};

/** Coalesce local requests; the browser sends the current cookie after acquiring the lock. */
export function createSessionRefresher(options: Options) {
  let pending: Promise<boolean> | undefined;
  return () => {
    if (pending) return pending;
    const revision = options.revision();
    pending = options.lock(async () => {
      const changed = () => options.revision() !== revision;
      const expired = () => { const token = options.read(); return !token || options.needsRefresh(token); };
      if (changed()) return expired();
      if (!expired()) return false;
      const updated = await options.refresh();
      // A late response must not restore a logged-out or replaced session.
      if (changed()) return expired();
      options.save(updated?.accessToken ?? null);
      return !updated;
    }).finally(() => { pending = undefined; });
    return pending;
  };
}
