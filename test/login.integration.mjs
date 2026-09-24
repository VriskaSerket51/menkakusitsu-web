import assert from 'node:assert/strict';
import axios from 'axios';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequestRunner } from '../src/api/request.ts';
import { postLogin, postRefresh, getMyPrivateInfo, deleteLogout } from '../src/api/generated/client.ts';

const apiRoot = path.resolve(process.env.API_PROJECT_DIR ?? '../menkakusitsu-api');
const { createRuntime, createApplication } = await import(pathToFileURL(path.join(apiRoot, 'test/integration-exports.mjs')).href);
const { createDatabaseDouble } = await import(pathToFileURL(path.join(apiRoot, 'test/fixtures.mjs')).href);
let closed = false;
const { db } = createDatabaseDouble();
const runtime = createRuntime({ config: { jwtSecret: 'integration-test-only' }, logging: { silent: true }, database: db,
  disconnectDatabase: async () => { closed = true; },
});
const app = await createApplication(runtime);
try {
  const server = await app.listen({ host: '127.0.0.1', port: 0 });
  let cookie = '';
  const options = { baseURL: 'http://127.0.0.1:' + server.address().port, headers: { Origin: 'http://localhost:3000' },
    adapter: async config => {
      config.headers.set('Origin', 'http://localhost:3000');
      if (cookie) config.headers.set('Cookie', cookie);
      const response = await axios.getAdapter('http')(config);
      const issued = response.headers['set-cookie'];
      if (issued) { assert.match(issued[0], /HttpOnly/); cookie = issued[0].split(';')[0]; }
      return response;
    },
  };
  const success = await postLogin({ id: 'student', password: 'digest' }, options);
  assert.equal(success.status, 0);
  assert.equal('refreshToken' in success, false);
  const originalCookie = cookie;
  const restored = await postRefresh({}, options);
  assert.equal('refreshToken' in restored, false);
  assert.notEqual(cookie, originalCookie);
  assert.equal((await runtime.jwt.verifyJwt(success.accessToken)).uid, 7);
  await assert.rejects(postLogin({ id: 'student', password: 'wrong' }, options), error => error.response?.status === 401 && error.response.data.error.code === 'INVALID_CREDENTIALS');
  await assert.rejects(postLogin({ id: 7, password: 'digest' }, options), error => error.response?.status === 400);
  const errors = [];
  const request = createRequestRunner({ getAccessToken: () => success.accessToken, refresh: async () => false, onError: error => errors.push(error) });
  const profile = await request(config => getMyPrivateInfo({ ...options, ...config }));
  assert.equal(profile.private.email, 'student@example.com');
  await request(config => deleteLogout({}, { ...options, ...config }));
  await assert.rejects(request(config => getMyPrivateInfo({ ...options, ...config })), error => error.response?.status === 401 && error.response.data.error.code === 'SESSION_INVALID');
  assert.equal(errors.length, 1);
  assert.equal(cookie, 'menkakusitsu-refresh=');
  await assert.rejects(postRefresh({}, options), error => error.response?.status === 401);
} finally { await app.shutdown(); }
assert.equal(closed, true);
console.log('Generated web client -> real API routes verified (database double only).');
