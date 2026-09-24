import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Permission, hasPermission, createTokenPayload, decodeTokenPayload } from '../src/features/auth/token.ts';

test('web permission values and hierarchy match existing API tokens', () => {
  assert.deepEqual(Permission, { Guest: 0, Student: 1, Teacher: 2, Dev: 100 });
  const levels = Object.values(Permission);
  for (const [rank, permission] of levels.entries()) {
    assert.deepEqual(levels.map(required => hasPermission(createTokenPayload({ permission }), required)), levels.map((_, i) => i <= rank));
  }
});

test('logout defaults are isolated plain guest payloads', () => {
  const first = createTokenPayload();
  first.permission = Permission.Dev;
  assert.equal(hasPermission(createTokenPayload(), Permission.Student), false);
  assert.equal(Object.getPrototypeOf(createTokenPayload()), Object.prototype);
  assert.equal(createTokenPayload({ uid: 7, jti: 'token' }).jti, 'token');
});

const token = payload => 'header.' + Buffer.from(JSON.stringify(payload)).toString('base64url') + '.signature';
test('UI token decoding preserves UTF-8 and base64url claims', () => {
  const claims = createTokenPayload({ uid: 1, id: '한글😀', sid: 'session', exp: 2000000000 });
  assert.deepEqual(decodeTokenPayload(token(claims)), claims);
});
test('malformed or incorrectly typed claims fall back to guest', () => {
  for (const value of [null, '', 'broken', 'a.%%%.b', token(null), token([]), token({}), token(createTokenPayload({ permission: '100' }))]) {
    assert.deepEqual(decodeTokenPayload(value), createTokenPayload());
  }
});
