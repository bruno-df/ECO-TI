import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

mkdirSync('entrega/resultados', { recursive: true });
const results = [];
for (const file of readdirSync('src').filter(file => file.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', `src/${file}`], { encoding: 'utf8' });
  results.push({ command: `node --check src/${file}`, exitCode: result.status });
  if (result.status !== 0) { console.error(result.stderr); process.exit(1); }
}
writeFileSync('entrega/resultados/sintaxe.txt', results.map(result => `${result.command}: APROVADO (exit ${result.exitCode})`).join('\n') + '\n');
const files = readdirSync('tests').filter(file => file.endsWith('.test.mjs')).map(file => `tests/${file}`);
const unit = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...files], { encoding: 'utf8' });
writeFileSync('entrega/resultados/unitarios.tap', unit.stdout + unit.stderr);
if (unit.status !== 0) { console.error(unit.stdout, unit.stderr); process.exit(1); }
const build = spawnSync(process.execPath, ['scripts/build.mjs'], { encoding: 'utf8' });
writeFileSync('entrega/resultados/build.txt', build.stdout + build.stderr);
if (build.status !== 0) { console.error(build.stdout, build.stderr); process.exit(1); }
const hash = createHash('sha256');
for (const file of [...readdirSync('src').filter(file => file.endsWith('.js') || file.endsWith('.css')).map(file => `src/${file}`), 'index.html', 'package.json', 'package-lock.json', 'playwright.config.js', 'tests/e2e/eco-ti.spec.js', ...files].sort()) {
  hash.update(file); hash.update(readFileSync(file));
}
const summary = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  platform: `${process.platform}/${process.arch}`,
  syntax: { status: 'passed', files: results.length },
  unit: { status: 'passed', tests: Number(unit.stdout.match(/# tests (\d+)/)?.[1]), exitCode: unit.status },
  build: { status: 'passed', directory: 'dist', exitCode: build.status },
  verifiedFilesSha256: hash.digest('hex')
};
writeFileSync('entrega/resultados/locais-resumo.json', JSON.stringify(summary, null, 2) + '\n');
console.log(`Sintaxe aprovada; ${summary.unit.tests} testes unitários aprovados; build gerado em dist/.`);
