import { postLogin } from '../src/api/generated/client';
import type { TokenPayload } from '../src/features/auth/token';
import type { PermissionValues } from '../src/api/generated/models';

function sharedAuthTypeChecks() {
  const claims: TokenPayload = { uid: 7, sid: 'session', id: 'student', permission: 1, type: 'access', iat: 1, exp: 2, jti: 'token' };
  // @ts-expect-error JWT permission remains numeric in the API contract.
  const malformed: TokenPayload = { ...claims, permission: 'teacher' };
  // @ts-expect-error Permission values must match the API's literal values.
  const drifted: PermissionValues = { Guest: 0, Student: 1, Teacher: 3, Dev: 100 };
}

async function contractTypeChecks() {
  // @ts-expect-error: password is required by the API contract.
  postLogin({ id: 'student' });
  // @ts-expect-error: id is a string, not a number.
  postLogin({ id: 7, password: 'digest' });
  const result = await postLogin({ id: 'student', password: 'digest' });
  // @ts-expect-error Refresh credentials are available only through HttpOnly cookies.
  result.refreshToken;
  const token: string = result.accessToken;
  const successStatus: 0 = result.status;
}
