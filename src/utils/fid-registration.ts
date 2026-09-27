export type RegistrationChange = { state: "registered" | "unregistered"; installationId: string };
type Ports = {
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  onRegistered: (listener: (id: string) => void) => () => void;
  onUnregistered: (listener: (id: string) => void) => () => void;
};
/** Keep the SDK observers installed for FID rotation, and serialize registration changes. */
export function createFidRegistration(ports: Ports) {
  let currentId: string | null = null;
  let queue = Promise.resolve();
  const listeners = new Set<(change: RegistrationChange) => void>();
  const publish = (change: RegistrationChange) => {
    for (const listener of listeners) { try { listener(change); } catch { /* Observers cannot fail registration. */ } }
  };
  const stopRegistered = ports.onRegistered(id => {
    currentId = id;
    publish({ state: "registered", installationId: id });
  });
  const stopUnregistered = ports.onUnregistered(id => {
    if (currentId === id) currentId = null;
    publish({ state: "unregistered", installationId: id });
  });
  const enqueue = <T>(run: () => Promise<T>): Promise<T> => {
    const result = queue.then(run);
    queue = result.then(() => {}, () => {});
    return result;
  };
  return {
    register: () => enqueue(async () => {
      currentId = null;
      await ports.register();
      if (!currentId) throw new Error("FCM registration completed without an installation ID");
      return currentId;
    }),
    unregister: () => enqueue(() => ports.unregister()),
    subscribe: (listener: (change: RegistrationChange) => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    dispose: () => { stopRegistered(); stopUnregistered(); listeners.clear(); },
  };
}
