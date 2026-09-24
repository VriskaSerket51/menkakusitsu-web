import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { postLogin } from '../src/api/generated/client.ts';

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
  const options = { baseURL: `http://127.0.0.1:${server.address().port}` };
  const success = await postLogin({ id: 'student', password: 'digest' }, options);
  assert.equal(success.status, 0);
  assert.equal((await runtime.jwt.verifyJwt(success.accessToken)).uid, 7);
  await assert.rejects(postLogin({ id: 'student', password: 'wrong' }, options), error => error.response?.status === 401 && error.response.data.error.code === 'INVALID_CREDENTIALS');
  await assert.rejects(postLogin({ id: 7, password: 'digest' }, options), error => error.response?.status === 400);
} finally { await app.shutdown(); }
assert.equal(closed, true);
console.log('Generated web client -> real API routes verified (database double only).');
