import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getAccessToken, getSessionRevision, setAccessToken, authStore } from '../src/features/auth/session-state.ts';
import { postLogin, postRefresh, deleteLogout, getMyPrivateInfo } from '../src/api/generated/client.ts';

test('access credentials use memory and notify the UI on refresh and logout', () => {
  assert.equal(getAccessToken(), null);
  const values = [], before = getSessionRevision();
  const off = authStore.subscribe(state => state.accessToken, token => values.push(token));
  setAccessToken('first'); setAccessToken('rotated'); setAccessToken(null); off();
  assert.deepEqual(values, ['first', 'rotated', null]); assert.equal(getSessionRevision(), before + 3);
});
test('generated cookie operations include credentials and CSRF header, never Bearer tokens', async () => {
  const seen = [];
  const options = { headers: { Authorization: 'Bearer forbidden' }, adapter: async config => {
    seen.push(config); return { status: 200, statusText: 'OK', headers: {}, config, data: {} };
  } };
  await postLogin({ id: 'student', password: 'digest' }, options);
  await postRefresh({}, options); await deleteLogout({}, options);
  for (const config of seen) {
    assert.equal(config.withCredentials, true); assert.equal(config.headers.get('X-CSRF-Protection'), '1');
    assert.equal(config.headers.has('Authorization'), false);
    assert.equal(config.headers.get('Content-Type'), 'application/json');
  }
  assert.equal(JSON.parse(seen[0].data).id, 'student');
  await getMyPrivateInfo(options);
  assert.equal(seen[3].headers.get('Authorization'), 'Bearer forbidden');
  assert.notEqual(seen[3].withCredentials, true);
});

const token = (claims = {}) => ['header', Buffer.from(JSON.stringify({
  uid: 7, sid: 'device-1', id: 'student', permission: 1, type: 'access', iat: 1, exp: 100, jti: 'first', ...claims,
})).toString('base64url'), 'signature'].join('.');

test('token rotation updates credentials without notifying identity or permission subscribers', () => {
  setAccessToken(token());
  let identityChanges = 0, permissionChanges = 0, tokenChanges = 0;
  const stops = [
    authStore.subscribe(s => s.payload.sid, () => identityChanges++),
    authStore.subscribe(s => s.payload.permission, () => permissionChanges++),
    authStore.subscribe(s => s.accessToken, () => tokenChanges++),
  ];
  setAccessToken(token({ iat: 50, exp: 150, jti: 'rotated' }));
  assert.equal(tokenChanges, 1); assert.equal(identityChanges, 0); assert.equal(permissionChanges, 0);
  setAccessToken(token({ permission: 2 }));
  assert.equal(permissionChanges, 1); assert.equal(identityChanges, 0);
  setAccessToken(token({ sid: 'device-2' }));
  assert.equal(identityChanges, 1);
  setAccessToken(null); assert.equal(identityChanges, 2);
  stops.forEach(stop => stop());
});

test('repeated logout invalidates pending refresh even with an already empty token', () => {
  setAccessToken(null);
  const before = getSessionRevision();
  setAccessToken(null);
  assert.equal(getSessionRevision(), before + 1);
  assert.equal(getAccessToken(), null);
});
