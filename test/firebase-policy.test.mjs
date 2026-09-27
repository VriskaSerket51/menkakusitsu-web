import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { isFirebaseEnabled } from '../src/utils/firebase-policy.ts';

const localHosts = ['localhost', 'app.localhost', 'computer.local', '127.0.0.1', '127.2.3.4', '[::1]', '::1', '0.0.0.0', '10.1.2.3', '192.168.1.10', '172.16.0.1', '172.31.255.254'];
const publicHosts = ['example.com', 'localhost.example.com', '192.0.2.1', '172.15.1.1', '172.32.1.1'];
test('development and local previews stay offline unless explicitly enabled', () => {
  for (const host of [...localHosts, ...publicHosts]) {
    assert.equal(isFirebaseEnabled(host, true), false, host);
    assert.equal(isFirebaseEnabled(host, true, 'true'), true, host);
    assert.equal(isFirebaseEnabled(host, false, 'false'), false, host);
  }
  for (const host of localHosts) assert.equal(isFirebaseEnabled(host, false), false, host);
  for (const host of publicHosts) assert.equal(isFirebaseEnabled(host, false), true, host);
});
test('worker skips remote SDK imports on local hosts and allows explicit opt-in', () => {
  const source = readFileSync(new URL('../public/firebase-messaging-sw.js', import.meta.url), 'utf8');
  for (const host of [...localHosts.filter(host => host !== '::1'), ...publicHosts]) {
    for (const enabled of [false, true]) {
      let imports = 0;
      const href = 'http://' + host + '/firebase-messaging-sw.js' + (enabled ? '?firebase=enabled' : '');
      runInNewContext(source, {
        self: { location: new URL(href) }, URL,
        importScripts: () => imports++,
        firebase: { initializeApp() {}, messaging() {} }, console,
      });
      assert.equal(imports > 0, enabled || publicHosts.includes(host), href);
    }
  }
});
