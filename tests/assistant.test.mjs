import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyProblem, analyzeRequest, startConversation, replyToAssistant, suggestResolution } from '../src/assistant.js';
import { createTicket, updateTicket, isTicketData, seedTickets } from '../src/domain.js';

const answers = { problem: 'A internet caiu no setor e não conseguimos abrir os sistemas.', scope: 'Minha equipe / meu setor', impact: 'Impede o trabalho', timing: 'Começou hoje de manhã, sem mensagem de erro.', attempts: 'Ainda não tentei nada', department: 'Financeiro' };

test('relatos comuns são classificados em categorias e equipes existentes', () => {
  for (const [problem, category, team] of [
    ['A impressora não imprime', 'Impressoras', 'Suporte técnico'],
    ['Estou sem conexão com a internet', 'Rede e internet', 'Infraestrutura'],
    ['Minha senha não funciona no sistema', 'Acessos', 'Sistemas e acessos'],
    ['Meu computador não liga', 'Hardware', 'Suporte técnico'],
    ['Preciso instalar um aplicativo', 'Software', 'Sistemas e acessos']
  ]) {
    assert.equal(classifyProblem(problem).category, category);
    assert.equal(classifyProblem(problem).team, team);
  }
});
test('equipamentos e sistemas citados como contexto não desviam a categoria principal', () => {
  assert.equal(classifyProblem('Minha senha não funciona no computador').category, 'Acessos');
  assert.equal(classifyProblem('A impressora não conecta à rede').category, 'Impressoras');
  assert.equal(classifyProblem('Estou sem acesso à internet').category, 'Rede e internet');
  assert.equal(classifyProblem('O computador não liga depois da atualização do sistema').category, 'Hardware');
  assert.equal(classifyProblem('Não consigo entrar no sistema').category, 'Acessos');
});
test('relato vago pede esclarecimento e permite não saber a resposta', () => {
  let chat = replyToAssistant(startConversation(), 'Não funciona e eu não sei o que fazer');
  assert.equal(chat.stage, 'clarify');
  chat = replyToAssistant(chat, 'Não sei dizer');
  assert.equal(chat.stage, 'scope');
  assert.equal(analyzeRequest(chat.answers).category, 'Outros');
});
test('conversa gera resumo para revisão sem criar chamado automaticamente', () => {
  let chat = startConversation();
  for (const answer of Object.values(answers)) chat = replyToAssistant(chat, answer);
  assert.equal(chat.stage, 'review');
  const result = analyzeRequest(chat.answers);
  assert.equal(result.department, 'Financeiro');
  assert.equal(result.category, 'Rede e internet');
  assert.ok(result.description.includes(answers.problem));
  assert.ok(result.description.includes(answers.attempts));
  assert.ok(result.tipSteps.length);
  assert.equal(result.id, undefined);
});
test('prioridade combina alcance e impacto, incluindo solicitações planejadas', () => {
  for (const [scope, impact, expected] of [
    ['Vários setores da organização', 'Impede o trabalho', 'Urgente'],
    ['Minha equipe / meu setor', 'Impede o trabalho', 'Alta'],
    ['Só eu', 'Impede o trabalho', 'Alta'],
    ['Vários setores da organização', 'Dificulta, mas consigo trabalhar', 'Alta'],
    ['Só eu', 'Dificulta, mas consigo trabalhar', 'Média'],
    ['Vários setores da organização', 'Solicitação planejada, posso aguardar', 'Baixa'],
    ['Só eu', 'Não impede o trabalho', 'Baixa']
  ]) assert.equal(analyzeRequest({ ...answers, scope, impact }).priority, expected);
});
test('a palavra urgente sozinha não força prioridade máxima', () => {
  const result = analyzeRequest({ ...answers, problem: 'URGENTE preciso instalar um programa', scope: 'Só eu', impact: 'Solicitação planejada, posso aguardar' });
  assert.equal(result.priority, 'Baixa');
});
test('dificuldade técnica e prioridade de atendimento são independentes', () => {
  const result = analyzeRequest({ ...answers, problem: 'Minha senha expirou e não consigo entrar', scope: 'Só eu' });
  assert.equal(result.priority, 'Alta');
  assert.equal(result.difficulty, 'Baixa');
  assert.equal(analyzeRequest(answers).difficulty, 'Alta');
});
test('incerteza permanece explícita e não inventa diagnóstico', () => {
  const result = analyzeRequest({ problem: 'Não funciona e não sei explicar', clarify: 'Não sei dizer', scope: 'Não sei dizer', impact: 'Não sei dizer' });
  assert.equal(result.category, 'Outros');
  assert.equal(result.difficulty, 'A avaliar');
  assert.equal(result.priority, 'Média');
  assert.match(result.priorityReason, /validar/);
});
test('mensagens vazias, excessivas e envios depois da revisão são rejeitados', () => {
  assert.throws(() => replyToAssistant(startConversation(), 'abc'));
  assert.throws(() => replyToAssistant(startConversation(), 'x'.repeat(1001)));
  assert.throws(() => replyToAssistant({ stage: 'review', answers, messages: [] }, 'outra mensagem'));
});
test('sinais de risco priorizam avaliação e evitam orientações de reinicialização', () => {
  for (const problem of ['O computador está com cheiro de queimado', 'Recebi um anexo suspeito com possível vírus']) {
    const result = analyzeRequest({ ...answers, problem, impact: 'Solicitação planejada, posso aguardar' });
    assert.equal(result.priority, 'Alta');
    assert.equal(result.difficulty, 'Alta');
    assert.ok(!suggestResolution(result.category, problem).some(step => /reinici|reabr|ligue/.test(step)));
  }
});
test('análise revisada, dicas e dificuldade sobrevivem à serialização sem quebrar registros antigos', () => {
  const analysis = analyzeRequest(answers);
  const ticket = createTicket({ ...analysis, aiAnalysis: { ...analysis, reviewed: true } }, seedTickets());
  const restored = JSON.parse(JSON.stringify([ticket, ...seedTickets()]));
  assert.ok(isTicketData(restored));
  assert.equal(restored[0].aiAnalysis.mode, 'simulated');
  assert.equal(restored[0].difficulty, 'Alta');
  assert.ok(restored[0].history.some(event => event.text.includes('revisada pelo solicitante')));
  assert.deepEqual(restored[0].aiAnalysis.tipSteps, analysis.tipSteps);
});
test('metadados sem revisão ou com dicas corrompidas são rejeitados', () => {
  const analysis = analyzeRequest(answers);
  assert.throws(() => createTicket({ ...analysis, aiAnalysis: analysis }, seedTickets()), /incompleta/);
  assert.throws(() => createTicket({ ...analysis, aiAnalysis: { ...analysis, reviewed: true, tipSteps: [null] } }, seedTickets()), /incompleta/);
});
test('revisão humana preserva sugestões originais e registra correção da dificuldade', () => {
  const analysis = analyzeRequest(answers);
  const ticket = createTicket({ ...analysis, priority: 'Média', difficulty: 'Média', aiAnalysis: { ...analysis, reviewed: true } }, seedTickets());
  assert.equal(ticket.priority, 'Média');
  assert.equal(ticket.aiAnalysis.priority, 'Alta');
  const updated = updateTicket(ticket, { status: ticket.status, priority: ticket.priority, team: ticket.team, assignee: '', difficulty: 'Baixa' });
  assert.equal(updated.difficulty, 'Baixa');
  assert.match(updated.history.at(-1).text, /Dificuldade alterada/);
});
test('responder preserva o estado anterior para poder corrigir uma resposta', () => {
  const before = startConversation();
  const after = replyToAssistant(before, 'Meu notebook não liga');
  assert.equal(before.stage, 'problem');
  assert.deepEqual(before.answers, {});
  assert.equal(before.messages.length, 1);
  assert.equal(after.stage, 'scope');
  assert.equal(after.messages.length, 3);
});
