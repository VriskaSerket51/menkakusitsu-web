import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSessionRefresher } from '../src/api/refresh-session.ts';

test('concurrent requests rotate once and re-read tokens after lock acquisition', async () => {
  let tokens = { accessToken: 'old', refreshToken: 'old-refresh' }, calls = 0;
  const refresh = createSessionRefresher({ read: () => tokens, save: value => { tokens = value; }, needsRefresh: token => token === 'old', lock: run => run(),
    refresh: async () => { calls++; return { accessToken: 'new', refreshToken: 'new-refresh' }; } });
  assert.deepEqual(await Promise.all([refresh(), refresh(), refresh()]), [false, false, false]);
  assert.equal(calls, 1);
  await refresh(); assert.equal(calls, 1);
});
test('tokens refreshed in another tab while waiting are reused', async () => {
  let tokens = { accessToken: 'old', refreshToken: 'old-refresh' };
  const refresh = createSessionRefresher({ read: () => tokens, save: () => assert.fail('must not save'), needsRefresh: token => token === 'old',
    lock: run => { tokens = { accessToken: 'new', refreshToken: 'new-refresh' }; return run(); }, refresh: async () => assert.fail('must not refresh') });
  assert.equal(await refresh(), false);
});
test('refresh does not undo a concurrent logout', async () => {
  let tokens = { accessToken: 'old', refreshToken: 'old-refresh' };
  const refresh = createSessionRefresher({ read: () => tokens, save: () => assert.fail('must not restore'), needsRefresh: () => true, lock: run => run(),
    refresh: async () => { tokens = null; return { accessToken: 'new', refreshToken: 'new-refresh' }; } });
  assert.equal(await refresh(), true);
});
