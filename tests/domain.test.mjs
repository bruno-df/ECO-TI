import test from 'node:test';
import assert from 'node:assert/strict';
import { seedTickets, createTicket, updateTicket, addComment, filterTickets, metrics, isTicketData } from '../src/domain.js';
const now = new Date('2026-10-16T16:00:00Z');
const seed = () => seedTickets(now);
const input = { title: 'Teste de conexão do laboratório', description: 'A conexão do laboratório está indisponível desde esta manhã.', department: 'Laboratório', category: 'Rede e internet', priority: 'Alta', team: 'Infraestrutura' };

test('os 12 dados de demonstração têm identificadores únicos e estrutura válida', () => {
  const tickets = seed();
  assert.equal(tickets.length, 12);
  assert.equal(new Set(tickets.map(t => t.id)).size, 12);
  assert.ok(isTicketData(tickets));
});
test('criação gera protocolo único e histórico com o solicitante', () => {
  const tickets = seed();
  const ticket = createTicket(input, tickets, now);
  assert.equal(ticket.id, 1049);
  assert.equal(ticket.status, 'Aberto');
  assert.equal(ticket.assignee, '');
  assert.equal(ticket.history[0].actor, 'Bruno Fonteles');
  assert.ok(isTicketData([...tickets, ticket]));
});
test('formulário rejeita assuntos curtos, descrições insuficientes e opções desconhecidas', () => {
  assert.throws(() => createTicket({ ...input, title: 'abc' }, seed()), /assunto/);
  assert.throws(() => createTicket({ ...input, description: 'Curta' }, seed()), /descrição/);
  assert.throws(() => createTicket({ ...input, department: '' }, seed()), /setor/);
  assert.throws(() => createTicket({ ...input, priority: 'Inválida' }, seed()), /válidas/);
});
test('encaminhamento registra equipe, responsável e mudança de status', () => {
  const ticket = seed()[0];
  const updated = updateTicket(ticket, { team: 'Infraestrutura', assignee: 'Lucas Oliveira', status: 'Aguardando', priority: 'Urgente' }, 'Bruno Fonteles', now);
  assert.equal(updated.history.length, ticket.history.length + 4);
  assert.equal(updated.team, 'Infraestrutura');
  assert.equal(updated.assignee, 'Lucas Oliveira');
  assert.equal(updated.updatedAt, now.toISOString());
  assert.ok(updated.history.some(h => h.text === 'Encaminhado para Infraestrutura'));
  assert.equal(ticket.team, 'Suporte técnico');
});
test('responsável deve fazer parte da equipe de destino', () => {
  assert.throws(() => updateTicket(seed()[0], { team: 'Infraestrutura', assignee: 'Ana Costa', status: 'Aberto', priority: 'Alta' }), /incompatível/);
});
test('salvar sem mudanças não cria eventos artificiais', () => {
  const ticket = seed()[0];
  assert.equal(updateTicket(ticket, { team: ticket.team, assignee: ticket.assignee, status: ticket.status, priority: ticket.priority }), ticket);
});
test('comentário preserva histórico e rejeita mensagens vazias ou longas', () => {
  const ticket = seed()[0];
  const changed = addComment(ticket, '  Equipamento verificado pela equipe.  ', now);
  assert.equal(changed.comments[0].body, 'Equipamento verificado pela equipe.');
  assert.equal(changed.history.at(-1).text, 'Comentário adicionado');
  assert.equal(ticket.comments.length, 0);
  assert.throws(() => addComment(ticket, '   '));
  assert.throws(() => addComment(ticket, 'x'.repeat(2001)));
});
test('busca não diferencia acentos e encontra protocolo ou solicitante', () => {
  assert.equal(filterTickets(seed(), { search: 'conexao' }).length, 2);
  assert.equal(filterTickets(seed(), { search: '#TI-1048' })[0].id, 1048);
  assert.equal(filterTickets(seed(), { search: 'Bruno' }).length, 4);
});
test('filtros podem ser combinados sem alterar os dados originais', () => {
  const tickets = seed();
  const before = tickets.map(t => t.id);
  const filtered = filterTickets(tickets, { category: 'Acessos', status: 'Aberto', scope: 'unassigned' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 1046);
  assert.deepEqual(tickets.map(t => t.id), before);
});
test('meus chamados inclui somente solicitações do perfil atual', () => {
  const filtered = filterTickets(seed(), { scope: 'mine' });
  assert.equal(filtered.length, 4);
  assert.ok(filtered.every(t => t.requester === 'Bruno Fonteles'));
});
test('ordenação por prioridade coloca urgente antes de alta, média e baixa', () => {
  const filtered = filterTickets(seed(), { sort: 'priority' });
  assert.equal(filtered[0].priority, 'Urgente');
  assert.equal(filtered.at(-1).priority, 'Baixa');
});
test('indicadores refletem o fluxo e são consistentes para uma lista vazia', () => {
  assert.deepEqual(metrics(seed()), { total: 12, open: 4, progress: 3, waiting: 2, resolved: 3 });
  assert.deepEqual(metrics([]), { total: 0, open: 0, progress: 0, waiting: 0, resolved: 0 });
});
test('serialização preserva chamados, comentários e histórico', () => {
  const tickets = [addComment(createTicket(input, seed(), now), 'Comentário de evidência.', now), ...seed()];
  const restored = JSON.parse(JSON.stringify(tickets));
  assert.ok(isTicketData(restored));
  assert.deepEqual(restored, tickets);
});
test('dados locais corrompidos são identificados antes de renderizar', () => {
  assert.equal(isTicketData({}), false);
  assert.equal(isTicketData([{ id: 1049 }]), false);
  assert.equal(isTicketData([{ ...seed()[0], history: [null] }]), false);
  assert.equal(isTicketData([{ ...seed()[0], updatedAt: 'data inválida' }]), false);
});
