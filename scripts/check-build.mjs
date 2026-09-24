import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { matchRoutes } from 'react-router';

const base = new URL('../dist/client/', import.meta.url);
const html = await readFile(new URL('index.html', base), 'utf8');
assert.ok(html.includes('"ssr":false') && html.includes('"isSpaMode":true'), 'Expected a static SPA build');
const assets = await readdir(new URL('assets/', base));
const filename = assets.find(file => /^manifest-.*\.js$/.test(file));
assert.ok(filename, 'React Router browser manifest is missing');
const source = await readFile(new URL('assets/' + filename, base), 'utf8');
const manifest = JSON.parse(source.slice(source.indexOf('=') + 1).trim().replace(/;$/, ''));
const pages = await readdir(new URL('../src/routes/', import.meta.url), { recursive: true });
for (const file of pages.filter(file => /\.tsx$/.test(file))) {
  const id = 'routes/' + file.replaceAll('\\', '/').replace(/\.tsx$/, '');
  assert.ok(manifest.routes[id], 'Page missing from router: ' + id);
}
for (const asset of [manifest.entry, ...Object.values(manifest.routes)]) {
  for (const file of [asset.module, ...(asset.imports ?? []), ...(asset.css ?? [])]) {
    await access(new URL('.' + file, base));
  }
}
const tree = parent => Object.values(manifest.routes).filter(route => route.parentId === parent).map(route => ({ ...route, children: tree(route.id) }));
const routes = tree(undefined);
const urls = JSON.parse(await readFile(new URL('../test/fixtures/route-urls.json', import.meta.url), 'utf8'));
for (const pattern of urls) {
  const url = pattern.replace(':board', 'feedback').replace(':postId', '123');
  const matches = matchRoutes(routes, url);
  assert.ok(matches?.length && matches.at(-1).route.id !== 'routes/not-found', 'Original URL no longer matches: ' + url);
  if (url.startsWith('/bbs/')) assert.equal(matches.at(-1).params.board, 'feedback');
}
assert.equal(matchRoutes(routes, '/not-a-route').at(-1).route.id, 'routes/not-found');
const protectedPages = ['routes/chat/idbot', 'routes/bbs/edit', 'routes/specialroom/management'];
const entryImports = new Set([manifest.entry.module, ...(manifest.entry.imports ?? []), manifest.routes['routes/app-layout'].module, ...(manifest.routes['routes/app-layout'].imports ?? [])]);
for (const id of protectedPages) assert.ok(!entryImports.has(manifest.routes[id].module), 'Page was eagerly bundled: ' + id);
assert.equal(new Set(protectedPages.map(id => manifest.routes[id].module)).size, protectedPages.length);
console.log('SPA build verified: ' + urls.length + ' existing URLs, assets, fallback and separate route chunks.');
