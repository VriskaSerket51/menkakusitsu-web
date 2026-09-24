import assert from 'node:assert/strict';
import { test } from 'node:test';
import axios from 'axios';
import { createRequestRunner } from '../src/api/request.ts';
import { getIdbotMessage, postBbsPost } from '../src/api/generated/client.ts';

test('authenticated requests use the token obtained after refresh; public requests skip session work', async () => {
  let token = 'old'; let refreshes = 0;
  const request = createRequestRunner({ getAccessToken: () => token, refresh: async () => { refreshes++; token = 'new'; return false; }, onError: () => assert.fail('unexpected error') });
  await request(async config => { assert.equal(config.headers.Authorization, 'Bearer new'); });
  await request(async config => { assert.equal(config.headers, undefined); }, { public: true });
  assert.equal(refreshes, 1);
});

test('expired sessions block requests and report an error once; transient failures do not turn into session expiry', async () => {
  const errors = [];
  const request = createRequestRunner({ getAccessToken: () => 'access', refresh: async () => true, onError: error => errors.push(error) });
  await assert.rejects(request(async () => assert.fail('must not send')), error => error.response.status === 401 && error.response.data.error.code === 'SESSION_INVALID');
  assert.equal(errors.length, 1);
  const network = new Error('offline');
  const transient = createRequestRunner({ getAccessToken: () => 'access', refresh: async () => { throw network; }, onError: error => errors.push(error) });
  await assert.rejects(transient(async () => assert.fail('must not send')), error => error === network);
  assert.equal(errors.length, 2);
});

test('aborting during token refresh never sends the request or opens an error popup', async () => {
  const controller = new AbortController();
  const request = createRequestRunner({ getAccessToken: () => 'access', refresh: async () => { controller.abort(); return false; }, onError: () => assert.fail('cancellation is silent') });
  await assert.rejects(request(async () => assert.fail('must not send'), { signal: controller.signal }), axios.isCancel);
});

test('generated queries preserve Korean, ampersands and question marks', async () => {
  const text = '면학 & 급식? #내일';
  await getIdbotMessage({ chatInput: text }, { adapter: async config => {
    const url = new URL(axios.getUri(config), 'https://example.com');
    assert.equal(url.pathname, '/v1/chat/idbot/message');
    assert.equal(url.searchParams.get('chatInput'), text);
    assert.equal([...url.searchParams].length, 1);
    return { data: { status: 0, message: '', chatOutput: '' }, status: 200, statusText: 'OK', headers: {}, config };
  } });
});

test('generated uploads retain props, files and authorization together', async () => {
  const props = JSON.stringify({ title: 'test', board: 'feedback' });
  const file = new Blob(['upload'], { type: 'text/plain' });
  await postBbsPost({ props, data: [file] }, { headers: { Authorization: 'Bearer access' }, adapter: async config => {
    assert.equal(config.headers.get('Authorization'), 'Bearer access');
    assert.equal(config.data.get('props'), props);
    assert.equal(await config.data.get('data').text(), 'upload');
    return { data: { status: 0, message: '', postId: 1 }, status: 200, statusText: 'OK', headers: {}, config };
  } });
});

test('background errors still reach auth handling while requesting silent presentation', async () => {
  let reported;
  const request = createRequestRunner({ getAccessToken: () => 'access', refresh: async () => true, onError: (error, silent) => { reported = { error, silent }; } });
  await assert.rejects(request(async () => assert.fail('expired'), { silent: true }));
  assert.equal(reported.silent, true);
  assert.equal(reported.error.response.data.error.code, 'SESSION_INVALID');
});
