import { readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const baseURL = process.env.ECO_BASE_URL;
if (!baseURL || new URL(baseURL).protocol !== 'https:') throw new Error('Defina ECO_BASE_URL com a URL HTTPS da demonstração.');
const sha256 = data => createHash('sha256').update(data).digest('hex');
const files = await readdir('dist', { recursive: true, withFileTypes: true });
const comparisons = [];
for (const item of files.filter(item => item.isFile())) {
  const localPath = `${item.parentPath}/${item.name}`.replaceAll('\\', '/');
  const path = localPath.slice(localPath.lastIndexOf('dist/') + 5);
  const response = await fetch(new URL(path, baseURL));
  const remote = Buffer.from(await response.arrayBuffer());
  const local = await readFile(localPath);
  comparisons.push({ path, status: response.status, sha256: sha256(remote), matchesBuild: remote.equals(local) });
}
if (comparisons.some(item => item.status !== 200 || !item.matchesBuild)) throw new Error(`Publicação diferente do build: ${JSON.stringify(comparisons)}`);

const preservedPaths = ['entrega/resultados/playwright.json', 'entrega/prints/01-central-eco-ti.png', 'entrega/prints/02-assistente-eco-ti.png'];
const preserved = await Promise.all(preservedPaths.map(async path => [path, await readFile(path)]));
let result;
try {
  result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test'], { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  const report = JSON.parse(await readFile('entrega/resultados/playwright.json', 'utf8'));
  await writeFile('entrega/resultados/playwright-publicado.json', JSON.stringify(report, null, 2) + '\n');
  if (result.status !== 0 || report.stats.unexpected || report.stats.flaky || report.stats.expected !== 10) throw new Error('A suíte publicada não aprovou todos os dez testes.');
  await copyFile('entrega/prints/01-central-eco-ti.png', 'entrega/prints/03-central-publicada.png');
  await copyFile('entrega/prints/02-assistente-eco-ti.png', 'entrega/prints/04-assistente-publicado.png');
  const specs = [];
  function collect(suites) { for (const suite of suites) { specs.push(...(suite.specs || [])); collect(suite.suites || []); } }
  collect(report.suites);
  const sample = specs.find(spec => spec.title.startsWith('assistente organiza')).tests.find(test => test.projectName === 'desktop');
  for (const [name, filename] of [['trace', 'assistente-publicado.trace.zip'], ['video', 'assistente-publicado.webm']]) {
    const attachment = sample.results.at(-1).attachments.find(item => item.name === name);
    if (!attachment?.path) throw new Error(`Evidência ausente: ${name}`);
    await copyFile(attachment.path, `entrega/playwright/${filename}`);
  }
  await writeFile('entrega/resultados/publicacao-verificada.json', JSON.stringify({
    verifiedAt: new Date().toISOString(), baseURL, authenticated: false,
    sourceCommit: spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim(),
    method: 'Vercel Drop: envio do build estático, sem vínculo Git automático',
    files: comparisons,
    playwright: { passed: report.stats.expected, failed: report.stats.unexpected, skipped: report.stats.skipped, flaky: report.stats.flaky, durationMs: report.stats.duration },
    note: 'Chromium desktop e mobile, contextos novos, dados fictícios. Evidências locais anteriores preservadas.'
  }, null, 2) + '\n');
  console.log(`Publicação verificada: ${comparisons.length} arquivos idênticos ao build e ${report.stats.expected} testes aprovados em ${baseURL}`);
} finally {
  await Promise.all(preserved.map(([path, data]) => writeFile(path, data)));
}
