import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
const report = JSON.parse(await readFile('entrega/resultados/playwright.json', 'utf8'));
const specs = [];
function collect(suites) {
  for (const suite of suites) { specs.push(...(suite.specs || [])); collect(suite.suites || []); }
}
collect(report.suites || []);
const tests = specs.flatMap(spec => spec.tests.map(test => ({ title: spec.title, project: test.projectName, status: test.status, results: test.results })));
if (tests.some(test => test.status !== 'expected')) throw new Error('Há testes sem aprovação; a entrega não será marcada como aprovada.');
await mkdir('entrega/playwright', { recursive: true });
const sample = tests.find(test => test.project === 'desktop' && test.title.startsWith('assistente organiza'));
if (!sample) throw new Error('Cenário do assistente não encontrado.');
for (const [name, filename] of [['trace', 'assistente-desktop.trace.zip'], ['video', 'assistente-desktop.webm']]) {
  const attachment = sample.results.at(-1).attachments.find(item => item.name === name);
  if (!attachment?.path) throw new Error(`Evidência ausente: ${name}`);
  await copyFile(attachment.path, `entrega/playwright/${filename}`);
}
const summary = {
  generatedAt: new Date().toISOString(),
  tool: 'Playwright Test',
  version: JSON.parse(await readFile('node_modules/@playwright/test/package.json', 'utf8')).version,
  browser: 'Chromium',
  passed: report.stats.expected,
  failed: report.stats.unexpected,
  skipped: report.stats.skipped,
  flaky: report.stats.flaky,
  durationMs: report.stats.duration,
  viewports: { desktop: '1440 x 1000', mobile: '390 x 844' },
  scenarios: tests.map(({ results, ...test }) => test),
  note: 'Contextos novos, sem login, chamados e relatos fictícios; emulação mobile em Chromium, não em dispositivo físico.'
};
await writeFile('entrega/resultados/playwright-resumo.json', JSON.stringify(summary, null, 2) + '\n');
console.log(`${summary.passed} testes Playwright aprovados; vídeo e trace copiados para entrega/playwright/.`);
