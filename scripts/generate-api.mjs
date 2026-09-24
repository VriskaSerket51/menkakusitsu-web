import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from 'orval';
import config from '../orval.config.mjs';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));
const args = process.argv.slice(2);
const check = args.includes('--check');
const sourceIndex = args.indexOf('--source');
if (check && sourceIndex >= 0) throw new Error('--check cannot update the source document');
if (sourceIndex >= 0) {
  const source = args[sourceIndex + 1];
  if (!source || source.startsWith('--')) throw new Error('--source requires a local OpenAPI file path');
  const raw = await readFile(path.resolve(source), 'utf8');
  const document = JSON.parse(raw);
  if (!document.openapi || !document.paths) throw new Error('Not an OpenAPI document');
  await mkdir('contracts', { recursive: true });
  await writeFile('contracts/openapi.json', JSON.stringify(document, null, 2) + '\n');
}
async function snapshot() {
  const root = 'src/api/generated';
  const files = (await readdir(root, { recursive: true })).filter(file => file.endsWith('.ts')).sort();
  return Promise.all(files.map(async file => [file, await readFile(path.join(root, file), 'utf8')]));
}
const before = check ? await snapshot() : undefined;
await generate(config.api, process.cwd(), { throwOnError: true });
if (check && JSON.stringify(before) !== JSON.stringify(await snapshot())) {
  throw new Error('Generated client was stale. Review the regenerated files.');
}
