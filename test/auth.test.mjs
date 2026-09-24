import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Permission, hasPermission, createTokenPayload } from '../src/auth.ts';

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
