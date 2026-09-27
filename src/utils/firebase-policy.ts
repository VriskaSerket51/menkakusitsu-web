export function isFirebaseEnabled(hostname: string, development: boolean, override?: string): boolean {
  if (override === "true") return true;
  if (override === "false") return false;
  return !development && !/^(localhost|.*\.localhost|.*\.local|\[?::1\]?|0\.0\.0\.0|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})$/i.test(hostname);
}
