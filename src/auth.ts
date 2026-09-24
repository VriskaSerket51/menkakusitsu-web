import type { TokenClaims, PermissionValues } from "./api/generated/models";
export type TokenPayload = TokenClaims;

/** The generated literal types reject values that differ from the API contract. */
export const Permission = { Guest: 0, Student: 1, Teacher: 2, Dev: 100 } as const satisfies PermissionValues;

export const hasPermission = (actor: Pick<TokenPayload, "permission">, required: number) =>
  actor.permission >= required;

// Preserve defaults for existing tokens while returning plain data, not a class instance.
export const createTokenPayload = (claims: Partial<TokenPayload> = {}): TokenPayload => ({
  uid: 0, sid: "", id: "", permission: 0, type: "", iat: 0, exp: 0, jti: "", ...claims,
});
