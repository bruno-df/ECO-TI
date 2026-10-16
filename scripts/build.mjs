import { mkdir, cp, rm } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of ['index.html', 'favicon.svg', 'src']) {
  await cp(new URL(entry, root), new URL(entry, output), { recursive: true });
}
console.log('Build concluído: dist/ — somente arquivos estáticos.');
