import type { TokenClaims, PermissionValues } from "../../api/generated/models";
export type TokenPayload = TokenClaims;

/** The generated literal types reject values that differ from the API contract. */
export const Permission = { Guest: 0, Student: 1, Teacher: 2, Dev: 100 } as const satisfies PermissionValues;

export const hasPermission = (actor: Pick<TokenPayload, "permission">, required: number) =>
  actor.permission >= required;

// Preserve defaults for existing tokens while returning plain data, not a class instance.
export const createTokenPayload = (claims: Partial<TokenPayload> = {}): TokenPayload => ({
  uid: 0, sid: "", id: "", permission: 0, type: "", iat: 0, exp: 0, jti: "", ...claims,
});

/** Decode UI claims only. The API is responsible for signature verification. */
export function decodeTokenPayload(token: string | null): TokenPayload {
  try {
    if (!token || token.split(".").length !== 3) return createTokenPayload();
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    const claims: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!claims || typeof claims !== "object" || Array.isArray(claims)) return createTokenPayload();
    const payload = createTokenPayload();
    for (const key of ["uid", "permission", "iat", "exp"] as const) {
      const value = (claims as Record<string, unknown>)[key];
      if (typeof value !== "number" || !Number.isFinite(value)) return createTokenPayload();
      payload[key] = value;
    }
    for (const key of ["sid", "id", "type", "jti"] as const) {
      const value = (claims as Record<string, unknown>)[key];
      if (typeof value !== "string") return createTokenPayload();
      payload[key] = value;
    }
    return payload;
  } catch {
    return createTokenPayload();
  }
}

/** Client navigation guard; the API remains the authority for protected data. */
export function canAccessRoute(actor: Pick<TokenPayload, "permission">, handle: unknown): boolean {
  if (!handle || typeof handle !== "object" || !("permission" in handle) || typeof handle.permission !== "number") return true;
  return "exact" in handle && handle.exact === true ? actor.permission === handle.permission : hasPermission(actor, handle.permission);
}
