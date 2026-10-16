export const CURRENT_USER = 'Bruno Fonteles';
export const STATUSES = ['Aberto', 'Em atendimento', 'Aguardando', 'Resolvido'];
export const PRIORITIES = ['Baixa', 'Média', 'Alta', 'Urgente'];
export const DIFFICULTIES = ['Baixa', 'Média', 'Alta', 'A avaliar'];
export const CATEGORIES = ['Hardware', 'Software', 'Rede e internet', 'Acessos', 'Impressoras', 'Outros'];
export const TEAMS = [
  { name: 'Suporte técnico', description: 'Equipamentos e suporte ao usuário', icon: 'monitor', members: ['Ana Costa', 'Pedro Santos'], color: 'green' },
  { name: 'Infraestrutura', description: 'Redes, conectividade e servidores', icon: 'network', members: ['Lucas Oliveira', 'Mariana Lima'], color: 'blue' },
  { name: 'Sistemas e acessos', description: 'Aplicações, contas e permissões', icon: 'code', members: ['Julia Martins', 'Rafael Souza'], color: 'purple' }
];
export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const initials = name => name.split(' ').map(part => part[0]).slice(0, 2).join('');
export function seedTickets(now = new Date()) {
  const rows = [
    ['Computador não liga após atualização', 'Hardware', 'Em atendimento', 'Alta', 'Ana Costa', 'Suporte técnico', 'Carla Mendes', 'Financeiro', 18, 'O computador da estação 04 não inicia depois da atualização. A luz de energia acende, mas o monitor permanece sem sinal. Já conferi os cabos e tentei reiniciar.'],
    ['Sem conexão com a rede do setor', 'Rede e internet', 'Aberto', 'Urgente', '', 'Infraestrutura', 'Bruno Fonteles', 'Administrativo', 42, 'As estações do setor administrativo estão sem acesso à rede desde esta manhã. A conexão está indisponível mesmo após reiniciar o equipamento.'],
    ['Solicitação de acesso ao sistema interno', 'Acessos', 'Aberto', 'Média', '', 'Sistemas e acessos', 'Fernanda Rocha', 'Recursos Humanos', 75, 'Preciso de acesso ao módulo de consulta do sistema interno para executar as atividades do setor. Solicito análise das permissões necessárias.'],
    ['Impressora apresentando erro de conexão', 'Impressoras', 'Aguardando', 'Média', 'Pedro Santos', 'Suporte técnico', 'Marcos Almeida', 'Protocolo', 130, 'A impressora compartilhada apresenta a mensagem offline e não recebe documentos. O equipamento está ligado e sem papel preso.'],
    ['Instalação de software de videoconferência', 'Software', 'Em atendimento', 'Baixa', 'Julia Martins', 'Sistemas e acessos', 'Bruno Fonteles', 'Administrativo', 190, 'Solicito a instalação de um aplicativo de videoconferência aprovado para participar das reuniões do setor.'],
    ['Redefinição de senha do e-mail', 'Acessos', 'Resolvido', 'Média', 'Rafael Souza', 'Sistemas e acessos', 'Patricia Alves', 'Planejamento', 260, 'Não consigo acessar o e-mail de demonstração. A mensagem informa que a senha expirou. Solicito a redefinição.'],
    ['Monitor com imagem intermitente', 'Hardware', 'Aberto', 'Média', 'Ana Costa', 'Suporte técnico', 'Daniel Ribeiro', 'Financeiro', 340, 'O monitor apresenta oscilações durante o uso, mesmo após conferir o cabo de vídeo.'],
    ['Acesso à pasta compartilhada', 'Acessos', 'Aguardando', 'Baixa', 'Julia Martins', 'Sistemas e acessos', 'Bruno Fonteles', 'Administrativo', 480, 'Solicito acesso de leitura à pasta de documentos de demonstração da equipe. Aguardando validação do responsável pelo setor.'],
    ['Rede Wi-Fi instável na sala de reuniões', 'Rede e internet', 'Em atendimento', 'Alta', 'Lucas Oliveira', 'Infraestrutura', 'Camila Ferreira', 'Planejamento', 630, 'A conexão cai durante reuniões na sala 02. O problema ocorre com diferentes equipamentos.'],
    ['Atualização do navegador', 'Software', 'Resolvido', 'Baixa', 'Julia Martins', 'Sistemas e acessos', 'Thiago Gomes', 'Protocolo', 850, 'O navegador está desatualizado e não abre algumas páginas do ambiente de treinamento.'],
    ['Troca de teclado com defeito', 'Hardware', 'Resolvido', 'Baixa', 'Pedro Santos', 'Suporte técnico', 'Bruno Fonteles', 'Administrativo', 1300, 'Algumas teclas não funcionam e estão prejudicando a digitação. Solicito a substituição do teclado.'],
    ['Configuração de estação de trabalho', 'Outros', 'Aberto', 'Média', '', 'Suporte técnico', 'Beatriz Nunes', 'Recursos Humanos', 1450, 'Precisamos configurar uma estação de trabalho para uma pessoa que chega ao setor na próxima semana.']
  ];
  return rows.map((row, index) => {
    const [title, category, status, priority, assignee, team, requester, department, minutes, description] = row;
    const createdAt = new Date(now.getTime() - (minutes + 180) * 60000).toISOString();
    const updatedAt = new Date(now.getTime() - minutes * 60000).toISOString();
    return { id: 1048 - index, title, category, status, priority, assignee, team, requester, department, description, email: 'pessoa@exemplo.invalid', createdAt, updatedAt, attachments: [], comments: [], history: [{ text: 'Chamado criado', actor: requester, date: createdAt }, ...(status !== 'Aberto' ? [{ text: `Status alterado para ${status.toLowerCase()}`, actor: assignee || 'Equipe de TI', date: updatedAt }] : [])] };
  });
}
export function filterTickets(tickets, filters = {}) {
  const term = normalize(filters.search || '');
  const result = tickets.filter(ticket => {
    if (filters.scope === 'mine' && ticket.requester !== CURRENT_USER) return false;
    if (filters.scope === 'unassigned' && ticket.assignee) return false;
    if (filters.scope === 'resolved' && ticket.status !== 'Resolvido') return false;
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.category && ticket.category !== filters.category) return false;
    if (filters.team && ticket.team !== filters.team) return false;
    return !term || normalize([`#TI-${ticket.id}`, ticket.title, ticket.requester, ticket.category, ticket.assignee, ticket.department, ticket.team].join(' ')).includes(term);
  });
  return result.sort((a, b) => filters.sort === 'priority' ? PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority) || new Date(b.updatedAt) - new Date(a.updatedAt) : filters.sort === 'oldest' ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.updatedAt) - new Date(a.updatedAt));
}
export function createTicket(input, tickets, now = new Date()) {
  const title = String(input.title || '').trim();
  const description = String(input.description || '').trim();
  const department = String(input.department || '').trim();
  if (title.length < 5 || title.length > 120) throw new Error('O assunto deve ter entre 5 e 120 caracteres.');
  if (description.length < 15 || description.length > 4000) throw new Error('A descrição deve ter entre 15 e 4.000 caracteres.');
  if (!department || department.length > 100) throw new Error('Informe um setor com até 100 caracteres.');
  if (!CATEGORIES.includes(input.category) || !PRIORITIES.includes(input.priority) || !TEAMS.some(team => team.name === input.team)) throw new Error('Selecione uma categoria, prioridade e equipe válidas.');
  if (input.difficulty && !DIFFICULTIES.includes(input.difficulty)) throw new Error('Selecione uma dificuldade válida.');
  if (input.aiAnalysis && !isAssistantAnalysis(input.aiAnalysis)) throw new Error('A análise demonstrativa está incompleta. Reabra o assistente.');
  const date = now.toISOString();
  return { id: Math.max(1000, ...tickets.map(ticket => ticket.id)) + 1, title, description, department, category: input.category, priority: input.priority, difficulty: input.difficulty || 'A avaliar', team: input.team, status: 'Aberto', assignee: '', requester: CURRENT_USER, email: 'bruno@exemplo.invalid', createdAt: date, updatedAt: date, attachments: input.attachments || [], comments: [], history: [{ text: 'Chamado criado', actor: CURRENT_USER, date }, ...(input.aiAnalysis ? [{ text: 'Classificação sugerida pelo assistente demonstrativo e revisada pelo solicitante', actor: CURRENT_USER, date }] : [])], ...(input.aiAnalysis ? { aiAnalysis: input.aiAnalysis } : {}) };
}
export function updateTicket(ticket, updates, actor = CURRENT_USER, now = new Date()) {
  const date = now.toISOString();
  const changes = [];
  if (!STATUSES.includes(updates.status)) throw new Error('Status inválido.');
  if (!PRIORITIES.includes(updates.priority)) throw new Error('Prioridade inválida.');
  if (updates.difficulty !== undefined && !DIFFICULTIES.includes(updates.difficulty)) throw new Error('Dificuldade inválida.');
  const team = TEAMS.find(team => team.name === updates.team);
  if (!team || updates.assignee && !team.members.includes(updates.assignee)) throw new Error('Responsável incompatível com a equipe.');
  for (const key of ['status', 'priority', 'team', 'assignee', 'difficulty']) {
    if (key === 'difficulty' && updates[key] === undefined) continue;
    if (updates[key] === ticket[key]) continue;
    const text = key === 'status' ? `Status alterado para ${updates[key].toLowerCase()}` : key === 'priority' ? `Prioridade alterada para ${updates[key].toLowerCase()}` : key === 'difficulty' ? `Dificuldade alterada para ${updates[key].toLowerCase()}` : key === 'team' ? `Encaminhado para ${updates[key]}` : updates[key] ? `Atribuído a ${updates[key]}` : 'Responsável removido';
    changes.push({ text, actor, date });
  }
  return changes.length ? { ...ticket, ...updates, updatedAt: date, history: [...ticket.history, ...changes] } : ticket;
}
export function addComment(ticket, body, now = new Date()) {
  const text = String(body || '').trim();
  if (!text || text.length > 2000) throw new Error('Escreva uma mensagem com até 2.000 caracteres.');
  const date = now.toISOString();
  return { ...ticket, updatedAt: date, comments: [...ticket.comments, { body: text, author: CURRENT_USER, date }], history: [...ticket.history, { text: 'Comentário adicionado', actor: CURRENT_USER, date }] };
}
export function metrics(tickets) {
  return { total: tickets.length, open: tickets.filter(t => t.status === 'Aberto').length, progress: tickets.filter(t => t.status === 'Em atendimento').length, waiting: tickets.filter(t => t.status === 'Aguardando').length, resolved: tickets.filter(t => t.status === 'Resolvido').length };
}
export function isTicketData(value) {
  return Array.isArray(value) && value.length <= 5000 && value.every(t => t && Number.isSafeInteger(t.id) && t.id > 0 && typeof t.title === 'string' && t.title.length <= 120 && typeof t.description === 'string' && typeof t.requester === 'string' && typeof t.department === 'string' && typeof t.email === 'string' && typeof t.assignee === 'string' && CATEGORIES.includes(t.category) && STATUSES.includes(t.status) && PRIORITIES.includes(t.priority) && (t.difficulty === undefined || DIFFICULTIES.includes(t.difficulty)) && (t.aiAnalysis === undefined || isAssistantAnalysis(t.aiAnalysis)) && TEAMS.some(team => team.name === t.team) && Number.isFinite(Date.parse(t.createdAt)) && Number.isFinite(Date.parse(t.updatedAt)) && Array.isArray(t.attachments) && t.attachments.every(a => a && typeof a.name === 'string' && Number.isFinite(a.size)) && Array.isArray(t.comments) && t.comments.every(c => c && typeof c.body === 'string' && typeof c.author === 'string' && Number.isFinite(Date.parse(c.date))) && Array.isArray(t.history) && t.history.every(h => h && typeof h.text === 'string' && typeof h.actor === 'string' && Number.isFinite(Date.parse(h.date))));
}
export function isAssistantAnalysis(value) {
  return Boolean(value && value.mode === 'simulated' && value.reviewed === true && CATEGORIES.includes(value.category) && PRIORITIES.includes(value.priority) && DIFFICULTIES.includes(value.difficulty) && TEAMS.some(team => team.name === value.team) && ['categoryReason', 'priorityReason', 'difficultyReason', 'originalProblem'].every(key => typeof value[key] === 'string' && value[key].length <= 1000) && Array.isArray(value.tipSteps) && value.tipSteps.length > 0 && value.tipSteps.length <= 5 && value.tipSteps.every(step => typeof step === 'string' && step.length <= 500));
}
