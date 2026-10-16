import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const dialog = page => page.getByRole('dialog');
async function openCreation(page, mode) {
  await page.getByRole('button', { name: 'Novo chamado', exact: true }).click();
  await dialog(page).getByRole('button', { name: mode === 'assistant' ? /Assistente de TI SIMULAÇÃO/ : /Preencher formulário/ }).click();
}
test.beforeEach(async ({ page }) => {
  // Contextos novos: todos os chamados e arquivos gerados são fictícios.
  // Fontes externas são dispensáveis e ficam fora do trace da atividade.
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});

test('marca, busca, filtros, quadro e layout sem transbordamento', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await expect(page).toHaveTitle('Chamados · ECO-TI');
  await expect(page.getByRole('heading', { name: 'Central de chamados', exact: true })).toBeVisible();
  if (info.project.name === 'desktop') {
    await mkdir('entrega/prints', { recursive: true });
    await page.screenshot({ path: 'entrega/prints/01-central-eco-ti.png', fullPage: true });
  }
  await page.getByRole('searchbox', { name: 'Buscar chamados', exact: true }).fill('conexao');
  await expect(page.locator('.ticket-title')).toHaveCount(2);
  await page.getByRole('button', { name: 'Filtros', exact: true }).click();
  await page.locator('[data-filter="status"]').selectOption('Aberto');
  await expect(page.locator('.ticket-title')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Sem conexão com a rede do setor', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await page.getByRole('button', { name: 'Visualizar em quadro', exact: true }).click();
  await expect(page.locator('.kanban-column')).toHaveCount(4);
  await expect(page.locator('.kanban-card')).toHaveCount(12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('formulário manual, atribuição, comentário e persistência', async ({ page }) => {
  await openCreation(page, 'manual');
  await dialog(page).getByLabel('Assunto', { exact: false }).fill('Acesso ao ambiente fictício do laboratório');
  await dialog(page).getByLabel('Categoria', { exact: false }).selectOption('Acessos');
  await dialog(page).getByLabel('Prioridade', { exact: false }).selectOption('Alta');
  await dialog(page).getByLabel('Setor solicitante', { exact: false }).fill('Laboratório Demo');
  await dialog(page).getByLabel('Descrição', { exact: false }).fill('Solicitação fictícia de acesso ao sistema de treinamento para a apresentação do curso.');
  await dialog(page).getByRole('button', { name: 'Criar chamado', exact: true }).click();
  await expect(dialog(page)).toContainText('#TI-1049');
  await dialog(page).getByRole('combobox', { name: 'Status', exact: true }).selectOption('Em atendimento');
  await dialog(page).getByRole('combobox', { name: 'Responsável', exact: true }).selectOption('Julia Martins');
  await dialog(page).getByRole('combobox', { name: 'Dificuldade estimada', exact: true }).selectOption('Baixa');
  await dialog(page).getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(dialog(page)).toContainText('Atribuído a Julia Martins');
  await dialog(page).getByRole('button', { name: /Conversa/ }).click();
  await dialog(page).getByLabel('Mensagem para o chamado', { exact: true }).fill('Comentário fictício de acompanhamento do teste.');
  await dialog(page).getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(dialog(page)).toContainText('Comentário fictício de acompanhamento do teste.');
  await page.reload();
  await page.getByRole('button', { name: 'Acesso ao ambiente fictício do laboratório', exact: true }).click();
  await expect(dialog(page)).toContainText('Comentário fictício de acompanhamento do teste.');
  await expect(dialog(page).getByRole('combobox', { name: 'Status', exact: true })).toHaveValue('Em atendimento');
});

test('assistente organiza o relato, permite revisão e salva dicas', async ({ page }, info) => {
  await openCreation(page, 'assistant');
  await dialog(page).getByLabel('Sua resposta para o assistente', { exact: true }).fill('A internet do setor de treinamento caiu e não conseguimos trabalhar nos sistemas fictícios.');
  await dialog(page).getByRole('button', { name: 'Enviar resposta', exact: true }).click();
  await dialog(page).getByRole('button', { name: 'Minha equipe / meu setor', exact: true }).click();
  await dialog(page).getByRole('button', { name: 'Impede o trabalho', exact: true }).click();
  await dialog(page).getByRole('button', { name: 'Começou hoje, sem mensagem de erro', exact: true }).click();
  await dialog(page).getByRole('button', { name: 'Ainda não tentei nada', exact: true }).click();
  await dialog(page).getByRole('button', { name: 'Laboratório', exact: true }).click();
  await expect(dialog(page).getByRole('combobox', { name: 'Categoria', exact: true })).toHaveValue('Rede e internet');
  await expect(dialog(page).getByRole('combobox', { name: 'Equipe sugerida', exact: true })).toHaveValue('Infraestrutura');
  await expect(dialog(page).getByRole('combobox', { name: 'Prioridade sugerida', exact: true })).toHaveValue('Alta');
  await expect(dialog(page).getByRole('combobox', { name: 'Dificuldade estimada', exact: true })).toHaveValue('Alta');
  if (info.project.name === 'desktop') {
    await mkdir('entrega/prints', { recursive: true });
    await page.screenshot({ path: 'entrega/prints/02-assistente-eco-ti.png' });
  }
  await dialog(page).getByRole('combobox', { name: 'Prioridade sugerida', exact: true }).selectOption('Média');
  await dialog(page).getByRole('button', { name: 'Confirmar e criar chamado', exact: true }).click();
  await expect(dialog(page)).toContainText('Dica inicial de resolução');
  await expect(dialog(page)).toContainText('IA simulada');
  await expect(dialog(page).getByRole('combobox', { name: 'Prioridade', exact: true })).toHaveValue('Média');
  await dialog(page).getByText('Como a classificação foi sugerida', { exact: true }).click();
  await expect(dialog(page)).toContainText('Prioridade inicial: Alta');
  await page.reload();
  await page.getByRole('button', { name: 'Problema de conexão com a rede', exact: true }).click();
  await expect(dialog(page)).toContainText('Dica inicial de resolução');
  await expect(dialog(page).getByRole('combobox', { name: 'Prioridade', exact: true })).toHaveValue('Média');
});

test('relato vago, correção e migração ao formulário preservam os dados', async ({ page }) => {
  await openCreation(page, 'assistant');
  const narrative = 'Não funciona e eu não sei explicar o que aconteceu';
  await dialog(page).getByLabel('Sua resposta para o assistente', { exact: true }).fill(narrative);
  await dialog(page).getByLabel('Sua resposta para o assistente', { exact: true }).press('Enter');
  await expect(dialog(page)).toContainText('Vamos descobrir juntos');
  await dialog(page).getByRole('button', { name: 'Não sei dizer', exact: true }).click();
  await expect(dialog(page)).toContainText('Quem está sendo afetado');
  await dialog(page).getByRole('button', { name: 'Voltar uma resposta', exact: true }).click();
  await expect(dialog(page).getByRole('button', { name: 'Computador ou equipamento', exact: true })).toBeVisible();
  await dialog(page).getByRole('button', { name: 'Prefiro preencher o formulário', exact: false }).click();
  await expect(dialog(page).getByLabel('Descrição', { exact: false })).toHaveValue(new RegExp(narrative));
  await expect(dialog(page).getByLabel('Categoria', { exact: false })).toHaveValue('Outros');
});

test('visão do solicitante mostra apenas chamados próprios e oculta edição técnica', async ({ page }, info) => {
  await page.getByRole('button', { name: 'Trocar perfil de demonstração', exact: true }).click();
  await dialog(page).getByRole('button', { name: /^Solicitante / }).click();
  await expect(page.locator('.ticket-title')).toHaveCount(4);
  await page.getByRole('button', { name: 'Sem conexão com a rede do setor', exact: true }).click();
  await expect(dialog(page).getByRole('button', { name: 'Salvar alterações', exact: true })).toHaveCount(0);
  await expect(dialog(page).getByLabel('Mensagem para o chamado', { exact: true })).toBeVisible();
  await dialog(page).getByRole('button', { name: 'Fechar janela', exact: true }).click();
  if (info.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Meus chamados', exact: true })).toBeVisible();
    await page.getByRole('navigation').getByRole('button', { name: 'Meus chamados', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Meus chamados', exact: true })).toBeVisible();
  }
});
