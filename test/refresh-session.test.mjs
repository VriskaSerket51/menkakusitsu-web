import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSessionRefresher } from '../src/features/auth/refresh-session.ts';

function fixture(overrides = {}) {
  let token = null, revision = 0, calls = 0;
  const save = value => { token = value; revision++; };
  const options = { read: () => token, revision: () => revision, save, needsRefresh: t => t === 'old',
    lock: run => run(), refresh: async () => { calls++; return { accessToken: 'new' }; }, ...overrides };
  return { refresh: createSessionRefresher(options), save, read: () => token, calls: () => calls };
}
test('reload restores from a cookie and concurrent requests rotate only once', async () => {
  const f = fixture();
  assert.deepEqual(await Promise.all([f.refresh(), f.refresh(), f.refresh()]), [false, false, false]);
  assert.equal(f.read(), 'new'); assert.equal(f.calls(), 1);
  await f.refresh(); assert.equal(f.calls(), 1);
});
test('expired access is refreshed without exposing a refresh token to JavaScript', async () => {
  const f = fixture(); f.save('old'); await f.refresh(); assert.equal(f.read(), 'new');
});
test('logout while waiting for the lock prevents refresh', async () => {
  const f = fixture({ lock: run => { f.save(null); return run(); } });
  f.save('old'); assert.equal(await f.refresh(), true); assert.equal(f.calls(), 0);
});
test('late refresh cannot undo logout or an account switch', async () => {
  for (const replacement of [null, 'other-account']) {
    const f = fixture({ refresh: async () => { f.save(replacement); return { accessToken: 'stale' }; } });
    f.save('old'); await f.refresh(); assert.equal(f.read(), replacement);
  }
});
test('invalid cookie clears access, but transient errors preserve it and allow retry', async () => {
  const invalid = fixture({ refresh: async () => null });
  invalid.save('old'); assert.equal(await invalid.refresh(), true); assert.equal(invalid.read(), null);
  let attempts = 0;
  const offline = fixture({ refresh: async () => { if (!attempts++) throw Error('offline'); return { accessToken: 'new' }; } });
  offline.save('old'); await assert.rejects(offline.refresh(), /offline/); assert.equal(offline.read(), 'old');
  assert.equal(await offline.refresh(), false); assert.equal(offline.read(), 'new');
});
