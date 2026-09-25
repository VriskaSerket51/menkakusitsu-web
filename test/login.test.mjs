import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AxiosError } from 'axios';
import { getApiError, isSessionError } from '../src/api/errors.ts';
import { postLogin } from '../src/api/generated/client.ts';

test('generated login sends the contract URL and request through the custom transport', async () => {
  const result = await postLogin({ id: 'student', password: 'digest' }, {
    adapter: async config => {
      assert.equal(config.url, '/v1/auth/login');
      assert.equal(config.method, 'post');
      assert.equal(config.timeout, 5000);
      assert.deepEqual(JSON.parse(config.data), { id: 'student', password: 'digest' });
      assert.equal(config.headers.has('Authorization'), false);
      return { data: { status: 0, message: '', accessToken: 'access', refreshToken: 'refresh', callbacks: [] },
        status: 200, statusText: 'OK', headers: {}, config };
    },
  });
  assert.equal(result.accessToken, 'access');
});

test('HTTP failures reject and expose the public error without treating bad credentials as session expiry', async () => {
  const response = { data: { error: { code: 'INVALID_CREDENTIALS', message: 'wrong password' }, requestId: 'test' }, status: 401, statusText: 'Unauthorized', headers: {} };
  await assert.rejects(postLogin({ id: 'student', password: 'wrong' }, {
    adapter: async config => { throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, { ...response, config }); },
  }), error => {
    assert.equal(getApiError(error).message, 'wrong password');
    assert.equal(isSessionError(error), false);
    return true;
  });
  const expired = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, { ...response, data: { error: { code: 'SESSION_INVALID', message: 'expired' } } });
  assert.equal(isSessionError(expired), true);
  assert.equal(getApiError(new Error('private')), undefined);
  await assert.rejects(postLogin({ id: 'student', password: 'digest' }, {
    adapter: async () => { throw new Error('network failure'); },
  }), /network failure/);
});

test('SPA HTML fallback is rejected instead of being treated as API data', async () => {
  await assert.rejects(postLogin({ id: 'student', password: 'digest' }, {
    adapter: async config => ({ data: '<!DOCTYPE html><html></html>', status: 200, statusText: 'OK', headers: { 'content-type': 'text/html' }, config }),
  }), error => error.code === 'ERR_BAD_RESPONSE');
});
